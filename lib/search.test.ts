import { describe, expect, it } from "vitest";
import { countText, highlightTerms, parseQuery, searchHref, splitHighlight } from "./search";

describe("parseQuery", () => {
  it("trims, takes the first value and cuts to 100 chars", () => {
    expect(parseQuery("  tennis ")).toBe("tennis");
    expect(parseQuery(["a", "b"])).toBe("a");
    expect(parseQuery(undefined)).toBe("");
    expect(parseQuery("   ")).toBe("");
    expect(parseQuery("x".repeat(150))).toHaveLength(100);
  });
});

describe("countText", () => {
  it("formats en-GB and handles the singular", () => {
    expect(countText(17734, "tennis")).toBe("17,734 results for “tennis” · newest first");
    expect(countText(1, "x")).toBe("1 result for “x” · newest first");
  });
});

describe("searchHref", () => {
  it("encodes q and drops empty", () => {
    expect(searchHref("world cup")).toBe("/search?q=world+cup");
    expect(searchHref("")).toBe("/search");
  });
});

describe("highlightTerms", () => {
  it("drops operators and quotes", () => {
    expect(highlightTerms('"world cup" AND final')).toEqual(["world", "cup", "final"]);
    expect(highlightTerms("  ")).toEqual([]);
  });
});

describe("splitHighlight", () => {
  it("marks whole-word, case-insensitive matches", () => {
    expect(splitHighlight("US Open tennis 2026", ["Tennis"])).toEqual([
      { text: "US Open ", mark: false },
      { text: "tennis", mark: true },
      { text: " 2026", mark: false },
    ]);
  });
  it("does not mark inside words and escapes regex characters", () => {
    expect(splitHighlight("Tennis Australia", ["tenn"])).toEqual([{ text: "Tennis Australia", mark: false }]);
    expect(splitHighlight("a+b", ["a+"])).toEqual([{ text: "a+b", mark: false }]);
  });
  it("returns the text unchanged with no terms", () => {
    expect(splitHighlight("Hi", [])).toEqual([{ text: "Hi", mark: false }]);
  });
});
