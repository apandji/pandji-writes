# Where this could go

Notes on forks from the current journal — not a build plan. Companion to `portfolio-roadmap.md` (personal site) and `the-future-product.md` (open-source gift).

Do not build these yet. This is a map of jumping points.

## Two clear forks

```text
                    this journal (now)
                           │
            ┌──────────────┴──────────────┐
            ▼                             ▼
   personal portfolio              open-source gift
   portfolio-roadmap.md            the-future-product.md
   one author, your site           friends spin up their own
   writings + work + types         `{name} writes.` template
```

| Fork | What it is | Stack shift |
| --- | --- | --- |
| **Portfolio** | Your site holds writings *and* work | Same Astro + Markdown + GitHub admin; new types and home |
| **Gift (`writes.`)** | Classmates get their own **april writes.** | Separate `writes` template repo; name config; each person hosts themselves |

Same *feel* (rooms, quiet type, Markdown desk). Different *jobs*. Do not build class features into your portfolio home, or portfolio CMS complexity into the gift template.

**Not the gift fork:** a multi-tenant host you operate so people “claim a name” on your infrastructure. That remains a distant later ambition if the template spreads and people ask for zero-setup — see Deliberately later in `the-future-product.md`.

## Shared idea: how pieces connect

Three strengths of connection, reusable on either fork:

| Layer | Answers | Strength |
| --- | --- | --- |
| **Rooms** | Where does this live? | Hard — journals, types/collections |
| **Metadata** | What is true about it? | Soft — year, status, sparse motifs |
| **Fuzzy links** | What else breathes near it? | Serendipity — kin, motif overlap, later backlinks |

Rule of thumb:

> Rooms answer membership. Metadata answers facts. Fuzzy links answer hunches.

- **Rooms / journals** are the strongest structure and the main navigation.
- **Metadata** stays sparse YAML in Markdown — layout and affinity, not a filing cabinet.
- **Fuzzy connections** (`kin`, motifs, wikilinks/backlinks) live at the *end of a piece*, not as tag-cloud IA.

Prefer **motifs** (a tiny house lexicon) over tag taxonomies. Prefer **kin** (authored soft edges) over recommendation engines. Details live in `portfolio-roadmap.md`; the gift template stays thinner — journals + posts only.

## Other jumping points

Beyond “portfolio” and “OSS gift,” these are real openings if something pulls you there. Each can grow from what exists without swallowing the other forks.

### 1. Hosted multi-tenant (only if the gift isn’t enough)

“Type your name → live on your domain” with a database and per-writer auth. You become the host. Jumping point only after classmates bounce off GitHub/Vercel setup — or ask for it. Do not start here.

### 2. The writing desk as a craft tool

Double down on the editor ritual: publish ding, drafts, marks, Mermaid, empty states that feel like a room. Could stay personal, or become the signature of the gift. Jumping point when the desk is the thing people ask to borrow — not the public theme.

### 3. Portfolio-of-rooms without “work” CMS

Some personal sites only need more *journals* (essays, making notes, talks-as-posts) and a stronger home sentence — not a `projects` collection. Jumping point if your work already reads well as dated writing and case pages would feel fake.

### 4. Garden / wiki layer on top of rooms

Wikilinks (`[[slug]]`), backlinks, and kin trails turn the site into a small garden while rooms stay primary. Fits the portfolio corpus when it gets large; too heavy for the class gift v1. Jumping point after manual `kin` feels tedious.

### 5. Marks and motifs as identity

The emoji/mark language and a tiny motif set become the recognizable system — across journals, and across gifted sites that share the lineage. Jumping point if visual identity matters more than new content types. Still not a public motif directory in v1.

### 6. Export / portability as trust

For the gift, the repo *is* the export. For a future hosted app, Markdown download would be the open promise. Jumping point into “serious for other people” without adding themes or discovery.

### 7. Collaborative rooms (later, separate)

Shared journals, multi-author, edit together. Different trust and auth model. Don’t sneak it into solo portfolio or the class template v1.

### 8. Class gallery / opt-in directory

A page *you* maintain listing classmates who want to be linked (`april writes.`, `bradley writes.`). Not a feed inside their sites. Jumping point for MDes critique and shared reading without building a social network.

### 9. Media-heavy types

Talks with video, makings with galleries, audio. Same room rules, heavier storage (Blob/CDN). Jumping point when a real piece needs it — not when packaging the template.

### 10. Cohort-specific defaults

Same gift, tuned first-run copy for MDes (design journals, studio notes, critique logs). Jumping point if the class is the real audience: change samples and README voice, not the architecture.

## What to choose next

When energy returns, pick **one** lane:

1. **Live on it** → portfolio fork (`portfolio-roadmap.md`), starting with identity + projects + home.
2. **Gift it to class** → `writes` template (`the-future-product.md`): extract repo + name config + five-step README → 2–3 friends → semver tags. Upgrades stay snapshot-honest until someone asks.
3. **Something smaller (good default)** → make site name configurable in `pandji-writes` first — unblocks both forks.

Connection layers (rooms → metadata → kin) can travel with whichever fork you pick. They are not a third product by themselves.

**Repo split reminder:** `pandji-writes` (you) and `writes` (gift) should be separate when packaging — extract a clean template, don’t fork your content history. Details in `the-future-product.md`.
