import { cookies } from "next/headers";
import { parseView, VIEW_COOKIE } from "@/lib/view";
import { CardSkeletons } from "./components/Skeletons";
import { TopBar } from "./components/TopBar";

export default async function Loading() {
  const grid = parseView((await cookies()).get(VIEW_COOKIE)?.value) === "grid";
  return (
    <>
      <TopBar />
      <main className="body">
        <div className={grid ? "col grid" : "col"}>
          <h1 className="ph2">Latest sport</h1>
          <CardSkeletons count={grid ? 8 : 6} />
        </div>
      </main>
    </>
  );
}
