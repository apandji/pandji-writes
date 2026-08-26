# Where this could go

Notes on forks from the current journal — not a build plan. Companion to `portfolio-roadmap.md` (personal site) and `the-future-product.md` (hosted product).

Do not build these yet. This is a map of jumping points.

## Two clear forks

```text
                    this journal (now)
                           │
            ┌──────────────┴──────────────┐
            ▼                             ▼
   personal portfolio              hosted product
   portfolio-roadmap.md            the-future-product.md
   one author, Git-as-CMS          many writers, claim a name
   writings + work + types         journals + posts only (at first)
```

| Fork | What it is | Stack shift |
| --- | --- | --- |
| **Portfolio** | Your site holds writings *and* work | Same Astro + Markdown + GitHub admin; new types and home |
| **Product** | Friends get `{name} writes.` instantly | Database, auth per writer, multi-tenant hosting |

Same *feel* (rooms, quiet type, Markdown desk). Different *jobs*. Do not build the product under the guise of the portfolio, or the portfolio as a mini-CMS for strangers.

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
- **Metadata** stays sparse YAML in Markdown (or the product’s equivalent fields) — layout and affinity, not a filing cabinet.
- **Fuzzy connections** (`kin`, motifs, wikilinks/backlinks) live at the *end of a piece*, not as tag-cloud IA.

Prefer **motifs** (a tiny house lexicon) over tag taxonomies. Prefer **kin** (authored soft edges) over recommendation engines. Details and schemas live in `portfolio-roadmap.md`; the product stays thinner — see `the-future-product.md`.

## Other jumping points

Beyond “portfolio” and “hosted writes,” these are real openings if something pulls you there. Each can grow from what exists without swallowing the other forks.

### 1. Self-hosted starter (gift, not the product)

Ship a clean repo template: journals, admin, env example, one-click deploy notes. For people who want the *files*. Explicitly not the “type your name” hook — that needs hosting. Pairs with export from the product later (“leave with Markdown”).

### 2. The writing desk as a craft tool

Double down on the editor ritual: publish ding, drafts, marks, Mermaid, empty states that feel like a room. Could stay personal, or become the signature of the product. Jumping point when the desk is the thing people ask to borrow — not the public theme.

### 3. Portfolio-of-rooms without “work” CMS

Some personal sites only need more *journals* (essays, making notes, talks-as-posts) and a stronger home sentence — not a `projects` collection. Jumping point if your work already reads well as dated writing and case pages would feel fake.

### 4. Garden / wiki layer on top of rooms

Wikilinks (`[[slug]]`), backlinks, and kin trails turn the site into a small garden while rooms stay primary. Fits the portfolio corpus when it gets large; risky as a product v1 (feels like Obsidian-in-the-browser). Jumping point after manual `kin` feels tedious.

### 5. Marks and motifs as identity

The emoji/mark language and a tiny motif set become the recognizable system — across journals, and later across writers on a host. Jumping point if visual identity matters more than new content types. Still not a public motif directory in v1.

### 6. Export / portability as trust

Markdown + images out, always. For the product, this *is* the open promise. For the portfolio, it’s already true (the repo). Jumping point into “serious for other people” without adding themes or discovery.

### 7. Collaborative rooms (later, separate)

Shared journals, multi-author, edit together. Different trust and auth model. Mentions in both roadmaps as deliberately later — don’t sneak it into solo portfolio or name-claiming v1.

### 8. Discovery surface (directory, follows, global feed)

Only after many writers exist and *want* to be found. Conflicts with “your homepage is only yours.” Jumping point for the product years out; almost never for the personal portfolio.

### 9. Media-heavy types

Talks with video, makings with galleries, audio. Same room rules, heavier storage (Blob/CDN). Jumping point when a real piece needs it — not when designing abstract media libraries.

### 10. Narrow vertical of `{name} writes.`

Same claim-a-name product, but aimed (e.g. design journals, course cohorts, lab notebooks). Jumping point if a specific audience appears before “anyone who writes.” Keep the core spell; change the first-run copy and defaults, not the architecture fantasy.

## What to choose next

When energy returns, pick **one** jumping point and ignore the rest:

1. **Live on it** → portfolio fork (`portfolio-roadmap.md`), starting with identity + projects + home.
2. **Give it to friends** → product fork (`the-future-product.md`), starting with claim name → write → magic link.
3. **Something smaller** → often the desk, the starter template, or export — prove one craft before a new fork.

Connection layers (rooms → metadata → kin) can travel with whichever fork you pick. They are not a third product by themselves.
