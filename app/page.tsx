import { Contributions } from "@/components/Contributions";
import { CurrentlyBuilding } from "@/components/CurrentlyBuilding";
import { PinnedProjects } from "@/components/PinnedProjects";
import { Sidebar } from "@/components/Sidebar";
import { TechStack } from "@/components/TechStack";
import { site } from "@/content/site";

export default function Home() {
  return (
    <div className="grid gap-8 md:grid-cols-[260px_minmax(0,1fr)]">
      <Sidebar />
      <div className="flex min-w-0 flex-col gap-8">
        <CurrentlyBuilding caseStudyReady={false} />
        <PinnedProjects repos={site.pinned} />
        <Contributions calendar={null} />
        <TechStack />
      </div>
    </div>
  );
}
