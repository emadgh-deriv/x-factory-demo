# Content-type filter

- Date: 2026-10-13
- Status: Built
- Mockup: [2026-10-13-content-type-filter.html](2026-10-13-content-type-filter.html)
- Data source: Guardian Content API `/search`, `type` parameter (checked live 2026-10-13).
- Shared facts: [PROFILE.md](PROFILE.md). Builds on [2026-10-12-mvp](2026-10-12-mvp.md) and [2026-10-12-list-grid-toggle](2026-10-12-list-grid-toggle.md).

## Intent

Under the "Latest sport" heading the reader sees a row of MD3 filter chips: **All · Articles ·
Live blogs · Galleries · Video**. Tapping one reloads the headline list with only that content
type (`/search?type=…`), newest first. The choice lives in the URL (`/?type=liveblog`) so it
survives refresh, back from an article, and sharing. List/grid view and Load more work as today.

## Data reality

Live calls on `section=sport&order-by=newest`, 2026-10-13:

| Filter | `type=` | Total | Newest item | Mockup does |
|---|---|---|---|---|
| All | (omitted) | ~196k | today | Default, today's list unchanged |
| Articles | `article` | 186,562 | today | Chip |
| Live blogs | `liveblog` | 7,827 | today | Chip; every item gets the existing Live badge |
| Galleries | `gallery` | 2,142 | **2018-04-04** | Chip + "archive" notice (proposal, Q1) |
| Video | `video` | 1,631 | **2018-02-14** | Chip + "archive" notice (proposal, Q1) |

- The newest 50 sport items are 40 `article` + 10 `liveblog`; galleries and video no longer appear in the default list at all.
- Multi-select is possible: `type=liveblog|gallery` returns the OR (9,969). Proposal uses single-select (Q2).
- Every sampled item has `fields.thumbnail` and `trailText`; video `trailText` contains `<p>`, already stripped by `sanitizeInline`.
- Article page for gallery/video: `body` is mostly images/embeds; the existing article screen renders them as-is (Q4).

Endpoint: `GET /api/sport?page=N&type=T` → `fetchSportPage(page, type)` adds `type` to the existing `/search` call. Allowed values: `article | liveblog | gallery | video`; anything else → treated as All (no error).

Derived values:
- `type` = `searchParams.type` if in the allow-list, else `null` (All).
- Archive notice shown when `type ∈ {gallery, video}` **and** the first item is older than 365 days.
- Live badge rule unchanged (`type === "liveblog"`).

## Screens

| # | Screen | Desktop | Mobile portrait | Mobile landscape |
|---|---|---|---|---|
| 1 | List, filter row, "All" selected | ✓ | ✓ | ✓ |
| 2 | List filtered to Live blogs | ✓ | ✓ | ✓ |
| 3 | Filtered to Video (archive notice) | ✓ | ✓ | ✓ |

### 1 · Filter row

```
┌────────────────────────────────────────────────┐
│ ⚽ Sport-Radar                    [🎨] [⊞]      │
├────────────────────────────────────────────────┤
│ Latest sport                                   │
│ (✓ All) (Articles) (Live blogs) (Galleries) (Video)  (1)(2)
│ ┌────┐ Headline …                              │
│ └────┘ byline · 12 min ago                     │
└────────────────────────────────────────────────┘
```

| # | Element | Behaviour |
|---|---|---|
| 1 | Chip row | A `div role="toolbar"` of `md-filter-chip` (not `md-chip-set`, which wraps), below the page heading, 12 px above the first card. Single-select: selecting a chip deselects the others; tapping the selected chip does nothing (All is always reachable). On compact/landscape it scrolls horizontally with no visible scrollbar, 16 px edge padding, never wraps. |
| 2 | Selected chip | MD3 selected state (secondary-container fill + check icon). `aria-pressed`. Link semantics: each chip navigates to `/?type=…` (`router.replace`, scroll to top); "All" removes the param. |

### 2 · Filtered list (Live blogs)

| # | Element | Behaviour |
|---|---|---|
| 3 | Heading | Stays "Latest sport" (proposal); alternative "Latest sport · Live blogs" (Q3). |
| 4 | Results | Same `HeadlineCard`s, list or grid as chosen. While the new page loads, the cards are replaced by skeletons; the chip row stays put and interactive. |
| 5 | Load more | Below the fold (not drawn). Passes `type` to `/api/sport`. |

### 3 · Archive notice (Galleries / Video)

| # | Element | Behaviour |
|---|---|---|
| 6 | Notice | Inline info row above the cards: `history` icon + "The Guardian no longer publishes sport video here. Showing the archive, newest from Feb 2018." (Galleries: "…sport galleries… Apr 2018."). Month from the first item's date. Not dismissible. |
| 7 | Dates | Meta line shows absolute date ("14 Feb 2018") when older than 7 days, as the existing relative-time rule already does. |

## States

- **Loading (filter change):** chip row visible, cards → skeletons in the active view.
- **Empty (filter returns 0):** existing "No sport news right now" panel below the chips, text "Nothing of this type yet." with a "Show all" tonal button (→ All). Chips stay visible.
- **Error / rate-limited:** existing error panel below the chips; Retry keeps the filter.
- **Invalid `type` in URL:** treated as All, chip "All" selected.
- **Back from article:** returns to the same filtered URL, scroll restored (existing list-state key gets the type in it).
- **Not applicable:** article screen has no chips. A filter failure only affects the list; All still works.

## Components used

| Component | Status |
|---|---|
| `md-filter-chip` (in a scrolling toolbar row) | Exists in `@material/web`, new to this app (add to `MdLoader`) |
| `HeadlineList`, `HeadlineCard`, skeletons, `Panel` | Exist; list-state key and Load more get `type` |
| `fetchSportPage(page, type?)`, `/api/sport?type=` | Extend |
| `TypeFilter` (chip row) | New |
| `ArchiveNotice` | New (plain markup + tokens) |

## Open questions

1. **Galleries and Video are archive-only (newest 2018).** Keep them with the archive notice (proposal), drop those two chips, or keep them and not explain?
2. **Single- or multi-select?** Proposal single-select; the API supports `a|b` if you want multi.
3. **Heading:** keep "Latest sport" (proposal) or append the type name?
4. **Gallery/video article page:** accept the existing article layout for image/embed bodies (proposal), or open these on The Guardian directly?
5. **Remember the filter across visits** (cookie like the view toggle)? Proposal: no, URL only; a fresh visit shows All.
