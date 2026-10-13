"use client";

import { createContext, useContext, useLayoutEffect, useRef, useState } from "react";
import { viewCookie, type View } from "@/lib/view";

type Ctx = { view: View; toggle: () => void };
const ViewCtx = createContext<Ctx>({ view: "list", toggle: () => {} });

const BAR = 64;

/** The card nearest the top of the viewport, and how far below the app bar it sits. */
function firstVisibleCard(): { index: number; offset: number } | null {
  const cards = document.querySelectorAll<HTMLElement>(".cards > .card");
  for (let i = 0; i < cards.length; i++) {
    const r = cards[i].getBoundingClientRect();
    if (r.bottom > BAR) return { index: i, offset: r.top };
  }
  return null;
}

export function ViewModeProvider({ initial, children }: { initial: View; children: React.ReactNode }) {
  const [view, setView] = useState(initial);
  const anchor = useRef<{ index: number; offset: number } | null>(null);

  const toggle = () => {
    const next: View = view === "list" ? "grid" : "list";
    anchor.current = window.scrollY > 0 ? firstVisibleCard() : null;
    setView(next);
    try {
      document.cookie = viewCookie(next);
    } catch {
      // Storage unavailable: the choice lasts for this session only.
    }
  };

  // 1 · Keep the first visible card in view across the layout swap.
  useLayoutEffect(() => {
    const a = anchor.current;
    anchor.current = null;
    if (!a) return;
    const card = document.querySelectorAll<HTMLElement>(".cards > .card")[a.index];
    if (card) window.scrollBy(0, card.getBoundingClientRect().top - Math.max(a.offset, BAR));
  }, [view]);

  return <ViewCtx.Provider value={{ view, toggle }}>{children}</ViewCtx.Provider>;
}

export const useViewMode = () => useContext(ViewCtx);

/** 1 · Shows the icon of the view you switch to. */
export function ViewToggle() {
  const { view, toggle } = useViewMode();
  const label = view === "list" ? "Switch to grid view" : "Switch to list view";
  return (
    <md-icon-button aria-label={label} title={label} onClick={toggle}>
      <span className="icon">{view === "list" ? "view_module" : "view_agenda"}</span>
    </md-icon-button>
  );
}

/** 2 · Content column; widens and switches cards to tiles in grid view. */
export function ViewCol({ children }: { children: React.ReactNode }) {
  const { view } = useViewMode();
  return <div className={view === "grid" ? "col grid" : "col"}>{children}</div>;
}
