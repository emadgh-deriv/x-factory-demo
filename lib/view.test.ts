import { describe, expect, it } from "vitest";
import { parseView, VIEW_COOKIE, viewCookie } from "./view";

describe("parseView", () => {
  it("accepts grid and list", () => {
    expect(parseView("grid")).toBe("grid");
    expect(parseView("list")).toBe("list");
  });
  it("falls back to list for anything else", () => {
    expect(parseView(undefined)).toBe("list");
    expect(parseView("")).toBe("list");
    expect(parseView("GRID")).toBe("list");
    expect(parseView("tiles")).toBe("list");
  });
});

describe("viewCookie", () => {
  it("builds a long-lived, lax, root-path cookie", () => {
    const c = viewCookie("grid");
    expect(c.startsWith(`${VIEW_COOKIE}=grid;`)).toBe(true);
    expect(c).toContain("Path=/");
    expect(c).toContain("Max-Age=31536000");
    expect(c).toContain("SameSite=Lax");
  });
});
