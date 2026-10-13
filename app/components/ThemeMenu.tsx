"use client";

import { useEffect, useRef, useState } from "react";
import { MODE_COOKIE, parseMode, parseTheme, THEME_COOKIE, themeCookie, THEMES, type Mode, type Theme } from "@/lib/theme";

/** Current choice as applied on <html>; with no stored mode, the device's. */
function current(): { theme: Theme; mode: Mode } {
  const root = document.documentElement;
  const mode = parseMode(root.dataset.mode) ?? (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
  return { theme: parseTheme(root.dataset.theme), mode };
}

function save(name: typeof THEME_COOKIE | typeof MODE_COOKIE, value: string) {
  try {
    document.cookie = themeCookie(name, value);
  } catch {
    // Storage unavailable: the choice lasts for this page only.
  }
}

/** 1 · Theme button, 2 · swatches, 3 · mode segmented button, 4 · menu surface. */
export function ThemeMenu() {
  const [open, setOpen] = useState(false);
  const [state, setState] = useState<{ theme: Theme; mode: Mode }>({ theme: "blue", mode: "light" });
  const wrap = useRef<HTMLDivElement>(null);
  const button = useRef<HTMLElement>(null);
  const swatches = useRef<(HTMLButtonElement | null)[]>([]);

  const close = (refocus: boolean) => {
    setOpen(false);
    if (refocus) button.current?.focus();
  };

  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (!wrap.current?.contains(e.target as Node)) close(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close(true);
    };
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const toggle = () => {
    if (open) return close(true);
    setState(current());
    setOpen(true);
  };

  // 5 · Instant: only the <html> attributes change, tokens.css does the rest.
  const pickTheme = (theme: Theme) => {
    document.documentElement.dataset.theme = theme;
    save(THEME_COOKIE, theme);
    setState((s) => ({ ...s, theme }));
  };
  const pickMode = (mode: Mode) => {
    document.documentElement.dataset.mode = mode;
    save(MODE_COOKIE, mode);
    setState((s) => ({ ...s, mode }));
  };

  const onSwatchKey = (e: React.KeyboardEvent, i: number) => {
    const step = e.key === "ArrowRight" || e.key === "ArrowDown" ? 1 : e.key === "ArrowLeft" || e.key === "ArrowUp" ? -1 : 0;
    if (!step) return;
    e.preventDefault();
    const next = (i + step + THEMES.length) % THEMES.length;
    pickTheme(THEMES[next].id);
    swatches.current[next]?.focus();
  };

  return (
    <div className="tm-wrap" ref={wrap}>
      <md-icon-button ref={button} aria-label="Theme" title="Theme" aria-haspopup="dialog" aria-expanded={open ? "true" : "false"} onClick={toggle}>
        <span className="icon">palette</span>
      </md-icon-button>
      {open && (
        <div className="tm" role="dialog" aria-label="Theme">
          <h3 id="tm-colour">Colour</h3>
          <div className="sw" role="radiogroup" aria-labelledby="tm-colour">
            {THEMES.map((t, i) => {
              const on = t.id === state.theme;
              return (
                <button
                  key={t.id}
                  ref={(el) => {
                    swatches.current[i] = el;
                  }}
                  type="button"
                  role="radio"
                  aria-checked={on}
                  aria-label={t.name}
                  title={t.name}
                  tabIndex={on ? 0 : -1}
                  className={on ? "dot on" : "dot"}
                  style={{ background: t.seed }}
                  onClick={() => pickTheme(t.id)}
                  onKeyDown={(e) => onSwatchKey(e, i)}
                >
                  {on && <span className="icon" aria-hidden="true">check</span>}
                </button>
              );
            })}
          </div>
          <h3 id="tm-mode">Mode</h3>
          <div className="seg" role="radiogroup" aria-labelledby="tm-mode">
            {(["light", "dark"] as const).map((m) => {
              const on = m === state.mode;
              return (
                <button key={m} type="button" role="radio" aria-checked={on} className={on ? "on" : undefined} onClick={() => pickMode(m)}>
                  {on && <span className="icon" aria-hidden="true">check</span>}
                  {m === "light" ? "Light" : "Dark"}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
