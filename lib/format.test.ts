import { describe, expect, it } from "vitest";
import { fullDate, relativeTime, stripHtml } from "./format";

describe("stripHtml", () => {
  it("removes tags and decodes entities", () => {
    expect(stripHtml('<strong>Live</strong> &ndash; Arsenal v <a href="x">Spurs</a> &amp; more&#39;s')).toBe(
      "Live – Arsenal v Spurs & more's",
    );
  });
  it("collapses whitespace and handles empty input", () => {
    expect(stripHtml("  a\n\n b ")).toBe("a b");
    expect(stripHtml(undefined)).toBe("");
  });
});

describe("relativeTime", () => {
  const now = new Date("2026-10-12T12:00:00Z");
  it("says Just now under a minute", () => {
    expect(relativeTime("2026-10-12T11:59:30Z", now)).toBe("Just now");
  });
  it("uses minutes under an hour", () => {
    expect(relativeTime("2026-10-12T11:15:00Z", now)).toBe("45 min ago");
  });
  it("uses hours under a day", () => {
    expect(relativeTime("2026-10-12T09:00:00Z", now)).toBe("3 h ago");
  });
  it("uses d MMM after a day, with year when not current", () => {
    expect(relativeTime("2026-10-11T08:00:00Z", now)).toBe("11 Oct");
    expect(relativeTime("2025-12-30T08:00:00Z", now)).toBe("30 Dec 2025");
  });
});

describe("fullDate", () => {
  it("formats as Mon 12 Oct 2026, 08:00 in the given zone", () => {
    expect(fullDate("2026-10-12T08:00:00Z", "UTC")).toBe("Mon 12 Oct 2026, 08:00");
  });
});
