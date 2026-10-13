# Build plan: List / grid view toggle

Mockup: [2026-10-12-list-grid-toggle](../design-docs/mockups/2026-10-12-list-grid-toggle.md) (Approved).

## Decisions on the mockup's open questions
The mockup was approved with its open questions unanswered, so the build takes each **proposal**:
1. Cookie `sr-view=grid|list` (1 year, `SameSite=Lax`), read on the server → no list→grid flash.
2. Default list everywhere. 3. One icon button in the top bar. 4. Keep the 500 px thumbnail.
5. Two columns on portrait phones.

## Files
| File | Why |
|---|---|
| `lib/view.ts` (+ `lib/view.test.ts`) | `parseView`, cookie name, `viewCookie()` string. Pure, tested first. |
| `app/components/ViewMode.tsx` | Client context: `ViewModeProvider`, `useViewMode`, `ViewToggle` (1), `ViewCol` (2). Writes cookie, keeps first visible card in view. |
| `app/components/TopBar.tsx` | Optional `action` slot. |
| `app/components/Skeletons.tsx` | `CardSkeletons` gets `grid` variant (8). |
| `app/components/HeadlineList.tsx` | Cards wrapped in `.cards` so the grid applies only to cards, not Load more (7). |
| `app/page.tsx` | Reads cookie, wraps in provider, toggle only when items exist. |
| `app/loading.tsx` | Reads cookie, grid skeletons when grid. |
| `app/globals.css` | Grid rules (2–6, 8), per window class + landscape. |

## Order
`lib/view.ts` (tests) → context/state → CSS + skeleton → TopBar slot → page/loading wiring.

## Coverage
| Item | File | Verified |
|---|---|---|
| 1 Toggle, icon/label swap, saves, keeps first visible card | ViewMode.tsx, TopBar.tsx || ✅ Browser: icon/label swap, cookie written, same card at top 64 px after toggle at scrollY 1500 |
| 2 Grid container 4 / 2 / 3 cols, 1200 px col | globals.css, ViewCol || ✅ Computed columns: 4×288 px @1280, 2 @390, 3×252 px @844×390 |
| 3 Grid tile, same link + state layers, onOpen | globals.css (HeadlineCard unchanged) || ✅ Tile opens article, list state saved |
| 4 Tile image 16:9 cover, placeholder | globals.css (Thumb unchanged) || ✅ Screenshots, 20/20 images loaded |
| 5 Headline type + clamps 3/4 | globals.css || ✅ Screenshots (desktop 3 lines, portrait 4) |
| 6 Trail 2 lines / hidden compact+landscape; meta pinned | globals.css || ✅ Screenshots: trail on desktop, hidden portrait/landscape |
| 7 Load more below grid, appends | HeadlineList.tsx || ✅ 20 → 40 tiles, button outside `.cards` |
| 8 Grid skeletons | Skeletons.tsx, loading.tsx || ✅ Streamed HTML with cookie=grid has `col grid` skeletons; screenshot |
| Empty / error: toggle hidden | page.tsx || ✅ Error path (invalid key, 2nd server): panel shown, no toggle. Empty: same code path, not triggered |
| Back from article restores scroll in same view | cookie → server render || ✅ Grid, 40 items, scrollY 3000 → back → grid, 40 items, scrollY 3000 |
| Storage unavailable: session-only | ViewMode.tsx (state, cookie write in try) || Code review only (try/catch around cookie write); not triggered |
| Invalid cookie → list | lib/view.ts || ✅ Unit test + `sr-view=bogus` renders list |

## Risks
- Cookie read makes `loading.tsx` dynamic; page already `force-dynamic`, so no change in caching.
- Restoring scroll in grid view depends on the same column count on return; true on same device.

## Proof
- `lib/view.test.ts`: parse valid/invalid/missing, cookie string.
- Browser: toggle at 1280×800, 390×844, 844×390; reload keeps view; article → back; loading skeleton; empty/error panel hides toggle.
