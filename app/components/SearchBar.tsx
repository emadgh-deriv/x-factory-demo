"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import { MAX_QUERY, parseQuery, searchHref, TRY_QUERIES } from "@/lib/search";
import { CardSkeletons } from "./Skeletons";
import { useViewMode, ViewToggle } from "./ViewMode";

type Props = { q: string; children?: React.ReactNode };

/** 2, 3 · Search bar in place of the top app bar; the body turns to skeletons while a query loads. */
export function SearchScreen({ q, children }: Props) {
  const router = useRouter();
  const { view } = useViewMode();
  const [value, setValue] = useState(q);
  const [pending, startTransition] = useTransition();
  const input = useRef<HTMLInputElement>(null);

  // 2 · Autofocus when the screen opens empty (also after "Clear search").
  useEffect(() => {
    if (!q) input.current?.focus();
  }, [q]);

  const run = (raw: string) => {
    const next = parseQuery(raw);
    setValue(next);
    input.current?.blur();
    window.scrollTo(0, 0);
    startTransition(() => router.push(searchHref(next)));
  };

  const clear = () => {
    setValue("");
    input.current?.focus();
    if (q) router.replace("/search");
  };

  const goBack = () => {
    if (window.history.length > 1) router.back();
    else router.push("/");
  };

  return (
    <>
      <header className="bar sbar">
        <md-icon-button aria-label="Back" onClick={goBack}>
          <span className="icon">arrow_back</span>
        </md-icon-button>
        <form
          className="sfield"
          role="search"
          onSubmit={(e) => {
            e.preventDefault();
            run(value);
          }}
        >
          <span className="icon" aria-hidden="true">search</span>
          <input
            ref={input}
            type="search"
            enterKeyHint="search"
            value={value}
            maxLength={MAX_QUERY}
            placeholder="Search sport news"
            aria-label="Search sport news"
            onChange={(e) => setValue(e.target.value)}
          />
          {value ? (
            <md-icon-button aria-label="Clear" title="Clear" onClick={clear}>
              <span className="icon">close</span>
            </md-icon-button>
          ) : (
            <span className="sfield-sp" />
          )}
        </form>
        <ViewToggle />
      </header>
      <main className="body">
        <div className={view === "grid" ? "col grid" : "col"}>
          {pending ? (
            <>
              <p className="count" aria-hidden="true">&nbsp;</p>
              <CardSkeletons count={view === "grid" ? 8 : 6} />
            </>
          ) : (
            children ?? <TryChips onPick={run} />
          )}
        </div>
      </main>
    </>
  );
}

/** 4 · Static suggestions; tapping runs that query. */
function TryChips({ onPick }: { onPick: (q: string) => void }) {
  return (
    <div className="sugg">
      <h2>Try</h2>
      <div className="sugg-chips">
        {TRY_QUERIES.map((t) => (
          <md-assist-chip key={t} label={t} onClick={() => onPick(t)} />
        ))}
      </div>
    </div>
  );
}
