import { defineCollection, reference } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const journals = defineCollection({
	loader: glob({ base: './src/content/journals', pattern: '**/*.md' }),
	schema: z.object({
		title: z.string(),
		description: z.string().optional(),
		emoji: z.string().optional(),
		order: z.number().optional(),
	}),
});

const posts = defineCollection({
	loader: glob({ base: './src/content/posts', pattern: '**/*.md', retainBody: true }),
	schema: z.object({
		title: z.string(),
		pubDate: z.coerce.date(),
		journal: reference('journals'),
		draft: z.boolean().optional(),
	}),
});

export const collections = { journals, posts };
