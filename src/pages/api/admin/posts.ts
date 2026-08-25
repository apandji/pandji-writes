export const prerender = false;

import type { APIRoute } from 'astro';
import { isSameOrigin } from '../../../lib/auth';
import { postMarkdown, safeFilename, slugify } from '../../../lib/content-files';
import { commitFiles, listJournalsFromRepo, uniquePath } from '../../../lib/github';

const ALLOWED = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif']);
const MAX_BYTES = 1_000_000;
const MAX_FILES = 4;

export const POST: APIRoute = async ({ request, redirect }) => {
	if (!isSameOrigin(request)) {
		return new Response('forbidden', { status: 403 });
	}

	try {
		const data = await request.formData();
		const title = String(data.get('title') ?? '').trim();
		const journal = String(data.get('journal') ?? '').trim();
		const pubDate = String(data.get('pubDate') ?? '').trim();
		let body = String(data.get('body') ?? '');
		const images = data.getAll('images').filter((value): value is File => value instanceof File && value.size > 0);

		if (!title || !journal || !pubDate) {
			return redirect('/admin/posts/new?error=missing');
		}

		if (!/^\d{4}-\d{2}-\d{2}$/.test(pubDate)) {
			return redirect('/admin/posts/new?error=date');
		}

		const journals = await listJournalsFromRepo();
		if (!journals.some((item) => item.id === journal)) {
			return redirect('/admin/posts/new?error=journal');
		}

		if (images.length > MAX_FILES) {
			return redirect('/admin/posts/new?error=images');
		}

		const postPath = await uniquePath('src/content/posts', slugify(title));
		const slug = postPath.replace(/^src\/content\/posts\//, '').replace(/\.md$/, '');
		const files: { path: string; content: string | Uint8Array }[] = [];
		const usedNames = new Set<string>();

		for (const image of images) {
			if (!ALLOWED.has(image.type) || image.size > MAX_BYTES) {
				return redirect('/admin/posts/new?error=images');
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
			content: postMarkdown({ title, pubDate, journal, body }),
		});

		await commitFiles(files, `Add post: ${title}`);
		return redirect('/admin?saved=post');
	} catch (error) {
		const message = error instanceof Error ? error.message : 'save failed';
		return redirect(`/admin/posts/new?error=${encodeURIComponent(message)}`);
	}
};
