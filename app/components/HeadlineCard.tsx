"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { Headline } from "@/lib/guardian";
import { fullDate, relativeTime } from "@/lib/format";
import { splitHighlight } from "@/lib/search";
import { LiveBadge } from "./LiveBadge";
import { Thumb } from "./Thumb";

type Props = { item: Headline; onOpen?: () => void; terms?: string[] };

/** 3 · Filled card, whole card links to the article. */
export function HeadlineCard({ item, onOpen, terms }: Props) {
  // Relative and local times depend on the viewer's clock and zone; fill them in after hydration.
  const [time, setTime] = useState<{ rel: string; full: string } | null>(null);
  useEffect(() => {
    setTime({ rel: relativeTime(item.published), full: fullDate(item.published) });
  }, [item.published]);

  return (
    <Link href={`/article/${item.id}`} className="card" onClick={onOpen}>
      <Thumb src={item.thumbnail} />
      <div className="ct">
        <h3 className="hl">
          {item.live && <LiveBadge />}
          {terms
            ? splitHighlight(item.headline, terms).map((s, i) => (s.mark ? <mark key={i}>{s.text}</mark> : s.text))
            : item.headline}
        </h3>
        {item.trail && <p className="tr">{item.trail}</p>}
        <div className="meta">
          {item.byline && <>{item.byline} · </>}
          <time dateTime={item.published} title={time?.full}>
            {time?.rel ?? " "}
          </time>
        </div>
      </div>
    </Link>
  );
}
