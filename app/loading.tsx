import { CardSkeletons } from "./components/Skeletons";
import { TopBar } from "./components/TopBar";

export default function Loading() {
  return (
    <>
      <TopBar />
      <main className="body">
        <div className="col">
          <h1 className="ph2">Latest sport</h1>
          <CardSkeletons />
        </div>
      </main>
    </>
  );
}
