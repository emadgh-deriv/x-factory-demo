import { ArticleSkeleton } from "@/app/components/Skeletons";
import { TopBar } from "@/app/components/TopBar";

export default function Loading() {
  return (
    <>
      <TopBar back />
      <main className="body">
        <ArticleSkeleton />
      </main>
    </>
  );
}
