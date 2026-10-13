"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { CONTENT_TYPES, typeHref, type ContentType } from "@/lib/content-type";
import { CardSkeletons } from "./Skeletons";
import { useViewMode } from "./ViewMode";

const OPTIONS: { value: ContentType | null; label: string }[] = [{ value: null, label: "All" }, ...CONTENT_TYPES];

type ChipsProps = { selected: ContentType | null; onSelect?: (t: ContentType | null) => void };

/** 1, 2 · Single-select row of MD3 filter chips; scrolls sideways, never wraps. */
function TypeChips({ selected, onSelect }: ChipsProps) {
  return (
    <div role="toolbar" aria-label="Content type" className="chips">
      {OPTIONS.map((o) => (
        <md-filter-chip
          key={o.label}
          label={o.label}
          selected={o.value === selected}
          onClick={(e) => {
            // The chip toggles itself; React owns `selected`, so cancel that.
            e.preventDefault();
            if (o.value !== selected) onSelect?.(o.value);
          }}
        />
      ))}
    </div>
  );
}

/** 1, 2, 4 · Chips plus the results; results become skeletons while a new filter loads. */
export function TypeFilter({ type, children }: { type: ContentType | null; children: React.ReactNode }) {
  const router = useRouter();
  const { view } = useViewMode();
  const [pending, startTransition] = useTransition();
  const [target, setTarget] = useState(type);

  const select = (t: ContentType | null) => {
    setTarget(t);
    window.scrollTo(0, 0);
    startTransition(() => router.replace(typeHref(t)));
  };

  return (
    <>
      <TypeChips selected={pending ? target : type} onSelect={select} />
      {pending ? <CardSkeletons count={view === "grid" ? 8 : 6} /> : children}
    </>
  );
}
