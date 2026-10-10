import type { RepoCard } from "@/lib/types";
import { Panel } from "./Panel";

function StarIcon() {
  return (
    <svg viewBox="0 0 16 16" width="14" height="14" fill="currentColor" aria-hidden="true" focusable="false">
      <path d="M8 .8l2.2 4.6 5 .7-3.6 3.5.9 5L8 12.2 3.5 14.6l.9-5L.8 6.1l5-.7z" />
    </svg>
  );
}

function Card({ repo }: { repo: RepoCard }) {
  const soon = !repo.href;
  return (
    <li className={`flex flex-col gap-2 rounded-xl border p-4 ${soon ? "border-dashed border-ln text-mu" : "border-ln"}`}>
      {soon ? (
        <p className="font-medium">{repo.name}</p>
      ) : (
        <a href={repo.href} className="font-medium text-ac2 hover:underline">
          {repo.name}
        </a>
      )}
      <p className="flex-1 text-sm">{repo.description}</p>
      {(repo.language || repo.stars !== undefined || repo.note) && (
        <p className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-mu">
          {repo.language && (
            <span className="inline-flex items-center gap-1.5">
              <span aria-hidden="true" className="size-2.5 rounded-full" style={{ background: repo.languageColor ?? "var(--ac2)" }} />
              {repo.language}
            </span>
          )}
          {repo.stars !== undefined && (
            <span className="inline-flex items-center gap-1">
              <StarIcon />
              {repo.stars}
              <span className="sr-only">stars</span>
            </span>
          )}
          {repo.note && <span>{repo.note}</span>}
        </p>
      )}
    </li>
  );
}

export function PinnedProjects({ repos }: { repos: RepoCard[] }) {
  return (
    <Panel id="pinned" title="Pinned">
      <ul className="grid gap-4 sm:grid-cols-2">
        {repos.map((repo) => (
          <Card key={repo.name} repo={repo} />
        ))}
      </ul>
    </Panel>
  );
}
