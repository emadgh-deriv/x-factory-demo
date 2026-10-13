"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type Props = { back?: boolean; webUrl?: string; action?: React.ReactNode };

/** 1 · Small top app bar. 9 · back, 10 · open original (article only). */
export function TopBar({ back, webUrl, action }: Props) {
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 0);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

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
      {action}
      {webUrl && (
        <md-icon-button href={webUrl} target="_blank" aria-label="Read on The Guardian" title="Read on The Guardian">
          <span className="icon">open_in_new</span>
        </md-icon-button>
      )}
    </header>
  );
}
