import { getCollection, getEntry } from 'astro:content';
import type { CollectionEntry } from 'astro:content';

export async function getJournals() {
	return (await getCollection('journals')).sort(
		(a, b) => (a.data.order ?? 99) - (b.data.order ?? 99) || a.data.title.localeCompare(b.data.title),
	);
}

export async function getPosts() {
	try {
		const posts = await getCollection('posts', ({ data }) => {
			return import.meta.env.PROD ? data.draft !== true : true;
		});

		return posts.sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf());
	} catch {
		return [];
	}
}

export async function getPostsByJournal(journalId: string) {
	const posts = await getPosts();
	return posts.filter((post) => post.data.journal.id === journalId);
}

export async function getJournalForPost(post: CollectionEntry<'posts'>) {
	const journal = await getEntry(post.data.journal);
	if (!journal) {
		throw new Error(`Journal not found: ${post.data.journal.id}`);
	}
	return journal;
}

export function postHref(journalId: string, postId: string) {
	return `/journals/${journalId}/${postId}`;
}

export function journalHref(journalId: string) {
	return `/journals/${journalId}`;
}
