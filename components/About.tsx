import { site } from "@/content/site";
import { Panel } from "./Panel";

export function About() {
  return (
    <Panel id="about" title="About">
      <div className="flex max-w-[70ch] flex-col gap-3">
        {site.about.map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
      </div>
    </Panel>
  );
}
