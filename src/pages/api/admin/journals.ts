export const prerender = false;

import type { APIRoute } from 'astro';
import { isSameOrigin } from '../../../lib/auth';
import { journalMarkdown, slugify } from '../../../lib/content-files';
import { commitFiles, listJournalsFromRepo, uniquePath } from '../../../lib/github';
import { journalMarks } from '../../../lib/site';

export const POST: APIRoute = async ({ request, redirect }) => {
	if (!isSameOrigin(request)) {
		return new Response('forbidden', { status: 403 });
	}

	try {
		const data = await request.formData();
		const title = String(data.get('title') ?? '').trim();
		const requested = String(data.get('emoji') ?? '').trim();

		if (!title) {
			return redirect('/admin/journals/new?error=title');
		}

		const emoji = (journalMarks as readonly string[]).includes(requested)
			? requested
			: journalMarks[Math.floor(Math.random() * journalMarks.length)];

		const journals = await listJournalsFromRepo();
		const order = Math.max(0, ...journals.map((journal) => journal.order ?? 0)) + 1;
		const path = await uniquePath('src/content/journals', slugify(title));

		await commitFiles(
			[
				{
					path,
					content: journalMarkdown({ title, emoji, order }),
				},
			],
			`Add journal: ${title}`,
		);

		return redirect('/admin?saved=journal');
	} catch (error) {
		const message = error instanceof Error ? error.message : 'save failed';
		return redirect(`/admin/journals/new?error=${encodeURIComponent(message)}`);
	}
};
