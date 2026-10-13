import sanitizeHtml from "sanitize-html";
import { stripHtml } from "./format";

const linkTransform = (tagName: string, attribs: Record<string, string>) => ({
  tagName,
  attribs: { ...attribs, target: "_blank", rel: "noopener noreferrer" },
});

/** Article body: text, links, images, lists, quotes, headings. No scripts, iframes or embeds. */
export function sanitizeBody(html: string | undefined): string {
  if (!html) return "";
  // Embeds (tweets, atoms, video, interactive) are wrapped in non-image figures; drop them whole.
  const withoutEmbeds = html.replace(
    /<figure\b(?![^>]*\belement-image\b)[^>]*>[\s\S]*?<\/figure>/gi,
    "",
  );
  return sanitizeHtml(withoutEmbeds, {
    allowedTags: [
      "p", "br", "a", "strong", "b", "em", "i", "ul", "ol", "li", "blockquote",
      "h2", "h3", "h4", "figure", "figcaption", "img", "span", "sub", "sup", "hr",
    ],
    allowedAttributes: { a: ["href", "target", "rel"], img: ["src", "alt", "loading"] },
    allowedSchemes: ["https", "http", "mailto"],
    nonTextTags: ["script", "style", "iframe", "noscript", "textarea", "option"],
    transformTags: {
      a: linkTransform,
      img: (tagName, attribs) => ({ tagName, attribs: { ...attribs, loading: "lazy" } }),
    },
  }).trim();
}

/** Standfirst and similar: inline formatting only. */
export function sanitizeInline(html: string | undefined): string {
  if (!html) return "";
  return sanitizeHtml(html, {
    allowedTags: ["a", "strong", "b", "em", "i"],
    allowedAttributes: { a: ["href", "target", "rel"] },
    allowedSchemes: ["https", "http"],
    transformTags: { a: linkTransform },
  }).trim();
}

export type MainImage = { src: string; alt: string; caption: string };

/** `fields.main` is a <figure>; returns null when it is not an image (e.g. a video atom). */
export function parseMainFigure(html: string | undefined): MainImage | null {
  if (!html || !/element-image/.test(html)) return null;
  const img = html.match(/<img\b[^>]*>/i)?.[0];
  const src = img?.match(/\ssrc="([^"]+)"/i)?.[1];
  if (!src || !/^https:\/\//.test(src)) return null;
  const alt = stripHtml(img?.match(/\salt="([^"]*)"/i)?.[1]);
  const caption = stripHtml(html.match(/<figcaption[^>]*>([\s\S]*?)<\/figcaption>/i)?.[1]);
  return { src, alt, caption };
}
