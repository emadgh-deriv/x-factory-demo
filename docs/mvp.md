# MVP: Sport-Radar

Status: Approved · Date: 2026-10-12 · Source: [idea.md](idea.md)

## In one sentence
A user browses the latest Guardian sport headlines and opens any one to read the full article,
live from the Guardian Open Platform.

## Core flow
1. User opens the app and sees the latest sport headlines (newest first): thumbnail, title,
   trail text, byline, publish time.
2. User scrolls and loads more headlines.
3. User taps a headline and the detail page opens.
4. User reads the full article (headline, byline, date, main image, body) and gets back to the
   list where they left off. (Moment of value: reading the story.)

## Data check
| Flow step | Source / endpoint | Fields used | Verified (real call) | Notes |
|---|---|---|---|---|
| 1. Headline list | `GET content.guardianapis.com/search?section=sport&order-by=newest&page-size=20&show-fields=thumbnail,trailText,byline` | `id`, `webTitle`, `webPublicationDate`, `fields.thumbnail`, `fields.trailText`, `fields.byline` | Yes, 2026-10-12: 200, ~199k results | Some items (e.g. live blogs) may lack a thumbnail; need a placeholder |
| 2. Load more | same, `&page=N` | `response.currentPage`, `response.pages` | Yes | |
| 3–4. Article detail | `GET content.guardianapis.com/{id}?show-fields=headline,byline,body,main,thumbnail` | `fields.headline`, `fields.byline`, `fields.body` (HTML), `fields.main`, `webPublicationDate`, `webUrl` | Yes: body ~34 KB HTML | `body` is HTML; must be sanitised before render. `id` contains slashes (catch-all route) |

Auth, rate limits, CORS / proxy needs: API key required (`GUARDIAN_API_KEY` in `.env.local`).
Developer key limits: 60 calls/min, 500 calls/day. CORS is open (`*`), but calls go through
Next.js server components / route handlers so the key never reaches the browser, with
response caching (e.g. `revalidate: 60` for lists, longer for articles) to stay under the daily cap.

## Platforms
Desktop web · mobile portrait · mobile landscape. Material Design 3, default light theme
(follows system dark mode if cheap; full theming is backlog).

## Done when
- [ ] Core flow completes end to end on real data: the 20 latest Guardian sport headlines load, tapping one shows its full article
- [ ] List renders within 3 s on Fast 4G throttling; article within 3 s
- [ ] "Load more" appends the next 20 without duplicates; Back from an article returns to the same scroll position
- [ ] Loading state: skeleton cards on list and article
- [ ] Empty state: list shows a "No sport news right now" message if `results` is empty
- [ ] Error / backend down state: Guardian 4xx/5xx or rate limit (429) shows a friendly message with Retry; unknown article id shows a 404 page
- [ ] Slow network: skeletons stay visible, no layout jump when images arrive; missing thumbnails show a placeholder
- [ ] Article page shows a "Read on The Guardian" link to `webUrl`
- [ ] Article body HTML is sanitised; the API key does not appear in any browser request, page source or log
- [ ] Layout works at 360 px portrait, mobile landscape and desktop widths

## Backlog (in order)
| # | Feature | Why it waits | Needs data the backend lacks? |
|---|---|---|---|
| 1 | Search sport news | Most-missed next; same `/search` endpoint with `q=` (verified: "tennis" → 17.7k hits, nonsense → 0). Adds its own empty/no-results states | No |
| 2 | List / Grid view toggle | Pure presentation on top of the list; easy once the card exists | No |
| 3 | 4 colour themes × light/dark | Needs the MD3 token setup to settle first; touches every screen, so best after screens exist | No |
| 4 | Persist view + theme choice | Depends on 2 and 3 (localStorage) | No |

## Out of scope
Nothing from the idea is dropped; accounts, comments and sport sub-section filters were not
asked for and are not planned.

## Decisions (resolved questions)
1. Developer key (500 calls/day) is enough for the demo, with server-side caching.
2. Core flow is list → detail; search is backlog #1.
3. Articles render in-app, with a "Read on The Guardian" link to `webUrl`.
4. Theme seed colours (MD3, each with light + dark): Pitch Green `#2E7D32`, Stadium Blue `#1565C0`, Trophy Gold `#B8860B`, Guardian Red `#C62828`. Default: Stadium Blue, following system light/dark.

## Open questions
None.
