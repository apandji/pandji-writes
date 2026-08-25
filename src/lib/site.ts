export const site = {
	name: 'pandji writes.',
	author: 'Pandji',
	description: 'Journals on programming usable interfaces and physical computing.',
};

const marks = ['⟡', '⬡', '◎', '◈', '✧', '✺', '⊹', '🪩', '🫧', '🪐', '🧿', '💠'];

export function journalMark(id: string, override?: string) {
	if (override) return override;

	let hash = 0;
	for (const char of id) {
		hash = (hash * 33 + char.charCodeAt(0)) >>> 0;
	}

	return marks[hash % marks.length];
}

export function formatDate(date: Date) {
	return date.toLocaleDateString('en-US', {
		month: 'short',
		day: 'numeric',
		year: 'numeric',
		timeZone: 'UTC',
	});
}
