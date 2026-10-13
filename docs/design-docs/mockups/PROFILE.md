# Mockup profile

Facts every mockup in this repo reuses. Keep it current; mockups cite it instead of
re-deriving these values.

## Product
- Name and one-line purpose: **Sport-Radar**, latest Guardian sport news, read in-app.
- MVP core flow (the journey that must always work): headline list → tap → full article →
  back to the same place in the list ([mvp.md](../../mvp.md)).

## Design system
- Library / package: Material Design 3. No app code exists yet. **Proposal:** `@material/web`
  (Google's official MD3 web components) for buttons, icon buttons, progress; plain markup +
  MD3 tokens for cards, top app bar and list items (no `@material/web` component yet).
- Token file (colours, spacing, radius, type): none yet. **Proposal:** `app/theme/tokens.css`
  with MD3 `--md-sys-color-*`, `--md-sys-typescale-*` and shape tokens, generated from the seed
  colour with `@material/material-color-utilities`. Mockups inline the Stadium Blue scheme.
- Theme handling (light/dark, how it is switched): MVP follows `prefers-color-scheme`. Four seed
  themes (Pitch Green `#2E7D32`, Stadium Blue `#1565C0` default, Trophy Gold `#B8860B`,
  Guardian Red `#C62828`) × light/dark come later (backlog #3).
- Icon set: Material Symbols Outlined.
- Render command for real components (if any): none (no app yet). Mockups inline token CSS.
- Component choice rules: filled tonal button for secondary page actions ("Load more"),
  outlined button for leaving the app ("Read on The Guardian"), icon button for top-bar
  actions, filled button for Retry. Cards are MD3 "filled" cards (surface-container-low).
- Spacing: 4 px grid; page margin 16 px (compact), 24 px (medium/expanded).
- Shape: card 12 px, button full, image 12 px.
- Type: Roboto, MD3 type scale.

## App shell
- Layout regions and their sizes: MD3 small top app bar, 64 px, no navigation rail or drawer
  (only one destination in the MVP). Content column max 840 px (list) / 720 px (article),
  centred.
- Breakpoints: MD3 window classes. Compact < 600 px, medium 600–839 px, expanded ≥ 840 px.
- Desktop frame size: 1280×800.
- Mobile portrait 390×844 · mobile landscape 844×390.
- Navigation on mobile: top app bar only; back arrow on the article screen.

## Data sources
| Source | Contract URL / file | Auth | Notes |
|---|---|---|---|
| Guardian Open Platform Content API | https://open-platform.theguardian.com/documentation/ (no OpenAPI spec published) | `api-key` header, `GUARDIAN_API_KEY` in `.env.local`, server-side only | 60 req/min, 500/day developer key. CORS `*`, but always proxied through Next.js to hide the key. Unknown id → 404 |

## Copy and compliance
- Voice and vocabulary source: none written. Plain, short sentence case (MD3 default).
- Strings or surfaces that must never be reworded: Guardian content (headline, trail text,
  standfirst, byline, body) is shown verbatim. Attribution "Read on The Guardian" on every article.
- Regulated areas that need a compliance flag: Guardian Open Platform terms. Keep attribution
  and link back via `webUrl`; do not alter article text.

## Mockup folder
- Location: `docs/design-docs/mockups/`
- Earlier mockups worth reusing as a starting point: `2026-10-12-mvp` (app shell, card, article layout).
