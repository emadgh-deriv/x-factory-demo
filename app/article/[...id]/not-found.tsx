import { Panel } from "@/app/components/Panel";
import { TopBar } from "@/app/components/TopBar";

/** 7 · Article not found. */
export default function NotFound() {
  return (
    <>
      <TopBar back />
      <Panel
        icon="search_off"
        title="Article not found"
        text="It may have been moved or removed."
        action="Back to latest sport"
        to="/"
      />
    </>
  );
}
