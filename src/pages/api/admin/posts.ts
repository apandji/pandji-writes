export const prerender = false;

import type { APIRoute } from 'astro';
import { isSameOrigin } from '../../../lib/auth';
import { postMarkdown, safeFilename, slugify } from '../../../lib/content-files';
import { commitFiles, getPostForAdmin, listJournalsFromRepo, uniquePath } from '../../../lib/github';

const ALLOWED = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif']);
const MAX_BYTES = 1_000_000;
const MAX_FILES = 4;

function fail(journal: string, slug: string, error: string) {
	const params = new URLSearchParams({ error });
	if (journal) params.set('journal', journal);
	if (slug) params.set('slug', slug);
	return `/admin/posts/new?${params}`;
}

export const POST: APIRoute = async ({ request, redirect }) => {
	if (!isSameOrigin(request)) {
		return new Response('forbidden', { status: 403 });
	}

	try {
		const data = await request.formData();
		const title = String(data.get('title') ?? '').trim();
		const journal = String(data.get('journal') ?? '').trim();
		const pubDate = String(data.get('pubDate') ?? '').trim();
		const slugInput = String(data.get('slug') ?? '').trim();
		const intent = String(data.get('intent') ?? 'publish');
		const isDraft = intent === 'draft';
		let body = String(data.get('body') ?? '');
		const images = data.getAll('images').filter((value): value is File => value instanceof File && value.size > 0);

		if (!title || !journal || !pubDate) {
			return redirect(fail(journal, slugInput, 'missing'));
		}

		if (!/^\d{4}-\d{2}-\d{2}$/.test(pubDate)) {
			return redirect(fail(journal, slugInput, 'date'));
		}

		const journals = await listJournalsFromRepo();
		if (!journals.some((item) => item.id === journal)) {
			return redirect(fail(journal, slugInput, 'journal'));
		}

		if (images.length > MAX_FILES) {
			return redirect(fail(journal, slugInput, 'images'));
		}

		let previous = null;
		if (slugInput && /^[a-z0-9-]+$/.test(slugInput)) {
			try {
				previous = await getPostForAdmin(slugInput);
			} catch {
				previous = null;
			}
		}
		const editing = Boolean(previous);

		const postPath =
			slugInput && /^[a-z0-9-]+$/.test(slugInput)
				? `src/content/posts/${slugInput}.md`
				: await uniquePath('src/content/posts', slugify(title));
		const slug = postPath.replace(/^src\/content\/posts\//, '').replace(/\.md$/, '');
		const files: { path: string; content: string | Uint8Array }[] = [];
		const usedNames = new Set<string>();

		for (const image of images) {
			if (!ALLOWED.has(image.type) || image.size > MAX_BYTES) {
				return redirect(fail(journal, slugInput, 'images'));
			}

			let name = safeFilename(image.name);
			if (usedNames.has(name)) {
				const dot = name.lastIndexOf('.');
				name = `${name.slice(0, dot)}-${usedNames.size}${name.slice(dot)}`;
			}
			usedNames.add(name);
			const uploadPath = `public/uploads/${slug}/${name}`;
			const bytes = new Uint8Array(await image.arrayBuffer());
			files.push({ path: uploadPath, content: bytes });
			const from = `/uploads/${slugify(title)}/${image.name}`;
			const to = `/uploads/${slug}/${name}`;
			body = body.split(from).join(to);
			body = body.split(`](/uploads/${slug}/${image.name})`).join(`](${to})`);
		}

		files.unshift({
			path: postPath,
			content: postMarkdown({ title, pubDate, journal, body, draft: isDraft }),
		});

		const journalTitle = (journals.find((item) => item.id === journal)?.title ?? journal).toLowerCase();
		const named = title.toLowerCase();
		const bits: string[] = [];
		if (!previous) {
			bits.push(isDraft ? `saved draft ${named}` : `published ${named} in ${journalTitle}`);
		} else {
			if (previous.title !== title) bits.push(`renamed ${previous.title.toLowerCase()} to ${named}`);
			if (previous.journal !== journal) bits.push(`moved ${named} to ${journalTitle}`);
			if (previous.pubDate !== pubDate) bits.push(`dated ${named} ${pubDate}`);
			if ((previous.body ?? '').trim() !== body.trim()) bits.push(`edited ${named}`);
			if (previous.draft && !isDraft) bits.push(`published ${named}`);
			if (!previous.draft && isDraft) bits.push(`saved ${named} as a draft`);
			if (bits.length === 0) bits.push(`saved ${named}`);
		}

		const message = editing
			? isDraft
				? `Update draft: ${title}`
				: `Update post: ${title}`
			: isDraft
				? `Draft post: ${title}`
				: `Add post: ${title}`;

		await commitFiles(files, message, bits.join('; '));

		if (isDraft) {
			return redirect(`/admin/drafts?saved=draft`);
		}

		return redirect(`/admin/journals/${encodeURIComponent(journal)}?saved=post`);
	} catch (error) {
		const message = error instanceof Error ? error.message : 'save failed';
		return redirect(fail('', '', message));
	}
};
