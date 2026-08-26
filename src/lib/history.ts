export const HISTORY_PATH = 'src/content/history.jsonl';

export type HistoryEntry = {
	at: string;
	summary: string;
};

export function historyLine(summary: string, at = new Date().toISOString()) {
	return `${JSON.stringify({ at, summary } satisfies HistoryEntry)}\n`;
}

export function parseHistory(raw: string): HistoryEntry[] {
	const entries: HistoryEntry[] = [];
	for (const line of raw.split('\n')) {
		const trimmed = line.trim();
		if (!trimmed) continue;
		try {
			const row = JSON.parse(trimmed) as Partial<HistoryEntry>;
			if (typeof row.at === 'string' && typeof row.summary === 'string') {
				entries.push({ at: row.at, summary: row.summary });
			}
		} catch {
			/* skip a broken line */
		}
	}
	return entries;
}

export function formatHistoryTime(iso: string) {
	const date = new Date(iso);
	if (Number.isNaN(date.valueOf())) return iso;
	return date
		.toLocaleString('en-US', {
			month: 'short',
			day: 'numeric',
			year: 'numeric',
			hour: 'numeric',
			minute: '2-digit',
		})
		.toLowerCase();
}
