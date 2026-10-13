import { describe, expect, it } from "vitest";
import { MODE_COOKIE, parseMode, parseTheme, THEME_COOKIE, themeCookie, THEMES } from "./theme";

describe("parseTheme", () => {
  it("accepts the four themes", () => {
    for (const t of ["green", "blue", "gold", "red"]) expect(parseTheme(t)).toBe(t);
  });
  it("falls back to blue for anything else", () => {
    expect(parseTheme(undefined)).toBe("blue");
    expect(parseTheme("")).toBe("blue");
    expect(parseTheme("RED")).toBe("blue");
    expect(parseTheme("purple")).toBe("blue");
  });
});

describe("parseMode", () => {
  it("accepts light and dark", () => {
    expect(parseMode("light")).toBe("light");
    expect(parseMode("dark")).toBe("dark");
  });
  it("returns undefined (follow device) for anything else", () => {
    expect(parseMode(undefined)).toBeUndefined();
    expect(parseMode("system")).toBeUndefined();
    expect(parseMode("Dark")).toBeUndefined();
  });
});

describe("themeCookie", () => {
  it("builds long-lived, lax, root-path cookies", () => {
    for (const [name, v] of [[THEME_COOKIE, "red"], [MODE_COOKIE, "dark"]] as const) {
      const c = themeCookie(name, v);
      expect(c.startsWith(`${name}=${v};`)).toBe(true);
      expect(c).toContain("Path=/");
      expect(c).toContain("Max-Age=31536000");
      expect(c).toContain("SameSite=Lax");
    }
  });
});

describe("THEMES", () => {
  it("lists the four seeds in menu order", () => {
    expect(THEMES.map((t) => t.id)).toEqual(["green", "blue", "gold", "red"]);
  });
});
