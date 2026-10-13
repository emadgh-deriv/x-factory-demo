import { cookies } from "next/headers";
import { parseView, VIEW_COOKIE } from "@/lib/view";
import { CardSkeletons } from "../components/Skeletons";

/** Search loading: bar outline plus skeletons (the real bar mounts with the page). */
export default async function Loading() {
  const grid = parseView((await cookies()).get(VIEW_COOKIE)?.value) === "grid";
  return (
    <>
      <header className="bar sbar">
        <span className="sbar-sp" />
        <div className="sfield" aria-hidden="true">
          <span className="icon">search</span>
        </div>
        <span className="sbar-sp" />
      </header>
      <main className="body">
        <div className={grid ? "col grid" : "col"}>
          <p className="count" aria-hidden="true">&nbsp;</p>
          <CardSkeletons count={grid ? 8 : 6} />
        </div>
      </main>
    </>
  );
}
