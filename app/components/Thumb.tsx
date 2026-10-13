"use client";

import { useEffect, useRef, useState } from "react";

/** 6 · Fixed-size image box; placeholder icon when missing or broken, fade-in when loaded. */
export function Thumb({ src }: { src: string | null }) {
  const ref = useRef<HTMLImageElement>(null);
  const [state, setState] = useState<"loading" | "loaded" | "failed">(src ? "loading" : "failed");

  useEffect(() => {
    // The image may have settled before hydration attached the handlers.
    const img = ref.current;
    if (img?.complete) setState(img.naturalWidth > 0 ? "loaded" : "failed");
  }, []);

  return (
    <div className="thumb" aria-hidden="true">
      {state !== "loaded" && <span className="icon">sports</span>}
      {src && state !== "failed" && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          ref={ref}
          src={src}
          alt=""
          loading="lazy"
          className={state === "loaded" ? "loaded" : undefined}
          onLoad={() => setState("loaded")}
          onError={() => setState("failed")}
        />
      )}
    </div>
  );
}
