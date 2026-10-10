import { About } from "@/components/About";
import { Contact } from "@/components/Contact";
import { Contributions } from "@/components/Contributions";
import { CurrentlyBuilding } from "@/components/CurrentlyBuilding";
import { NowPlaying } from "@/components/NowPlaying";
import { PinnedProjects } from "@/components/PinnedProjects";
import { Sidebar } from "@/components/Sidebar";
import { TechStack } from "@/components/TechStack";
import { site } from "@/content/site";
import { getPublished } from "@/lib/content";
import { getGitHubData } from "@/lib/github";
import { nowPlayingEnabled } from "@/lib/spotify";

// The page is static and rebuilt in the background at most once an hour
export const revalidate = 3600;

export default async function Home() {
  const [{ pinned, calendar }, studies] = await Promise.all([getGitHubData(), getPublished("projects")]);
  const caseStudyReady = studies.some((s) => s.slug === site.currentlyBuilding.caseStudy);
  return (
    <div className="flex flex-col gap-8">
      <div className="grid gap-8 md:grid-cols-[260px_minmax(0,1fr)]">
        <Sidebar />
        <div className="flex min-w-0 flex-col gap-8">
          <CurrentlyBuilding caseStudyReady={caseStudyReady} />
          <PinnedProjects repos={pinned} />
          <Contributions calendar={calendar} />
          {nowPlayingEnabled() && <NowPlaying />}
          <TechStack />
        </div>
      </div>
      <About />
      <Contact />
    </div>
  );
}
