"use client";

import { useRouter } from "next/navigation";

type Props = {
  icon: string;
  title: string;
  text: string;
  action: string;
  /** "retry" refreshes the route; a path navigates there. */
  to: "retry" | string;
  tonal?: boolean;
};

/** 5, 6, 7 · Centered icon + text + button. */
export function Panel({ icon, title, text, action, to, tonal }: Props) {
  const router = useRouter();
  const onClick = () => (to === "retry" ? router.refresh() : router.push(to));
  return (
    <div className="center">
      <div className="panel" role={to === "retry" ? "alert" : undefined}>
        <span className="icon" aria-hidden="true">{icon}</span>
        <h2>{title}</h2>
        <p>{text}</p>
        {tonal ? (
          <md-filled-tonal-button onClick={onClick}>{action}</md-filled-tonal-button>
        ) : (
          <md-filled-button onClick={onClick}>{action}</md-filled-button>
        )}
      </div>
    </div>
  );
}

export function ErrorPanel({ rateLimited, title = "Can't load sport news" }: { rateLimited: boolean; title?: string }) {
  return (
    <Panel
      icon="cloud_off"
      title={title}
      text={
        rateLimited
          ? "Too many requests right now. Try again in a minute."
          : "The Guardian didn't respond. Check your connection and try again."
      }
      action="Retry"
      to="retry"
    />
  );
}
