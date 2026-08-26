# pandji writes.

A small static journal, built with [Astro](https://astro.build) and Markdown. The homepage lists journals. Opening a journal shows the latest article, then older ones as you scroll, with an index on the left.

## Write from the site

Go to `/admin`. Sign in with the username and password stored in environment variables. Saving a journal or post commits to GitHub; Vercel rebuilds the live site.

The post editor has headings (H1–H3), bold/italic, bulleted and numbered lists, quotes, code, links, dividers, Mermaid diagrams, and preview. Drafts auto-save in the browser; ⌘/Ctrl+Enter saves.

Images are inline only — use the toolbar **image** button, or paste/drop into the body. Files land in `public/uploads/`.

You can still write Markdown by hand in `src/content/` if you prefer.

## Environment

Copy `.env.example` to `.env` locally, and set the same values in the Vercel project.

| Variable | Purpose |
| --- | --- |
| `ADMIN_USERNAME` | Admin login |
| `ADMIN_PASSWORD` | Admin password |
| `SESSION_SECRET` | Long random string for the login cookie |
| `GITHUB_TOKEN` | Personal access token with `repo` contents access |
| `GITHUB_REPO` | `apandji/pandji-writes` |
| `GITHUB_BRANCH` | `main` |

Create the GitHub token at [github.com/settings/tokens](https://github.com/settings/tokens) with permission to read and write repository contents.

## Diagrams

Use a `mermaid` fence for flowcharts. Photos and schematics are ordinary images.

## Commands

| Command           | Action                 |
| ----------------- | ---------------------- |
| `npm run dev`     | Local server           |
| `npm run build`   | Production build       |
| `npm run preview` | Preview the built site |
