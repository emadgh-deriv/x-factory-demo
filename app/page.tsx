import { cookies } from "next/headers";
import { fetchSportPage, GuardianError, type SportPage } from "@/lib/guardian";
import { HeadlineList } from "./components/HeadlineList";
import { ErrorPanel, Panel } from "./components/Panel";
import { TopBar } from "./components/TopBar";
import { ViewCol, ViewModeProvider, ViewToggle } from "./components/ViewMode";
import { parseView, VIEW_COOKIE } from "@/lib/view";

export const dynamic = "force-dynamic";

/** 1 · Headline list (5 error, 6 empty). */
export default async function Home() {
  const view = parseView((await cookies()).get(VIEW_COOKIE)?.value);
  let data: SportPage | null = null;
  let rateLimited = false;
  try {
    data = await fetchSportPage(1);
  } catch (e) {
    rateLimited = e instanceof GuardianError && e.kind === "rate-limited";
    console.error("sport list failed:", e instanceof Error ? e.message : "unknown");
  }

  const hasItems = !!data && data.items.length > 0;

  return (
    <ViewModeProvider initial={view}>
      <TopBar action={hasItems ? <ViewToggle /> : undefined} />
      {!data ? (
        <ErrorPanel rateLimited={rateLimited} />
      ) : data.items.length === 0 ? (
        <Panel icon="newspaper" title="No sport news right now" text="Check back later." action="Refresh" to="retry" tonal />
      ) : (
        <main className="body">
          <ViewCol>
            <h1 className="ph2">Latest sport</h1>
            <HeadlineList initial={data} />
            <p className="attr">News from The Guardian Open Platform</p>
          </ViewCol>
        </main>
      )}
    </ViewModeProvider>
  );
}
