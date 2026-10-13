export type View = "list" | "grid";

export const VIEW_COOKIE = "sr-view";

/** Stored value → view. Anything unknown means list. */
export function parseView(value: string | undefined): View {
  return value === "grid" ? "grid" : "list";
}

/** `document.cookie` string that remembers the view on this device for a year. */
export function viewCookie(view: View): string {
  return `${VIEW_COOKIE}=${view}; Path=/; Max-Age=31536000; SameSite=Lax`;
}
