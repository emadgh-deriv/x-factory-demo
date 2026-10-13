import { notFound } from "next/navigation";
import { fetchArticle, GuardianError, type Article } from "@/lib/guardian";
import { ErrorPanel } from "@/app/components/Panel";
import { LiveBadge } from "@/app/components/LiveBadge";
import { TopBar } from "@/app/components/TopBar";
import { ArticleDate } from "./ArticleDate";

type Props = { params: Promise<{ id: string[] }> };

const RESERVED = new Set(["search", "tags", "sections", "editions"]);

/** Guardian content ids look like "sport/2026/oct/12/slug"; reject anything that would hit another endpoint. */
function contentId(parts: string[]): string | null {
  const id = parts.map(decodeURIComponent).join("/");
  if (parts.length < 3 || RESERVED.has(parts[0]) || !/^[a-z0-9-]+(\/[a-z0-9-]+)+$/i.test(id)) return null;
  return id;
}

/** 2 · Article (4 loading in loading.tsx, 7 not found, 5 error). */
export default async function ArticlePage({ params }: Props) {
  const id = contentId((await params).id);
  if (!id) notFound();

  let article: Article | null;
  try {
    article = await fetchArticle(id);
  } catch (e) {
    console.error("article failed:", e instanceof Error ? e.message : "unknown");
    return (
      <>
        <TopBar back />
        <ErrorPanel title="Can't load this article" rateLimited={e instanceof GuardianError && e.kind === "rate-limited"} />
      </>
    );
  }
  if (!article) notFound();

  return (
    <>
      <TopBar back webUrl={article.webUrl} />
      <main className="body">
        <article className="art">
          {article.live && <LiveBadge />}
          <h1 className="ah">{article.headline}</h1>
          {article.standfirst && <p className="sf" dangerouslySetInnerHTML={{ __html: article.standfirst }} />}
          <div className="am">
            {article.byline && <>{article.byline} · </>}
            <ArticleDate iso={article.published} />
          </div>
          {article.main && (
            <figure className="mainimg">
              <div className="frame">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={article.main.src} alt={article.main.alt} />
              </div>
              {article.main.caption && <figcaption>{article.main.caption}</figcaption>}
            </figure>
          )}
          <div className="prose" dangerouslySetInnerHTML={{ __html: article.body }} />
          <div className="ext">
            <md-outlined-button href={article.webUrl} target="_blank" has-icon>
              <span slot="icon" className="icon">open_in_new</span>
              Read on The Guardian
            </md-outlined-button>
          </div>
        </article>
      </main>
    </>
  );
}
