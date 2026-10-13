import { NextResponse } from "next/server";
import { fetchSportPage, GuardianError } from "@/lib/guardian";

/** "Load more" proxy so the API key stays on the server. */
export async function GET(req: Request) {
  const page = Number(new URL(req.url).searchParams.get("page") ?? "1");
  if (!Number.isInteger(page) || page < 1 || page > 1000) {
    return NextResponse.json({ error: "bad-page" }, { status: 400 });
  }
  try {
    return NextResponse.json(await fetchSportPage(page));
  } catch (e) {
    const status = e instanceof GuardianError && e.kind === "rate-limited" ? 429 : 502;
    return NextResponse.json({ error: status === 429 ? "rate-limited" : "unavailable" }, { status });
  }
}
