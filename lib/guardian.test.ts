import { afterEach, describe, expect, it, vi } from "vitest";
import { fetchArticle, fetchSportPage, GuardianError, searchSport } from "./guardian";

function mockFetch(status: number, body: unknown) {
  const fn = vi.fn().mockResolvedValue(new Response(JSON.stringify(body), { status }));
  vi.stubGlobal("fetch", fn);
  return fn;
}

afterEach(() => vi.unstubAllGlobals());
process.env.GUARDIAN_API_KEY = "test-key";

describe("fetchSportPage", () => {
  it("maps results and sends the key as a header, not in the URL", async () => {
    const fn = mockFetch(200, {
      response: {
        status: "ok",
        currentPage: 1,
        pages: 3,
        results: [
          {
            id: "sport/2026/oct/12/a",
            type: "liveblog",
            webTitle: "A",
            webPublicationDate: "2026-10-12T08:00:00Z",
            webUrl: "https://www.theguardian.com/sport/2026/oct/12/a",
            fields: { thumbnail: "https://t.jpg", trailText: "<strong>T</strong> &amp; u", byline: "Jo" },
          },
        ],
      },
    });
    const page = await fetchSportPage(1);
    const [url, init] = fn.mock.calls[0];
    expect(String(url)).not.toContain("test-key");
    expect(init.headers["api-key"]).toBe("test-key");
    expect(page).toEqual({
      currentPage: 1,
      pages: 3,
      items: [
        {
          id: "sport/2026/oct/12/a",
          headline: "A",
          trail: "T & u",
          byline: "Jo",
          thumbnail: "https://t.jpg",
          published: "2026-10-12T08:00:00Z",
          live: true,
        },
      ],
    });
  });

  it("adds type= only when a filter is set", async () => {
    const empty = { response: { status: "ok", currentPage: 1, pages: 0, results: [] } };
    let fn = mockFetch(200, empty);
    await fetchSportPage(2, "liveblog");
    const url = new URL(String(fn.mock.calls[0][0]));
    expect(url.searchParams.get("type")).toBe("liveblog");
    expect(url.searchParams.get("page")).toBe("2");
    fn = mockFetch(200, empty);
    await fetchSportPage(1);
    expect(new URL(String(fn.mock.calls[0][0])).searchParams.has("type")).toBe(false);
  });

  it("throws rate-limited on 429", async () => {
    mockFetch(429, { message: "API rate limit exceeded" });
    await expect(fetchSportPage(1)).rejects.toMatchObject({ kind: "rate-limited" });
  });

  it("throws unavailable on 5xx", async () => {
    mockFetch(503, {});
    await expect(fetchSportPage(1)).rejects.toBeInstanceOf(GuardianError);
  });
});

describe("searchSport", () => {
  it("searches sport and football, newest first, and returns the total", async () => {
    const fn = mockFetch(200, { response: { status: "ok", total: 17734, currentPage: 2, pages: 887, results: [] } });
    const page = await searchSport("world cup", 2);
    const url = new URL(String(fn.mock.calls[0][0]));
    expect(url.searchParams.get("q")).toBe("world cup");
    expect(url.searchParams.get("section")).toBe("sport|football");
    expect(url.searchParams.get("order-by")).toBe("newest");
    expect(url.searchParams.get("page")).toBe("2");
    expect(url.searchParams.get("page-size")).toBe("20");
    expect(page).toEqual({ currentPage: 2, pages: 887, total: 17734, items: [] });
  });

  it("throws rate-limited on 429", async () => {
    mockFetch(429, {});
    await expect(searchSport("x", 1)).rejects.toMatchObject({ kind: "rate-limited" });
  });
});

describe("fetchArticle", () => {
  it("returns null on 404", async () => {
    mockFetch(404, { response: { status: "error", message: "The requested resource could not be found." } });
    expect(await fetchArticle("sport/nope")).toBeNull();
  });

  it("maps fields and falls back to webTitle", async () => {
    mockFetch(200, {
      response: {
        content: {
          id: "sport/x",
          type: "article",
          webTitle: "Web title",
          webPublicationDate: "2026-10-12T08:00:00Z",
          webUrl: "https://www.theguardian.com/sport/x",
          fields: { body: "<p>Body</p><script>x</script>" },
        },
      },
    });
    const a = await fetchArticle("sport/x");
    expect(a).toMatchObject({ headline: "Web title", body: "<p>Body</p>", standfirst: "", main: null, live: false });
  });
});
