export const CONTENT_TYPES = [
  { value: "article", label: "Articles" },
  { value: "liveblog", label: "Live blogs" },
  { value: "gallery", label: "Galleries" },
  { value: "video", label: "Video" },
] as const;

export type ContentType = (typeof CONTENT_TYPES)[number]["value"];

/** `?type=` from the URL; anything outside the allow-list means All (null). */
export function parseType(raw: string | string[] | undefined | null): ContentType | null {
  const v = Array.isArray(raw) ? raw[0] : raw;
  return CONTENT_TYPES.some((t) => t.value === v) ? (v as ContentType) : null;
}

export function typeHref(type: ContentType | null): string {
  return type ? `/?type=${type}` : "/";
}

const ARCHIVE_NOUN: Partial<Record<ContentType, string>> = { gallery: "galleries", video: "video" };
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const YEAR_MS = 365 * 24 * 60 * 60 * 1000;

/** 6 · Text for galleries/video when even the newest item is over a year old. */
export function archiveNotice(type: ContentType | null, newestIso: string | undefined, now: Date = new Date()): string | null {
  const noun = type && ARCHIVE_NOUN[type];
  if (!noun || !newestIso) return null;
  const d = new Date(newestIso);
  if (now.getTime() - d.getTime() <= YEAR_MS) return null;
  return `The Guardian no longer publishes sport ${noun} here. Showing the archive, newest from ${MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}.`;
}
