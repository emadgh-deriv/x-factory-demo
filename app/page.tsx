import { fetchSportPage, GuardianError, type SportPage } from "@/lib/guardian";
import { HeadlineList } from "./components/HeadlineList";
import { ErrorPanel, Panel } from "./components/Panel";
import { TopBar } from "./components/TopBar";

export const dynamic = "force-dynamic";

/** 1 · Headline list (5 error, 6 empty). */
export default async function Home() {
  let data: SportPage | null = null;
  let rateLimited = false;
  try {
    data = await fetchSportPage(1);
  } catch (e) {
    rateLimited = e instanceof GuardianError && e.kind === "rate-limited";
    console.error("sport list failed:", e instanceof Error ? e.message : "unknown");
  }

  return (
    <>
      <TopBar />
      {!data ? (
        <ErrorPanel rateLimited={rateLimited} />
      ) : data.items.length === 0 ? (
        <Panel icon="newspaper" title="No sport news right now" text="Check back later." action="Refresh" to="retry" tonal />
      ) : (
        <main className="body">
          <div className="col">
            <h1 className="ph2">Latest sport</h1>
            <HeadlineList initial={data} />
            <p className="attr">News from The Guardian Open Platform</p>
          </div>
        </main>
      )}
    </>
  );
}
