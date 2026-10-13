import { cookies } from "next/headers";
import { GuardianError, searchSport, type SportPage } from "@/lib/guardian";
import { countText, parseQuery } from "@/lib/search";
import { parseView, VIEW_COOKIE } from "@/lib/view";
import { HeadlineList } from "../components/HeadlineList";
import { ErrorPanel, Panel } from "../components/Panel";
import { SearchScreen } from "../components/SearchBar";
import { ViewModeProvider } from "../components/ViewMode";

export const dynamic = "force-dynamic";

type Props = { searchParams: Promise<{ q?: string | string[] }> };

/** Search 2 · empty, 3 · results, 4 · no results, plus error. */
export default async function Search({ searchParams }: Props) {
  const view = parseView((await cookies()).get(VIEW_COOKIE)?.value);
  const q = parseQuery((await searchParams).q);

  // Empty query: screen 2, no API call.
  if (!q) {
    return (
      <ViewModeProvider initial={view}>
        <SearchScreen key="" q="" />
      </ViewModeProvider>
    );
  }

  let data: SportPage | null = null;
  let rateLimited = false;
  try {
    data = await searchSport(q, 1);
  } catch (e) {
    rateLimited = e instanceof GuardianError && e.kind === "rate-limited";
    console.error("search failed:", e instanceof Error ? e.message : "unknown");
  }

  return (
    <ViewModeProvider initial={view}>
      <SearchScreen key={q} q={q}>
        {!data ? (
          <ErrorPanel rateLimited={rateLimited} title="Can't search sport news" />
        ) : data.items.length === 0 ? (
          <Panel
            icon="search_off"
            title={`No results for “${q}”`}
            text="Check the spelling or try a broader word, like a sport or a team."
            action="Clear search"
            to="/search"
            tonal
          />
        ) : (
          <>
            <p className="count" aria-live="polite">{countText(data.total ?? data.items.length, q)}</p>
            <HeadlineList key={q} initial={data} q={q} />
            <p className="attr">News from The Guardian Open Platform</p>
          </>
        )}
      </SearchScreen>
    </ViewModeProvider>
  );
}
