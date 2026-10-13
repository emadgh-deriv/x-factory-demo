"use client";

import { useEffect, useState } from "react";
import { fullDate } from "@/lib/format";

/** 13 · Full date in the reader's local time zone (UTC until hydrated). */
export function ArticleDate({ iso }: { iso: string }) {
  const [text, setText] = useState(() => fullDate(iso, "UTC"));
  useEffect(() => setText(fullDate(iso)), [iso]);
  return <time dateTime={iso} suppressHydrationWarning>{text}</time>;
}
