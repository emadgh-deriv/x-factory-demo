# Build plan: 4 colour themes × light/dark

Mockup: [2026-10-12-colour-themes](../design-docs/mockups/2026-10-12-colour-themes.md) (Approved, every proposal accepted).

## Decisions (from the approved open questions)
1. `SchemeFidelity`, so Stadium Blue light primary changes from `#2b5ea7` to `#004d99`.
2. Cookies `sr-theme`, `sr-mode` (1 year, `SameSite=Lax`), read on the server in the root layout, so there is no flash.
3. Palette icon in the top bar. 4. Swatches show the raw seed.

## Files
| File | Why |
|---|---|
| `lib/theme.ts` (+ `lib/theme.test.ts`) | Theme ids/names/seeds, `parseTheme`, `parseMode`, cookie string. Pure, tested first. |
| `scripts/gen-themes.mjs`, `npm run themes` | Generates `app/theme/tokens.css` (18 roles × 8 schemes) with `@material/material-color-utilities` 0.3.0 (new devDependency). |
| `app/theme/tokens.css` | Generated. Cascade: `:root` = blue light; `[data-theme]` = light; `[data-mode=dark]` = dark; `@media (prefers-color-scheme: dark)` + `:not([data-mode=light])` = dark when no mode is stored. |
| `app/layout.tsx` | Reads cookies, sets `data-theme` / `data-mode` on `<html>` (mode omitted when not stored). |
| `app/components/ThemeMenu.tsx` | Button (1), swatch radio group (2), segmented button (3), menu surface (4). Applies by setting the `<html>` attributes and writing the cookies. |
| `app/components/TopBar.tsx` | Renders `ThemeMenu` after `action` and before `open_in_new`, on every screen. |
| `app/globals.css` | Menu, swatch and segmented-button styles. |

## Order
lib/theme (tests) → generator + tokens → layout first paint → ThemeMenu → CSS → TopBar wiring.

## Coverage
| Item | File | Verified |
|---|---|---|
| 1 Theme button, `palette`, label/tooltip "Theme", after view toggle / before open_in_new, every screen | ThemeMenu.tsx, TopBar.tsx | ✅ Browser: list (after toggle), article (before open_in_new), not-found panel |
| 2 Swatches 48 px seed fill, aria-label + title, radiogroup, arrow keys, check + on-surface ring, instant, menu stays open | ThemeMenu.tsx, globals.css | ✅ Real clicks and ArrowRight (gold→red→wraps to green), menu still open after picks |
| 3 Segmented Light/Dark, 40 px, centred labels, 18 px check absolutely at 16 px | ThemeMenu.tsx, globals.css | ✅ Screenshots desktop / portrait / landscape |
| 4 Menu surface: surface-container, 16 px radius, elevation 2, 288 wide, 12 px from right; closes on outside tap, Esc, button; focus returns | ThemeMenu.tsx, globals.css | ✅ Rect 288 wide at top 60; Esc closes and focus is back on "Theme"; outside tap closes |
| 5 Whole app recolours instantly, images untouched | tokens.css | ✅ All 4×2 + 4×"no mode" primaries checked under emulated OS light and dark (24 cases), matching mockup hexes; screenshots of red dark, gold dark, green dark |
| 6 Article: same menu, links use primary, no reload / scroll loss | TopBar.tsx, existing `.prose a` | ✅ scrollY 600 → 600 after a theme change on the article |
| First paint from cookie, no flash | layout.tsx | ✅ Server HTML `<html … data-theme="red" data-mode="dark">` |
| No stored mode → device mode | tokens.css media query | ✅ Emulated prefers-color-scheme dark/light with no `data-mode` |
| Unknown value → blue + device mode | lib/theme.ts | ✅ Unit tests; `sr-theme=bogus; sr-mode=system` renders `data-theme="blue"` and no mode |
| Storage unavailable → choice lasts for the page | ThemeMenu.tsx (cookie write in try/catch) | Code review only; not triggered |
| Loading / empty / error panels themed with button | TopBar used by all | ✅ Not-found panel (green dark) screenshot. Loading skeleton seen themed during streaming. Empty/error use the same TopBar; not triggered |
| Feature failure leaves the default tokens | tokens.css `:root` defaults; menu is client-only | Code review only |

## Risks
- Root layout reads cookies, so every route is dynamic. The pages already were (`ƒ` in the build output before and after).
- An outside tap closes the menu and also activates whatever is under it (for example a card opens). Standard for a non-modal MD3 menu; the mockup does not say otherwise.

## Proof
- `lib/theme.test.ts` (6 tests). Typecheck, lint, test and build all pass.
- Browser: 1280×800, 390×844 and 844×390 against the live Guardian API; MVP core flow list → article → back keeps scrollY 1500 and the theme.
