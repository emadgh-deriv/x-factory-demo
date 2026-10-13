export type Theme = "green" | "blue" | "gold" | "red";
export type Mode = "light" | "dark";

export const THEME_COOKIE = "sr-theme";
export const MODE_COOKIE = "sr-mode";

/** Seeds from mvp.md decision 4, in menu order. Swatches show the raw seed. */
export const THEMES: { id: Theme; name: string; seed: string }[] = [
  { id: "green", name: "Pitch Green", seed: "#2E7D32" },
  { id: "blue", name: "Stadium Blue", seed: "#1565C0" },
  { id: "gold", name: "Trophy Gold", seed: "#B8860B" },
  { id: "red", name: "Guardian Red", seed: "#C62828" },
];

/** Stored value → theme. Anything unknown means Stadium Blue. */
export function parseTheme(value: string | undefined): Theme {
  return THEMES.some((t) => t.id === value) ? (value as Theme) : "blue";
}

/** Stored value → mode, or undefined to follow the device (prefers-color-scheme). */
export function parseMode(value: string | undefined): Mode | undefined {
  return value === "light" || value === "dark" ? value : undefined;
}

/** `document.cookie` string that remembers a theme choice on this device for a year. */
export function themeCookie(name: typeof THEME_COOKIE | typeof MODE_COOKIE, value: string): string {
  return `${name}=${value}; Path=/; Max-Age=31536000; SameSite=Lax`;
}
