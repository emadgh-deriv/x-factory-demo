import "server-only";
import { stripHtml } from "./format";
import type { ContentType } from "./content-type";
import { parseMainFigure, sanitizeBody, sanitizeInline, type MainImage } from "./sanitize";

const BASE = "https://content.guardianapis.com";

export type Headline = {
  id: string;
  headline: string;
  trail: string;
  byline: string;
  thumbnail: string | null;
  published: string;
  live: boolean;
};

export type SportPage = { currentPage: number; pages: number; items: Headline[] };

export type Article = {
  id: string;
  headline: string;
  standfirst: string;
  byline: string;
  published: string;
  webUrl: string;
  main: MainImage | null;
  body: string;
  live: boolean;
};

export type GuardianErrorKind = "rate-limited" | "unavailable" | "not-found";

export class GuardianError extends Error {
  constructor(public kind: GuardianErrorKind, public status: number) {
    super(`Guardian API ${kind} (${status})`);
    this.name = "GuardianError";
  }
}

type RawContent = {
  id: string;
  type: string;
  webTitle: string;
  webPublicationDate: string;
  webUrl: string;
  fields?: Record<string, string | undefined>;
};

async function call(path: string, params: Record<string, string>, revalidate: number) {
  const key = process.env.GUARDIAN_API_KEY;
  if (!key) throw new GuardianError("unavailable", 500);
  const url = `${BASE}/${path}?${new URLSearchParams(params)}`;
  let res: Response;
  try {
    res = await fetch(url, { headers: { "api-key": key }, next: { revalidate } } as RequestInit);
  } catch {
    throw new GuardianError("unavailable", 0);
  }
  if (res.status === 404) throw new GuardianError("not-found", 404);
  if (res.status === 429) throw new GuardianError("rate-limited", 429);
  if (!res.ok) throw new GuardianError("unavailable", res.status);
  return (await res.json()).response;
}

export async function fetchSportPage(page: number, type: ContentType | null = null): Promise<SportPage> {
  const r = await call(
    "search",
    {
      ...(type ? { type } : {}),
      section: "sport",
      "order-by": "newest",
      "page-size": "20",
      page: String(page),
      "show-fields": "thumbnail,trailText,byline",
    },
    60,
  );
  return {
    currentPage: r.currentPage ?? page,
    pages: r.pages ?? 0,
    items: (r.results as RawContent[]).map((c) => ({
      id: c.id,
      headline: c.webTitle,
      trail: stripHtml(c.fields?.trailText),
      byline: c.fields?.byline ?? "",
      thumbnail: c.fields?.thumbnail ?? null,
      published: c.webPublicationDate,
      live: c.type === "liveblog",
    })),
  };
}

/** Returns null when the Guardian has no such article. */
export async function fetchArticle(id: string): Promise<Article | null> {
  let r;
  try {
    r = await call(id, { "show-fields": "headline,standfirst,byline,main,body" }, 600);
  } catch (e) {
    if (e instanceof GuardianError && e.kind === "not-found") return null;
    throw e;
  }
  const c = r.content as RawContent | undefined;
  if (!c) return null;
  return {
    id: c.id,
    headline: c.fields?.headline || c.webTitle,
    standfirst: sanitizeInline(c.fields?.standfirst),
    byline: c.fields?.byline ?? "",
    published: c.webPublicationDate,
    webUrl: c.webUrl,
    main: parseMainFigure(c.fields?.main),
    body: sanitizeBody(c.fields?.body),
    live: c.type === "liveblog",
  };
}
