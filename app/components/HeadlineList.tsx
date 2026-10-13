"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import type { Headline, SportPage } from "@/lib/guardian";
import { HeadlineCard } from "./HeadlineCard";

const KEY = "sport-radar:list";
const MAX_AGE_MS = 30 * 60 * 1000;

type Saved = { items: Headline[]; page: number; pages: number; scrollY: number; at: number };

function dedupe(items: Headline[]): Headline[] {
  const seen = new Set<string>();
  return items.filter((i) => (seen.has(i.id) ? false : (seen.add(i.id), true)));
}

function readSaved(): Saved | null {
  try {
    const s = JSON.parse(sessionStorage.getItem(KEY) ?? "null") as Saved | null;
    // One-shot: a later reload or fresh visit starts at the top.
    sessionStorage.removeItem(KEY);
    return s && Date.now() - s.at < MAX_AGE_MS ? s : null;
  } catch {
    return null;
  }
}

/** 3 · cards, 7 · load more. Restores loaded pages and scroll position when coming back. */
export function HeadlineList({ initial }: { initial: SportPage }) {
  const [items, setItems] = useState(initial.items);
  const [page, setPage] = useState(initial.currentPage);
  const [pages, setPages] = useState(initial.pages);
  const [loading, setLoading] = useState(false);
  const [failed, setFailed] = useState(false);
  const restoreY = useRef<number | null>(null);

  useLayoutEffect(() => {
    const saved = readSaved();
    if (!saved) return;
    // Fresh first page from the server, then the extra pages the reader had loaded.
    setItems(dedupe([...initial.items, ...saved.items]));
    setPage(Math.max(initial.currentPage, saved.page));
    setPages(Math.max(initial.pages, saved.pages));
    restoreY.current = saved.scrollY;
  }, [initial]);

  useEffect(() => {
    if (restoreY.current === null) return;
    const y = restoreY.current;
    restoreY.current = null;
    requestAnimationFrame(() => window.scrollTo(0, y));
  }, [items]);

  const save = useCallback(() => {
    try {
      const saved: Saved = { items, page, pages, scrollY: window.scrollY, at: Date.now() };
      sessionStorage.setItem(KEY, JSON.stringify(saved));
    } catch {
      // Storage unavailable: back still works, without restoring position.
    }
  }, [items, page, pages]);

  const loadMore = async () => {
    setLoading(true);
    setFailed(false);
    try {
      const res = await fetch(`/api/sport?page=${page + 1}`);
      if (!res.ok) throw new Error(String(res.status));
      const next = (await res.json()) as SportPage;
      setItems((cur) => dedupe([...cur, ...next.items]));
      setPage(next.currentPage);
      setPages(next.pages);
    } catch {
      setFailed(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="cards">
        {items.map((item) => (
          <HeadlineCard key={item.id} item={item} onOpen={save} />
        ))}
      </div>
      {page < pages && (
        <div className="more">
          {failed && !loading ? (
            <div className="more-error" role="alert">
              Couldn&apos;t load more.
              <md-filled-tonal-button onClick={loadMore}>Retry</md-filled-tonal-button>
            </div>
          ) : (
            <md-filled-tonal-button onClick={loading ? undefined : loadMore} disabled={loading} has-icon={loading}>
              {loading && <md-circular-progress slot="icon" indeterminate aria-label="Loading" />}
              {loading ? "Loading…" : "Load more"}
            </md-filled-tonal-button>
          )}
        </div>
      )}
    </>
  );
}
