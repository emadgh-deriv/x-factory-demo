# Build plan: Content-type filter

- Date: 2026-10-13
- Mockup: [2026-10-13-content-type-filter](../design-docs/mockups/2026-10-13-content-type-filter.md) (Approved)
- Open questions 1–5 were approved as proposed: keep Galleries/Video with an archive notice,
  single-select, heading stays "Latest sport", existing article layout, URL only (no cookie).

## Files

| File | Change | Why |
|---|---|---|
| `lib/content-type.ts` (+ `.test.ts`) | New: `CONTENT_TYPES`, `parseType`, `typeHref`, `archiveNotice` | Allow-list, URL building and the archive-notice rule as pure, tested logic |
| `lib/guardian.ts` (+ test) | `fetchSportPage(page, type?)` adds `type=` | Data layer |
| `app/api/sport/route.ts` | Reads `type`, passes the parsed value | Load more keeps the filter |
| `app/components/TypeFilter.tsx` | New client component: chip row + pending skeletons | Annotations 1, 2, 4 and the loading state |
| `app/components/ArchiveNotice.tsx` | New: `history` icon + text | Annotation 6 |
| `app/components/HeadlineList.tsx` | `type` prop: storage key and Load more URL include it | Annotation 5, back-from-article state |
| `app/components/MdLoader.tsx`, `app/md.d.ts` | Register/type `md-filter-chip` | Component is new to the app |
| `app/page.tsx` | Reads `searchParams.type`; heading + chips always shown; empty/error panels below chips | Wiring, states |
| `app/globals.css` | `.chips`, `.notice`, inline panel sizing | Mockup styles |

## Order
Data (`content-type`, `guardian`, route) → state (`HeadlineList` key/type) → UI (`TypeFilter`, `ArchiveNotice`, CSS) → wiring (`page.tsx`, `MdLoader`).

## Coverage

| Item | Delivered by | Verified |
|---|---|---|
| Screen 1 · filter row, All selected (desktop / portrait / landscape) | `TypeFilter`, CSS || ✓ Desktop 1280×800 screenshot vs frame 1 |
| 1 · toolbar of `md-filter-chip`, below heading, 12 px above cards, scrolls horizontally, no wrap, 16 px edge padding on phones | `TypeFilter`, `.chips` || ✓ Portrait 390: row scrolls, no page overflow (scrollWidth ≤ viewport) |
| 2 · single-select, MD3 selected state, aria-pressed, `router.replace` to `/?type=…`, All removes param, tapping selected does nothing | `TypeFilter` || ✓ JS drive: aria-pressed=true, URL /?type=liveblog, re-tap keeps selection |
| Screen 2 · Live blogs filtered (3 viewports) | `page.tsx`, `fetchSportPage` || ✓ Live blogs real data: 20/20 cards with Live badge (desktop); portrait screenshot |
| 3 · heading stays "Latest sport" | `page.tsx` || ✓ Heading unchanged in all screenshots |
| 4 · same cards, list/grid; skeletons while loading, chips stay interactive | `TypeFilter` (useTransition), `HeadlineList` || ✓ 6 skeletons seen mid-transition, chips selected optimistically |
| 5 · Load more passes type | `HeadlineList`, `route.ts` || ✓ Request /api/sport?page=2&type=liveblog → 40 live cards |
| Screen 3 · Video with archive notice (3 viewports) | `ArchiveNotice`, `archiveNotice()` || ✓ Video at 1280×800, 390×844, 844×390 screenshots vs frame 3 |
| 6 · notice text, month from first item, galleries/video only, older than 365 days | `archiveNotice()` || ✓ Video "Feb 2018", Galleries "Apr 2018" (real data); unit tests |
| 7 · absolute dates on old items | existing `relativeTime` | ✓ "15 Feb 2018", "11 Sep 2014" on video cards |
| State · loading (filter change) | `TypeFilter` pending || ✓ Same as 4 |
| State · empty: "Nothing of this type yet." + Show all | `page.tsx` `Panel` || ✓ Forced 0 results (scratch fetch stub): panel + Show all under chips |
| State · error / rate-limited below chips, Retry keeps filter | `page.tsx` `ErrorPanel` (router.refresh) || ✓ Invalid key → real Guardian error: ErrorPanel under chips, Video still selected |
| State · invalid type → All | `parseType` || ✓ /?type=podcast → All; /api/sport?type=bogus → 20 items; unit tests |
| State · back from article restores filtered list + scroll | `HeadlineList` key per type || ✓ Live blogs, 40 cards, scrollY 2500 → article → Back: 40 cards, scrollY 2500 |
| State · article screen has no chips | unchanged article route || ✓ Article page: 0 chips, Guardian link present |

## Risks
- `md-filter-chip` toggles itself on click; we cancel that (`preventDefault`) and drive `selected` from React.
- Existing `relativeTime` shows an absolute date after 1 day, not 7 (annotation 7 says "as the existing rule already does"); left as is.
- Each filter is another uncached Guardian query against the 500/day key; covered by the existing 60 s revalidate.

## Departures
- **`loading.tsx` has no chip row.** A chip row there read the URL with `useSearchParams`; in the
  browser that kept the route stuck on its loading screen after Back from an article (reproduced
  twice, gone once removed). Filter changes still keep the chips on screen (that loading state is
  `TypeFilter`'s own). Only a hard load or a slow Back shows the plain heading + skeletons for a moment.

## Proof
- Unit tests: `parseType`, `typeHref`, `archiveNotice`, `fetchSportPage` with `type`.
- Browser: each chip on real data, Load more on Live blogs, Video notice, invalid type, back from article, empty (forced), 3 viewports.
