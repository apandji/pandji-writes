export const prerender = false;

import type { APIRoute } from 'astro';
import { isSameOrigin } from '../../../lib/auth';
import { journalMarkdown, slugify } from '../../../lib/content-files';
import { commitFiles, listJournalsFromRepo, uniquePath, type GithubJournal } from '../../../lib/github';
import { isJournalMark, journalMarks } from '../../../lib/site';

function journalPath(id: string) {
	return `src/content/journals/${id}.md`;
}

function pickMark(requested: string, fallback?: string) {
	if (isJournalMark(requested)) return requested;
	if (fallback) return fallback;
	return journalMarks[Math.floor(Math.random() * journalMarks.length)];
}

function fileFor(journal: GithubJournal, order: number) {
	return {
		path: journalPath(journal.id),
		content: journalMarkdown({
			title: journal.title,
			emoji: journal.emoji,
			order,
		}),
	};
}

async function createJournal(data: FormData, redirect: APIRoute['redirect']) {
	const title = String(data.get('title') ?? '').trim();
	if (!title) {
		return redirect('/admin/journals/new?error=title');
	}

	const emoji = pickMark(String(data.get('emoji') ?? '').trim());
	const journals = await listJournalsFromRepo();
	const order = Math.max(0, ...journals.map((journal) => journal.order ?? 0)) + 1;
	const path = await uniquePath('src/content/journals', slugify(title));

	await commitFiles(
		[{ path, content: journalMarkdown({ title, emoji, order }) }],
		`Add journal: ${title}`,
		`opened journal ${title.toLowerCase()}`,
	);

	const id = path.replace(/^src\/content\/journals\//, '').replace(/\.md$/, '');
	return redirect(`/admin/journals/${id}?saved=journal`);
}

async function updateJournal(data: FormData, redirect: APIRoute['redirect']) {
	const id = String(data.get('id') ?? '').trim();
	const title = String(data.get('title') ?? '').trim();
	if (!/^[a-z0-9-]+$/.test(id)) {
		return redirect('/admin');
	}
	if (!title) {
		return redirect(`/admin/journals/${id}?error=title`);
	}

	const journals = await listJournalsFromRepo();
	const current = journals.find((journal) => journal.id === id);
	if (!current) {
		return redirect('/admin');
	}

	const emoji = pickMark(String(data.get('emoji') ?? '').trim(), current.emoji);
	const bits: string[] = [];
	if (current.title !== title) bits.push(`renamed ${current.title.toLowerCase()} to ${title.toLowerCase()}`);
	if ((current.emoji ?? '') !== emoji) bits.push(`set ${title.toLowerCase()} mark to ${emoji}`);
	if (bits.length === 0) {
		return redirect(`/admin/journals/${id}`);
	}

	const order = current.order ?? journals.findIndex((journal) => journal.id === id) + 1;
	await commitFiles(
		[fileFor({ ...current, title, emoji }, order)],
		`Update journal: ${title}`,
		bits.join('; '),
	);

	return redirect(`/admin/journals/${id}?saved=journal`);
}

async function reorderJournals(data: FormData, redirect: APIRoute['redirect']) {
	const id = String(data.get('id') ?? '').trim();
	const dir = String(data.get('dir') ?? '').trim();
	if (!/^[a-z0-9-]+$/.test(id) || (dir !== 'up' && dir !== 'down')) {
		return redirect('/admin');
	}

	const journals = await listJournalsFromRepo();
	const index = journals.findIndex((journal) => journal.id === id);
	const swap = dir === 'up' ? index - 1 : index + 1;
	if (index < 0 || swap < 0 || swap >= journals.length) {
		return redirect('/admin');
	}

	const moved = journals[index];
	[journals[index], journals[swap]] = [journals[swap], journals[index]];

	await commitFiles(
		journals.map((journal, order) => fileFor(journal, order + 1)),
		`Reorder journals`,
		`moved ${moved.title.toLowerCase()} ${dir}`,
	);

	return redirect('/admin?saved=order');
}

export const POST: APIRoute = async ({ request, redirect }) => {
	if (!isSameOrigin(request)) {
		return new Response('forbidden', { status: 403 });
	}

	const data = await request.formData();
	const intent = String(data.get('intent') ?? 'create');

	try {
		if (intent === 'update') return await updateJournal(data, redirect);
		if (intent === 'reorder') return await reorderJournals(data, redirect);
		return await createJournal(data, redirect);
	} catch (error) {
		const message = error instanceof Error ? error.message : 'save failed';
		const encoded = encodeURIComponent(message);
		if (intent === 'create') {
			return redirect(`/admin/journals/new?error=${encoded}`);
		}
		if (intent === 'update') {
			const id = String(data.get('id') ?? '').trim();
			if (/^[a-z0-9-]+$/.test(id)) {
				return redirect(`/admin/journals/${id}?error=${encoded}`);
			}
		}
		return redirect(`/admin?error=${encoded}`);
	}
};
