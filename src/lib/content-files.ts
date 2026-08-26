export function slugify(value: string) {
	const slug = value
		.toLowerCase()
		.normalize('NFKD')
		.replace(/[\u0300-\u036f]/g, '')
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-+|-+$/g, '')
		.slice(0, 80);

	return slug || 'untitled';
}

export function parseFrontmatter(raw: string) {
	const match = raw.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
	if (!match) {
		return { data: {} as Record<string, string>, body: raw };
	}

	const data: Record<string, string> = {};
	for (const line of match[1].split('\n')) {
		const index = line.indexOf(':');
		if (index === -1) continue;
		const key = line.slice(0, index).trim();
		const value = line.slice(index + 1).trim().replace(/^["']|["']$/g, '');
		if (key) data[key] = value;
	}

	return { data, body: match[2].trim() };
}

export function journalMarkdown(input: { title: string; emoji?: string; order?: number }) {
	const lines = ['---', `title: ${escapeYaml(input.title)}`];
	if (input.emoji) lines.push(`emoji: ${JSON.stringify(input.emoji)}`);
	if (typeof input.order === 'number') lines.push(`order: ${input.order}`);
	lines.push('---', '');
	return `${lines.join('\n')}\n`;
}

export function postMarkdown(input: {
	title: string;
	pubDate: string;
	journal: string;
	body: string;
	draft?: boolean;
}) {
	const lines = [
		'---',
		`title: ${escapeYaml(input.title)}`,
		`pubDate: ${input.pubDate}`,
		`journal: ${input.journal}`,
	];
	if (input.draft) lines.push('draft: true');
	lines.push('---', '', input.body.trim(), '');
	return lines.join('\n');
}

function escapeYaml(value: string) {
	if (/[:#{}[\],&*?]|^\s|\s$/.test(value)) {
		return JSON.stringify(value);
	}
	return value;
}

export function safeFilename(name: string) {
	const base = name.replace(/\\/g, '/').split('/').pop() ?? 'image';
	const cleaned = base.toLowerCase().replace(/[^a-z0-9._-]+/g, '-');
	return cleaned.replace(/^\.+/, '') || 'image';
}
