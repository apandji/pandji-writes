// @ts-check
import { defineConfig, fontProviders } from 'astro/config';

export default defineConfig({
	markdown: {
		syntaxHighlight: {
			type: 'shiki',
			excludeLangs: ['mermaid'],
		},
		shikiConfig: {
			themes: {
				light: 'min-light',
				dark: 'min-dark',
			},
			defaultColor: false,
		},
	},
	fonts: [
		{
			name: 'Geist Sans',
			cssVariable: '--font-sans',
			provider: fontProviders.fontsource(),
			weights: ['300 400'],
			styles: ['normal', 'italic'],
			subsets: ['latin'],
			fallbacks: ['sans-serif'],
		},
		{
			name: 'Geist Mono',
			cssVariable: '--font-mono',
			provider: fontProviders.fontsource(),
			weights: [400],
			styles: ['normal'],
			subsets: ['latin'],
			fallbacks: ['monospace'],
		},
	],
});
