import { parseFrontmatter } from './content-files';
import { HISTORY_PATH, historyLine, parseHistory, type HistoryEntry } from './history';

const API = 'https://api.github.com';
const ADMIN_CACHE_TTL_MS = 30_000;

type CacheEntry<T> = { at: number; data: T };
const adminCache = new Map<string, CacheEntry<unknown>>();

function cacheGet<T>(key: string): T | null {
	const hit = adminCache.get(key);
	if (!hit || Date.now() - hit.at > ADMIN_CACHE_TTL_MS) return null;
	return hit.data as T;
}

function cacheSet<T>(key: string, data: T) {
	adminCache.set(key, { at: Date.now(), data });
}

export function invalidateAdminCache(keys?: string[]) {
	if (!keys) {
		adminCache.clear();
		return;
	}
	for (const key of keys) {
		if (key.endsWith('*')) {
			const prefix = key.slice(0, -1);
			for (const cached of adminCache.keys()) {
				if (cached.startsWith(prefix)) adminCache.delete(cached);
			}
		} else {
			adminCache.delete(key);
		}
	}
}

export type GithubFile = {
	path: string;
	content: string | Uint8Array;
};

export type GithubJournal = {
	id: string;
	title: string;
	emoji?: string;
	order?: number;
};

export type GithubPost = {
	id: string;
	title: string;
	journal: string;
	pubDate: string;
	draft: boolean;
	body?: string;
};

function config() {
	const token = import.meta.env.GITHUB_TOKEN || process.env.GITHUB_TOKEN;
	const repo = import.meta.env.GITHUB_REPO || process.env.GITHUB_REPO;
	const branch = import.meta.env.GITHUB_BRANCH || process.env.GITHUB_BRANCH || 'main';
	if (!token || !repo) {
		throw new Error('GITHUB_TOKEN and GITHUB_REPO must be set');
	}
	return { token, repo, branch };
}

async function github(path: string, init: RequestInit = {}) {
	const { token, repo } = config();
	const response = await fetch(`${API}/repos/${repo}${path}`, {
		...init,
		headers: {
			Accept: 'application/vnd.github+json',
			Authorization: `Bearer ${token}`,
			'X-GitHub-Api-Version': '2022-11-28',
			...(init.headers ?? {}),
		},
	});

	if (!response.ok) {
		const detail = await response.text();
		throw new Error(`GitHub ${response.status}: ${detail.slice(0, 280)}`);
	}

	if (response.status === 204) return null;
	return response.json();
}

function toBase64(content: string | Uint8Array) {
	const bytes = typeof content === 'string' ? new TextEncoder().encode(content) : content;
	return Buffer.from(bytes).toString('base64');
}

function isTextPayload(files: GithubFile[]) {
	return files.every((file) => typeof file.content === 'string');
}

async function getRepoFileMeta(path: string): Promise<{ content: string; sha: string } | null> {
	try {
		const file = await github(`/contents/${path}?ref=${encodeURIComponent(config().branch)}`);
		if (!file?.content || typeof file.content !== 'string' || typeof file.sha !== 'string') return null;
		return {
			content: Buffer.from(file.content.replace(/\n/g, ''), 'base64').toString('utf8'),
			sha: file.sha,
		};
	} catch (error) {
		if (error instanceof Error && error.message.includes('404')) return null;
		throw error;
	}
}

async function putRepoFile(path: string, content: string, message: string, sha?: string) {
	const { branch } = config();
	const body: Record<string, string> = {
		message,
		content: toBase64(content),
		branch,
	};
	if (sha) body.sha = sha;
	await github(`/contents/${path}`, {
		method: 'PUT',
		body: JSON.stringify(body),
	});
}

async function putRepoFileWithRetry(path: string, content: string, message: string, sha?: string) {
	try {
		await putRepoFile(path, content, message, sha);
	} catch (error) {
		if (!(error instanceof Error) || !error.message.includes('409')) throw error;
		const fresh = await getRepoFileMeta(path);
		await putRepoFile(path, content, message, fresh?.sha);
	}
}

/** One file per commit, but far fewer round-trips than the git object API. */
async function commitViaContentsAPI(
	files: { path: string; content: string }[],
	message: string,
	knownShas = new Map<string, string>(),
) {
	const metas = await Promise.all(
		files.map(async (file) => {
			if (knownShas.has(file.path)) {
				return { path: file.path, sha: knownShas.get(file.path) };
			}
			const meta = await getRepoFileMeta(file.path);
			return { path: file.path, sha: meta?.sha };
		}),
	);

	for (const [index, file] of files.entries()) {
		const commitMessage = index === 0 ? message : `Update ${file.path.split('/').pop()}`;
		await putRepoFileWithRetry(file.path, file.content, commitMessage, metas[index]?.sha);
	}

	invalidateAdminCache(['journals', 'posts', 'post:*']);
}

async function commitViaGitAPI(files: GithubFile[], message: string) {
	const { branch } = config();
	const ref = await github(`/git/ref/heads/${branch}`);
	const commitSha = ref.object.sha as string;
	const commit = await github(`/git/commits/${commitSha}`);
	const baseTree = commit.tree.sha as string;

	const treeItems = await Promise.all(
		files.map(async (file) => {
			const blob = await github('/git/blobs', {
				method: 'POST',
				body: JSON.stringify({
					content: toBase64(file.content),
					encoding: 'base64',
				}),
			});
			return {
				path: file.path,
				mode: '100644' as const,
				type: 'blob' as const,
				sha: blob.sha as string,
			};
		}),
	);

	const tree = await github('/git/trees', {
		method: 'POST',
		body: JSON.stringify({
			base_tree: baseTree,
			tree: treeItems,
		}),
	});

	const next = await github('/git/commits', {
		method: 'POST',
		body: JSON.stringify({
			message,
			tree: tree.sha,
			parents: [commitSha],
		}),
	});

	await github(`/git/refs/heads/${branch}`, {
		method: 'PATCH',
		body: JSON.stringify({ sha: next.sha }),
	});

	invalidateAdminCache(['journals', 'posts', 'post:*']);
}

export async function getRepoFile(path: string): Promise<string | null> {
	const meta = await getRepoFileMeta(path);
	return meta?.content ?? null;
}

export async function readHistory(): Promise<HistoryEntry[]> {
	const token = import.meta.env.GITHUB_TOKEN || process.env.GITHUB_TOKEN;
	const repo = import.meta.env.GITHUB_REPO || process.env.GITHUB_REPO;
	if (token && repo) {
		try {
			const raw = await getRepoFile(HISTORY_PATH);
			if (raw) return parseHistory(raw);
		} catch {
			/* local fallback below */
		}
	}

	try {
		const { readFile } = await import('node:fs/promises');
		const { join } = await import('node:path');
		const raw = await readFile(join(process.cwd(), HISTORY_PATH), 'utf8');
		return parseHistory(raw);
	} catch {
		return [];
	}
}

export async function commitFiles(files: GithubFile[], message: string, historySummary?: string) {
	const payload = [...files];
	const knownShas = new Map<string, string>();

	if (historySummary?.trim()) {
		const historyMeta = await getRepoFileMeta(HISTORY_PATH);
		if (historyMeta) knownShas.set(HISTORY_PATH, historyMeta.sha);
		payload.push({
			path: HISTORY_PATH,
			content: historyLine(historySummary.trim()) + (historyMeta?.content ?? ''),
		});
	}

	if (isTextPayload(payload)) {
		await commitViaContentsAPI(
			payload.map((file) => ({ path: file.path, content: file.content as string })),
			message,
			knownShas,
		);
		return;
	}

	await commitViaGitAPI(payload, message);
}

export async function listJournalsFromRepo(): Promise<GithubJournal[]> {
	try {
		const listing = await github('/contents/src/content/journals?ref=' + encodeURIComponent(config().branch));
		if (!Array.isArray(listing)) return [];

		const files = listing.filter(
			(item: { type: string; name: string }) => item.type === 'file' && item.name.endsWith('.md'),
		);
		const journals = await Promise.all(
			files.map(async (item: { path: string; name: string }) => {
				const file = await github(`/contents/${item.path}?ref=${encodeURIComponent(config().branch)}`);
				const raw = Buffer.from(file.content.replace(/\n/g, ''), 'base64').toString('utf8');
				const { data } = parseFrontmatter(raw);
				const id = item.name.replace(/\.md$/, '');
				return {
					id,
					title: data.title ?? id,
					emoji: data.emoji,
					order: data.order ? Number(data.order) : undefined,
				};
			}),
		);

		return journals.sort(
			(a, b) => (a.order ?? 99) - (b.order ?? 99) || a.title.localeCompare(b.title),
		);
	} catch (error) {
		if (error instanceof Error && error.message.includes('404')) return [];
		throw error;
	}
}

async function listJournalsFromDisk(): Promise<GithubJournal[]> {
	const { readdir, readFile } = await import('node:fs/promises');
	const { join } = await import('node:path');
	const dir = join(process.cwd(), 'src/content/journals');
	let names: string[] = [];
	try {
		names = await readdir(dir);
	} catch {
		return [];
	}

	const journals: GithubJournal[] = [];
	for (const name of names) {
		if (!name.endsWith('.md')) continue;
		const raw = await readFile(join(dir, name), 'utf8');
		const { data } = parseFrontmatter(raw);
		const id = name.replace(/\.md$/, '');
		journals.push({
			id,
			title: data.title ?? id,
			emoji: data.emoji,
			order: data.order ? Number(data.order) : undefined,
		});
	}

	return journals.sort(
		(a, b) => (a.order ?? 99) - (b.order ?? 99) || a.title.localeCompare(b.title),
	);
}

/** Prefer GitHub (live repo). Fall back to local files when token/repo is missing. */
export async function listJournalsForAdmin(): Promise<GithubJournal[]> {
	const cached = cacheGet<GithubJournal[]>('journals');
	if (cached) return cached;

	const token = import.meta.env.GITHUB_TOKEN || process.env.GITHUB_TOKEN;
	const repo = import.meta.env.GITHUB_REPO || process.env.GITHUB_REPO;
	let journals: GithubJournal[];
	if (token && repo) {
		try {
			journals = await listJournalsFromRepo();
		} catch {
			journals = await listJournalsFromDisk();
		}
	} else {
		journals = await listJournalsFromDisk();
	}

	cacheSet('journals', journals);
	return journals;
}

function postFromMarkdown(id: string, raw: string): GithubPost {
	const { data, body } = parseFrontmatter(raw);
	return {
		id,
		title: data.title ?? id,
		journal: data.journal ?? '',
		pubDate: data.pubDate ?? '',
		draft: /^(true|yes|1)$/i.test(data.draft ?? ''),
		body,
	};
}

async function listPostsFromRepo(): Promise<GithubPost[]> {
	const listing = await github('/contents/src/content/posts?ref=' + encodeURIComponent(config().branch));
	if (!Array.isArray(listing)) return [];

	const files = listing.filter(
		(item: { type: string; name: string }) => item.type === 'file' && item.name.endsWith('.md'),
	);
	const posts = await Promise.all(
		files.map(async (item: { path: string; name: string }) => {
			const file = await github(`/contents/${item.path}?ref=${encodeURIComponent(config().branch)}`);
			const raw = Buffer.from(file.content.replace(/\n/g, ''), 'base64').toString('utf8');
			return postFromMarkdown(item.name.replace(/\.md$/, ''), raw);
		}),
	);

	return posts.sort((a, b) => b.pubDate.localeCompare(a.pubDate) || a.title.localeCompare(b.title));
}

async function listPostsFromDisk(): Promise<GithubPost[]> {
	const { readdir, readFile } = await import('node:fs/promises');
	const { join } = await import('node:path');
	const dir = join(process.cwd(), 'src/content/posts');
	let names: string[] = [];
	try {
		names = await readdir(dir);
	} catch {
		return [];
	}

	const posts: GithubPost[] = [];
	for (const name of names) {
		if (!name.endsWith('.md')) continue;
		const raw = await readFile(join(dir, name), 'utf8');
		posts.push(postFromMarkdown(name.replace(/\.md$/, ''), raw));
	}

	return posts.sort((a, b) => b.pubDate.localeCompare(a.pubDate) || a.title.localeCompare(b.title));
}

export async function listPostsForAdmin(): Promise<GithubPost[]> {
	const cached = cacheGet<GithubPost[]>('posts');
	if (cached) return cached;

	const token = import.meta.env.GITHUB_TOKEN || process.env.GITHUB_TOKEN;
	const repo = import.meta.env.GITHUB_REPO || process.env.GITHUB_REPO;
	let posts: GithubPost[];
	if (token && repo) {
		try {
			posts = await listPostsFromRepo();
		} catch {
			posts = await listPostsFromDisk();
		}
	} else {
		posts = await listPostsFromDisk();
	}

	cacheSet('posts', posts);
	return posts;
}

async function getPostFromDisk(id: string): Promise<GithubPost | null> {
	const { readFile } = await import('node:fs/promises');
	const { join } = await import('node:path');
	try {
		const raw = await readFile(join(process.cwd(), 'src/content/posts', `${id}.md`), 'utf8');
		return postFromMarkdown(id, raw);
	} catch {
		return null;
	}
}

export async function getPostForAdmin(id: string): Promise<GithubPost | null> {
	if (!/^[a-z0-9-]+$/.test(id)) return null;

	const cacheKey = `post:${id}`;
	const cached = cacheGet<GithubPost>(cacheKey);
	if (cached) return cached;

	const token = import.meta.env.GITHUB_TOKEN || process.env.GITHUB_TOKEN;
	const repo = import.meta.env.GITHUB_REPO || process.env.GITHUB_REPO;
	let post: GithubPost | null = null;
	if (token && repo) {
		try {
			const raw = await getRepoFile(`src/content/posts/${id}.md`);
			if (raw) post = postFromMarkdown(id, raw);
		} catch {
			post = await getPostFromDisk(id);
		}
	} else {
		post = await getPostFromDisk(id);
	}

	if (post) cacheSet(cacheKey, post);
	return post;
}

export async function pathExists(path: string) {
	try {
		await github(`/contents/${path}?ref=${encodeURIComponent(config().branch)}`);
		return true;
	} catch (error) {
		if (error instanceof Error && error.message.includes('404')) return false;
		throw error;
	}
}

export async function uniquePath(dir: string, slug: string, extension = '.md') {
	let candidate = `${dir}/${slug}${extension}`;
	let n = 2;
	while (await pathExists(candidate)) {
		candidate = `${dir}/${slug}-${n}${extension}`;
		n += 1;
	}
	return candidate;
}
