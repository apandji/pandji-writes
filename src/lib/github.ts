import { parseFrontmatter } from './content-files';

const API = 'https://api.github.com';

export type GithubFile = {
	path: string;
	content: string | Uint8Array;
};

type GithubJournal = {
	id: string;
	title: string;
	emoji?: string;
	order?: number;
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
	let binary = '';
	for (const byte of bytes) binary += String.fromCharCode(byte);
	return btoa(binary);
}

export async function commitFiles(files: GithubFile[], message: string) {
	const { branch } = config();
	const ref = await github(`/git/ref/heads/${branch}`);
	const commitSha = ref.object.sha as string;
	const commit = await github(`/git/commits/${commitSha}`);
	const baseTree = commit.tree.sha as string;

	const treeItems = [];
	for (const file of files) {
		const blob = await github('/git/blobs', {
			method: 'POST',
			body: JSON.stringify({
				content: toBase64(file.content),
				encoding: 'base64',
			}),
		});
		treeItems.push({
			path: file.path,
			mode: '100644',
			type: 'blob',
			sha: blob.sha as string,
		});
	}

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
}

export async function listJournalsFromRepo(): Promise<GithubJournal[]> {
	try {
		const listing = await github('/contents/src/content/journals?ref=' + encodeURIComponent(config().branch));
		if (!Array.isArray(listing)) return [];

		const journals: GithubJournal[] = [];
		for (const item of listing) {
			if (item.type !== 'file' || !item.name.endsWith('.md')) continue;
			const file = await github(`/contents/${item.path}?ref=${encodeURIComponent(config().branch)}`);
			const raw = Buffer.from(file.content.replace(/\n/g, ''), 'base64').toString('utf8');
			const { data } = parseFrontmatter(raw);
			const id = item.name.replace(/\.md$/, '');
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
	} catch (error) {
		if (error instanceof Error && error.message.includes('404')) return [];
		throw error;
	}
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
