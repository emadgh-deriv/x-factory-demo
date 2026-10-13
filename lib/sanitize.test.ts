import { describe, expect, it } from "vitest";
import { parseMainFigure, sanitizeBody, sanitizeInline } from "./sanitize";

describe("sanitizeBody", () => {
  it("drops scripts, iframes and event handlers", () => {
    const out = sanitizeBody(
      '<p onclick="x()">Hi<script>alert(1)</script></p><iframe src="https://evil"></iframe><figure class="element-tweet"><blockquote>t</blockquote></figure>',
    );
    expect(out).toBe("<p>Hi</p>");
  });
  it("keeps text, links, lists, quotes, headings and images", () => {
    const out = sanitizeBody(
      '<h2>H</h2><ul><li>a</li></ul><blockquote><p>q</p></blockquote><figure class="element-image"><img src="https://i.guim.co.uk/a.jpg" alt="A"><figcaption>Cap</figcaption></figure>',
    );
    expect(out).toContain("<h2>H</h2>");
    expect(out).toContain("<li>a</li>");
    expect(out).toContain("<blockquote>");
    expect(out).toContain('<img src="https://i.guim.co.uk/a.jpg" alt="A" loading="lazy" />');
    expect(out).toContain("<figcaption>Cap</figcaption>");
  });
  it("makes links open in a new tab and rejects javascript: hrefs", () => {
    const out = sanitizeBody('<a href="https://x.com">x</a><a href="javascript:alert(1)">y</a>');
    expect(out).toContain('<a href="https://x.com" target="_blank" rel="noopener noreferrer">x</a>');
    expect(out).not.toContain("javascript");
  });
});

describe("sanitizeInline", () => {
  it("keeps only inline formatting and links", () => {
    expect(sanitizeInline('<p>Standfirst <strong>bold</strong><img src="x"></p>')).toBe(
      "Standfirst <strong>bold</strong>",
    );
  });
});

describe("parseMainFigure", () => {
  it("extracts the largest image and caption", () => {
    const html =
      '<figure class="element element-image"><img src="https://media.guim.co.uk/a/500.jpg" alt="Alt text" width="500" height="300" class="gu-image" /> <figcaption> <span class="element-image__caption">Player scores.</span> <span class="element-image__credit">Photograph: X/Getty</span> </figcaption> </figure>';
    expect(parseMainFigure(html)).toEqual({
      src: "https://media.guim.co.uk/a/500.jpg",
      alt: "Alt text",
      caption: "Player scores. Photograph: X/Getty",
    });
  });
  it("returns null for video or missing main", () => {
    expect(parseMainFigure('<figure class="element-atom"><gu-atom></gu-atom></figure>')).toBeNull();
    expect(parseMainFigure(undefined)).toBeNull();
  });
});
