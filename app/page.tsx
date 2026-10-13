import { cookies } from "next/headers";
import { archiveNotice, parseType, typeHref } from "@/lib/content-type";
import { fetchSportPage, GuardianError, type SportPage } from "@/lib/guardian";
import { ArchiveNotice } from "./components/ArchiveNotice";
import { HeadlineList } from "./components/HeadlineList";
import { ErrorPanel, Panel } from "./components/Panel";
import { TopBar } from "./components/TopBar";
import { TypeFilter } from "./components/TypeFilter";
import { ViewCol, ViewModeProvider, ViewToggle } from "./components/ViewMode";
import { parseView, VIEW_COOKIE } from "@/lib/view";

export const dynamic = "force-dynamic";

type Props = { searchParams: Promise<{ type?: string | string[] }> };

/** 1 · Headline list (5 error, 6 empty), filtered by content type. */
export default async function Home({ searchParams }: Props) {
  const view = parseView((await cookies()).get(VIEW_COOKIE)?.value);
  const type = parseType((await searchParams).type);
  let data: SportPage | null = null;
  let rateLimited = false;
  try {
    data = await fetchSportPage(1, type);
  } catch (e) {
    rateLimited = e instanceof GuardianError && e.kind === "rate-limited";
    console.error("sport list failed:", e instanceof Error ? e.message : "unknown");
  }

  const hasItems = !!data && data.items.length > 0;
  const notice = archiveNotice(type, data?.items[0]?.published);

  return (
    <ViewModeProvider initial={view}>
      <TopBar action={hasItems ? <ViewToggle /> : undefined} />
      <main className="body">
        <ViewCol>
          <h1 className="ph2">Latest sport</h1>
          <TypeFilter type={type}>
            {!data ? (
              <ErrorPanel rateLimited={rateLimited} />
            ) : !hasItems ? (
              type ? (
                <Panel icon="newspaper" title="No sport news right now" text="Nothing of this type yet." action="Show all" to={typeHref(null)} tonal />
              ) : (
                <Panel icon="newspaper" title="No sport news right now" text="Check back later." action="Refresh" to="retry" tonal />
              )
            ) : (
              <>
                {notice && <ArchiveNotice text={notice} />}
                <HeadlineList key={type ?? "all"} initial={data} type={type} />
                <p className="attr">News from The Guardian Open Platform</p>
              </>
            )}
          </TypeFilter>
        </ViewCol>
      </main>
    </ViewModeProvider>
  );
}
