/// <reference types="astro/client" />

interface ImportMetaEnv {
	readonly SITE_NAME?: string;
	readonly SITE_AUTHOR?: string;
	readonly SITE_DESCRIPTION?: string;
	readonly ADMIN_USERNAME?: string;
	readonly ADMIN_PASSWORD?: string;
	readonly SESSION_SECRET?: string;
	readonly GITHUB_TOKEN?: string;
	readonly GITHUB_REPO?: string;
	readonly GITHUB_BRANCH?: string;
}

interface ImportMeta {
	readonly env: ImportMetaEnv;
}
