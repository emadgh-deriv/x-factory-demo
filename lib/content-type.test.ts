import { describe, expect, it } from "vitest";
import { archiveNotice, parseType, typeHref } from "./content-type";

describe("parseType", () => {
  it("accepts the four Guardian types", () => {
    for (const t of ["article", "liveblog", "gallery", "video"]) expect(parseType(t)).toBe(t);
  });
  it("treats anything else as All (null)", () => {
    expect(parseType(undefined)).toBeNull();
    expect(parseType("")).toBeNull();
    expect(parseType("Video")).toBeNull();
    expect(parseType("liveblog|gallery")).toBeNull();
    expect(parseType(["video", "article"])).toBe("video");
  });
});

describe("typeHref", () => {
  it("removes the param for All", () => {
    expect(typeHref(null)).toBe("/");
    expect(typeHref("liveblog")).toBe("/?type=liveblog");
  });
});

describe("archiveNotice", () => {
  const now = new Date("2026-10-13T12:00:00Z");
  it("explains archive-only video and galleries", () => {
    expect(archiveNotice("video", "2018-02-14T10:00:00Z", now)).toBe(
      "The Guardian no longer publishes sport video here. Showing the archive, newest from Feb 2018.",
    );
    expect(archiveNotice("gallery", "2018-04-04T10:00:00Z", now)).toBe(
      "The Guardian no longer publishes sport galleries here. Showing the archive, newest from Apr 2018.",
    );
  });
  it("is absent when content is recent, for other types, or with no items", () => {
    expect(archiveNotice("video", "2026-09-01T00:00:00Z", now)).toBeNull();
    expect(archiveNotice("liveblog", "2018-02-14T10:00:00Z", now)).toBeNull();
    expect(archiveNotice(null, "2018-02-14T10:00:00Z", now)).toBeNull();
    expect(archiveNotice("video", undefined, now)).toBeNull();
  });
});
