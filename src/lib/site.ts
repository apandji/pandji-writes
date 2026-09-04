export const journalMarks = [
	'✧',
	'✦',
	'✶',
	'✷',
	'✸',
	'✹',
	'✺',
	'⊹',
	'◇',
	'◆',
	'◈',
	'○',
	'●',
	'◎',
	'□',
	'■',
	'△',
	'▲',
	'▽',
	'◊',
	'⬡',
	'⬢',
	'⟡',
	'※',
	'⁂',
	'❖',
	'⁕',
	'⊕',
	'⊗',
	'⊙',
	'†',
	'§',
] as const;

export function isJournalMark(value: string) {
	return (journalMarks as readonly string[]).includes(value);
}

function env(name: string, fallback = '') {
	const value = (import.meta.env[name] || process.env[name] || '').trim();
	return value || fallback;
}

/** Short name only — e.g. `pandji` → public identity `pandji writes.` */
const shortName = env('SITE_NAME', 'pandji');

export const site = {
	shortName,
	name: `${shortName} writes.`,
	adminName: `${shortName} admins.`,
	author: env('SITE_AUTHOR', 'Pandji'),
	description: env(
		'SITE_DESCRIPTION',
		'Journals on programming usable interfaces and physical computing.',
	),
};

export function journalMark(id: string, override?: string) {
	if (override) return override;

	let hash = 0;
	for (const char of id) {
		hash = (hash * 33 + char.charCodeAt(0)) >>> 0;
	}

	return journalMarks[hash % journalMarks.length];
}

export function formatDate(date: Date) {
	return date.toLocaleDateString('en-US', {
		month: 'short',
		day: 'numeric',
		year: 'numeric',
		timeZone: 'UTC',
	});
}
