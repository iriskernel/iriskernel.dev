import { site } from "@/content/site";
import { BrandIcon } from "./Icons";
import { Panel } from "./Panel";

export function TechStack() {
  return (
    <Panel id="stack" title="Tech stack">
      <ul className="flex flex-wrap gap-2 text-sm">
        {site.techStack.map((tech) => (
          <li key={tech.name} className="inline-flex items-center gap-2 rounded-md border border-ln bg-sf px-2.5 py-1">
            <BrandIcon slug={tech.icon} size={14} />
            {tech.name}
          </li>
        ))}
      </ul>
    </Panel>
  );
}
