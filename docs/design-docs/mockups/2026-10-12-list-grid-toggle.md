# List / grid view toggle

- Date: 2026-10-12
- Status: Built
- Mockup: [2026-10-12-list-grid-toggle.html](2026-10-12-list-grid-toggle.html)
- Data source: Guardian Content API `/search` (same call as the MVP list, checked 2026-10-12). MVP backlog #2.
- Shared facts: [PROFILE.md](PROFILE.md). Builds on [2026-10-12-mvp](2026-10-12-mvp.md).

## Intent

On the headline list, the reader taps an icon button in the top app bar to switch between the
current one-column **list** and a **grid** of image-led tiles. The choice is remembered on this
device and applies the next time they open the app. Nothing else changes: same headlines, same
order, same tap → article → back flow.

## Data reality

No new API call or field. Pure presentation over `HeadlineList`.

| Grid needs | Data has (20 results, 2026-10-12) | Mockup does |
|---|---|---|
| Image per tile | `fields.thumbnail` on 20/20; MVP already handles missing → placeholder | Full-width 16:9 image, placeholder icon when missing |
| Image sharp at tile size | Thumbnail is a fixed **500 px wide** crop, aspect ratio varies (e.g. 5:4) | `object-fit: cover` at 16:9; slight upscale on 2× desktop (tile ~290 px CSS) – accepted, see Q4 |
| Short headline for a narrow tile | `webTitle` 67–106 chars | Clamp 3 lines (4 on compact) |
| Trail text | `fields.trailText` 20/20 (HTML, already stripped) | 2 lines on desktop; hidden on compact and landscape |
| Byline / time | `fields.byline` 20/20, `webPublicationDate` | Same meta line as list, pinned to tile bottom |
| Live flag | Existing `live` derivation | Same Live badge before the headline |

Fields left out: none added. Derived values: `view = "list" | "grid"`, read from storage
(see Q1), default `"list"`; any other stored value → `"list"`.

## Screens

| # | Screen | Desktop | Mobile portrait | Mobile landscape |
|---|---|---|---|---|
| 1 | Headline list, list view + toggle | ✓ | ✓ | ✓ |
| 2 | Headline list, grid view | 4 columns | 2 columns | 3 columns |
| 3 | Loading, grid view | ✓ | ✓ | ✓ |

The article screen is unchanged and has no toggle.

### 1 · List view (toggle added)

```
┌──────────────────────────────────────────────┐
│ ⚽ Sport-Radar                       [⊞] (1) │
├──────────────────────────────────────────────┤
│ Latest sport                                 │
│ ┌──────┐ Headline …                          │
│ │ img  │ trail …                             │
│ └──────┘ byline · 12 min ago                 │
│ …                                            │
└──────────────────────────────────────────────┘
```

| # | Element | Behaviour |
|---|---|---|
| 1 | View toggle | `md-icon-button` at the right of the top app bar, list page only. Shows the icon of the view you switch **to**: `view_module` in list mode, `view_agenda` in grid mode (Material Symbols Outlined). `aria-label` / tooltip "Switch to grid view" / "Switch to list view". Tap swaps the layout instantly (no fetch, no animation required), keeps loaded items, and keeps the first visible card in view. Saves the choice. |

### 2 · Grid view

```
Desktop (content max 1200 px)            Portrait (2 cols)
┌────────┬────────┬────────┬────────┐    ┌─────────┬─────────┐
│ img    │ img    │ img    │ img    │    │ img     │ img     │
│ Head…  │ Head…  │ Head…  │ Head…  │    │ Head…   │ Head…   │
│ trail  │ trail  │ trail  │ trail  │    │ meta    │ meta    │
│ meta   │ meta   │ meta   │ meta   │    └─────────┴─────────┘
└────────┴────────┴────────┴────────┘
            [ Load more ]
```

| # | Element | Behaviour |
|---|---|---|
| 2 | Grid container | CSS grid. Expanded (≥ 840 px): content column widens from 840 to **1200 px**, `repeat(auto-fill, minmax(240px, 1fr))`, gap 16 → 4 columns at 1280. Compact portrait: 2 equal columns, gap 12. Landscape phone: 3 columns, gap 12. Medium (600–839): auto-fill gives 2–3. Tiles in a row share height. |
| 3 | Grid tile | Same `HeadlineCard` link and hover/focus/state layers, `grid` variant: vertical, no padding around the image, 12 px radius, `surface-container-low`. Whole tile links to the article; `onOpen` saves list state as today. |
| 4 | Tile image | Full width, 16:9, `object-fit: cover`, square top corners clipped by card radius. Placeholder `sports` icon when missing/broken (existing `Thumb`). |
| 5 | Headline | Title medium (16/24, 500); compact and landscape 14/20. Clamp 3 lines (4 on compact). Live badge inline before it. |
| 6 | Trail + meta | Trail 2 lines on desktop/medium, hidden on compact and landscape. Meta line pinned to the bottom (`margin-top: auto`), ellipsis. |
| 7 | Load more | Unchanged button, centred below the grid, spans full width. New items append to the grid. |

### 3 · Loading, grid view

| # | Element | Behaviour |
|---|---|---|
| 8 | Grid skeletons | When the stored view is grid, `app/loading.tsx` renders skeleton tiles (16:9 block + 3 lines) in the same grid. List view keeps the existing skeleton cards. |

## States

- **Loading:** skeletons match the active view (8).
- **Empty / error / rate-limited:** unchanged centred panels; toggle hidden (nothing to lay out).
- **Load more failure:** unchanged inline retry, below the grid.
- **Back from article:** the saved scroll position restores in the same view the reader left.
- **Storage unavailable:** toggle still works for the session; defaults to list next visit.
- **Not applicable:** article screen (no toggle). A failure here can only affect layout; data, article and back flow are untouched.

## Components used

| Component | Status |
|---|---|
| `md-icon-button` (toggle) | Exists (`@material/web`, already loaded) |
| `HeadlineCard` | Exists, gets a `grid` layout via a parent class (CSS only) |
| `Thumb` | Exists, sized by CSS |
| `CardSkeletons` | Exists, gets a grid variant |
| `TopBar` | Exists, gets an optional action slot |
| View preference store (`useViewMode`) | New |

## Open questions

1. **Where is the choice stored?** Proposal: a cookie `sr-view=grid|list` so the server renders
   the right view on first paint (no list→grid flash). Alternative: `localStorage` (simpler,
   brief flash on load).
2. **Default view?** Proposal: list everywhere. Alternative: grid by default on desktop only.
3. **Toggle control:** proposal is one icon button in the top bar. Alternative: a two-segment
   MD3 segmented button next to the "Latest sport" heading (more discoverable, more space).
4. **Grid image sharpness:** accept the 500 px thumbnail, or request `show-fields=main`/`show-elements=image`
   for larger crops (heavier payload, more API cost)? Proposal: accept for now.
5. **Phone grid columns:** 2 columns on portrait (proposal) or a single large-image column?
