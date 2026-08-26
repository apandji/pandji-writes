# pandji writes.

A small journal site for [Pandji](https://github.com/apandji), built with [Astro](https://astro.build) and Markdown. Live at [pandji-blog.vercel.app](https://pandji-blog.vercel.app).

The homepage lists journals. Opening a journal shows the latest article first, then older ones as you scroll, with an index on the left.

## What’s in the repo

| Path | Role |
| --- | --- |
| `src/content/journals/` | One Markdown file per journal (title, optional emoji, order) |
| `src/content/posts/` | One Markdown file per post (title, date, journal id, body) |
| `public/uploads/` | Images attached from the admin editor |
| `/admin` | Sign in, create journals, write posts |
| `/journals/[journal]` | Scrollable feed for one journal |
| `/journals/[journal]/[post]` | Permalink for a single post |

Two journals already exist:

1. **Programming Usable Interfaces** (`programming-usable-interfaces`)
2. **Physical Computing** (`physical-computing`)

There are no posts yet — that is the next step.

## Write a post (recommended)

1. Open `/admin` on the live site (or local `npm run dev`).
2. Sign in with `ADMIN_USERNAME` / `ADMIN_PASSWORD`.
3. Pick **new post**, choose a journal, title, and date.
4. Write in the Markdown editor (bold, italic, headings, lists, quotes, code, links, diagrams, preview).
5. Drop images if needed (jpeg/png/webp/gif, under 1 MB, up to 4).
6. Save. The app commits to GitHub; Vercel rebuilds in about a minute.

Create more journals from **new journal** when you need another series.

## Write Markdown by hand

You can edit content in the repo instead of using admin.

**Journal** — `src/content/journals/my-journal.md`:

```md
---
title: My Journal
emoji: ⟡
order: 3
---
```

**Post** — `src/content/posts/my-first-post.md`:

```md
---
title: My first post
pubDate: 2026-08-26
journal: programming-usable-interfaces
---

Hello. This is the body.
```

Mermaid diagrams use a `mermaid` fence inside the post body (toolbar **diagram** inserts one).

- `journal` must match a filename under `src/content/journals/` (without `.md`).
- Set `draft: true` to hide a post on production builds (still visible in `npm run dev`).
- Images in hand-written posts can live under `public/uploads/…` and be referenced as `/uploads/…`.

## Environment

Copy `.env.example` to `.env` locally, and set the same values in the Vercel project.

| Variable | Purpose |
| --- | --- |
| `ADMIN_USERNAME` | Admin login |
| `ADMIN_PASSWORD` | Admin password |
| `SESSION_SECRET` | Long random string for the login cookie |
| `GITHUB_TOKEN` | Personal access token with repo contents read/write |
| `GITHUB_REPO` | `apandji/pandji-writes` |
| `GITHUB_BRANCH` | `main` |

Create the GitHub token at [github.com/settings/tokens](https://github.com/settings/tokens) (classic: `repo` scope, or fine-grained: Contents read/write on this repo).

Admin saving will fail until these are set on Vercel. Local writing still works by editing Markdown files.

## Diagrams

Use a `mermaid` fence for flowcharts. Photos and schematics are ordinary images.

## Commands

| Command | Action |
| --- | --- |
| `npm run dev` | Local server |
| `npm run build` | Production build |
| `npm run preview` | Preview the built site |

Requires Node `>=22.12.0`.

## Current limits

Worth knowing before you lean on admin day to day:

- Create only — no edit or delete UI yet (edit/delete by changing files in GitHub or locally).
- Admin does not expose `draft`; use frontmatter if you need drafts.
- Image dropzone: max 4 files, 1 MB each.
- After save, wait for the Vercel deploy before the public page updates.

See [NEXT_ACTIONS.md](./NEXT_ACTIONS.md) for a checklist to get writing.
