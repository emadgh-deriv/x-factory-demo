"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ThemeMenu } from "./ThemeMenu";

type Props = { back?: boolean; webUrl?: string; action?: React.ReactNode };

/** 1 · Small top app bar; search icon on list screens. 9 · back, 10 · open original (article only). Theme menu on every screen. */
export function TopBar({ back, webUrl, action }: Props) {
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 0);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // 1 · `/` opens search from list screens (desktop keyboards), unless typing in a field.
  useEffect(() => {
    if (back) return;
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      if (e.key !== "/" || e.metaKey || e.ctrlKey || e.altKey) return;
      if (t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName))) return;
      e.preventDefault();
      router.push("/search");
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [back, router]);

  const goBack = () => {
    if (window.history.length > 1) router.back();
    else router.push("/");
  };

  return (
    <header className={`bar${scrolled ? " scrolled" : ""}`}>
      {back ? (
        <md-icon-button aria-label="Back" onClick={goBack}>
          <span className="icon">arrow_back</span>
        </md-icon-button>
      ) : (
        <span className="icon brand" aria-hidden="true">sports_soccer</span>
      )}
      <Link href="/" className="title">Sport-Radar</Link>
      <span className="sp" />
      {!back && (
        <md-icon-button aria-label="Search" title="Search" onClick={() => router.push("/search")}>
          <span className="icon">search</span>
        </md-icon-button>
      )}
      {action}
      <ThemeMenu />
      {webUrl && (
        <md-icon-button href={webUrl} target="_blank" aria-label="Read on The Guardian" title="Read on The Guardian">
          <span className="icon">open_in_new</span>
        </md-icon-button>
      )}
    </header>
  );
}
