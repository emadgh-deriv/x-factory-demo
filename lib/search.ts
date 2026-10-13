export const MAX_QUERY = 100;

/** 4 · Static suggestions on the empty search screen. */
export const TRY_QUERIES = ["Tennis", "Ashes", "Formula One", "Rugby league", "NFL"];

/** `?q=` from the URL: trimmed, cut to 100 chars; "" means the empty search screen. */
export function parseQuery(raw: string | string[] | undefined | null): string {
  const v = Array.isArray(raw) ? raw[0] : raw;
  return (v ?? "").trim().slice(0, MAX_QUERY).trim();
}

export function searchHref(q: string): string {
  const v = parseQuery(q);
  return v ? `/search?${new URLSearchParams({ q: v })}` : "/search";
}

/** 5 · Count line. */
export function countText(total: number, q: string): string {
  const n = total.toLocaleString("en-GB");
  return `${n} ${total === 1 ? "result" : "results"} for “${q}” · newest first`;
}

const OPERATORS = new Set(["AND", "OR", "NOT"]);

/** Words to bold in headlines: whitespace-split, no operators or quotes. */
export function highlightTerms(q: string): string[] {
  return q
    .replace(/["“”]/g, " ")
    .split(/\s+/)
    .filter((w) => w && !OPERATORS.has(w));
}

export type Segment = { text: string; mark: boolean };

const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/** 6 · Splits a headline into plain and whole-word-matched segments (case-insensitive). */
export function splitHighlight(text: string, terms: string[]): Segment[] {
  if (terms.length === 0) return [{ text, mark: false }];
  const re = new RegExp(`(?<![\\p{L}\\p{N}])(?:${terms.map(escape).join("|")})(?![\\p{L}\\p{N}])`, "giu");
  const out: Segment[] = [];
  let last = 0;
  for (const m of text.matchAll(re)) {
    if (m.index > last) out.push({ text: text.slice(last, m.index), mark: false });
    out.push({ text: m[0], mark: true });
    last = m.index + m[0].length;
  }
  if (last < text.length) out.push({ text: text.slice(last), mark: false });
  return out.length ? out : [{ text, mark: false }];
}
