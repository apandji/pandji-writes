# Next actions — get writing

Goal: use this site to publish posts into different journals without fighting setup.

Do these in order. Check boxes as you go.

---

## 1. Confirm the site is up

- [ ] Open [https://pandji-blog.vercel.app](https://pandji-blog.vercel.app)
- [ ] Confirm both journals appear: **Programming Usable Interfaces**, **Physical Computing**
- [ ] Open each journal — empty feed / poem is expected until the first post exists

---

## 2. Wire admin on Vercel (required for `/admin` saves)

Without these, login or “save” will fail.

In the Vercel project → **Settings → Environment Variables** (Production at minimum):

- [ ] `ADMIN_USERNAME` — pick a username
- [ ] `ADMIN_PASSWORD` — strong password
- [ ] `SESSION_SECRET` — long random string (e.g. `openssl rand -hex 32`)
- [ ] `GITHUB_TOKEN` — PAT with contents read/write on `apandji/pandji-writes`
- [ ] `GITHUB_REPO` = `apandji/pandji-writes`
- [ ] `GITHUB_BRANCH` = `main`
- [ ] Redeploy after saving env vars so serverless functions pick them up

Local optional mirror:

```bash
cp .env.example .env
# fill the same values
npm run dev
```

---

## 3. Smoke-test admin

- [ ] Visit `/admin` → redirected to `/admin/login`
- [ ] Sign in successfully
- [ ] Dashboard lists the two journals
- [ ] **new post** shows both journals in the dropdown

If journals fail to load, the GitHub token/repo/branch pair is wrong.

---

## 4. Publish your first post

Pick one journal and ship something short — proves the full loop.

- [ ] `/admin` → **new post**
- [ ] Choose journal, title, date, a few paragraphs
- [ ] Optional: drop one image; use **preview** and **diagram** if useful
- [ ] Save → redirected with “post committed…”
- [ ] Confirm a new commit on `main` (post under `src/content/posts/`, images under `public/uploads/…` if any)
- [ ] Wait for Vercel production deploy
- [ ] Confirm the post appears on the journal page and at its permalink

**Hand-write fallback** (if admin is not ready yet):

1. Add `src/content/posts/hello.md` with frontmatter `title`, `pubDate`, `journal`
2. Commit and push to `main`
3. Wait for deploy

---

## 5. Use multiple journals day to day

You already have two series. Workflow:

| Intent | Action |
| --- | --- |
| Post in an existing series | Admin → new post → pick that journal |
| Start a new series | Admin → new journal → then write posts into it |
| Reorder journals on the home page | Edit `order:` in each journal’s Markdown (lower = earlier) |
| Hide a post while iterating | Add `draft: true` in frontmatter (hand edit); remove when ready |

Suggested rhythm:

1. Decide which journal owns the idea.
2. Draft in admin (or in an editor → paste into admin / commit Markdown).
3. Save and wait one deploy cycle.
4. Skim the live journal feed for typography, images, and Mermaid.

---

## 6. Nice-to-haves after the first few posts

Not blockers for writing; pick when friction shows up.

- [ ] **Edit / delete in admin** — today you edit files on GitHub or locally
- [ ] **Draft toggle in the post form** — schema already supports `draft`
- [ ] **Custom domain** — point DNS at Vercel if you want something other than `*.vercel.app`
- [ ] **Larger / more images** — raise limits in `src/pages/api/admin/posts.ts` if 1 MB / 4 files is tight
- [ ] **Journal descriptions** — optional `description` in journal frontmatter shows in page metadata

---

## Done when

You can:

1. Log into `/admin`
2. Choose which journal a post belongs to
3. Publish and see it on the live journal within one Vercel deploy

Then keep writing. The content model is already journal-scoped; the remaining work is env + first posts, not architecture.
