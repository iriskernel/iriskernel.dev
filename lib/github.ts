import { site, type PinnedProject } from "@/content/site";
import type { ContributionCalendar, RepoCard } from "./types";

/*
  GitHub data for the home page, loaded on the server only.
  Needs GITHUB_USERNAME and GITHUB_TOKEN (a fine-grained token with public, read-only access).
  Without them, or if GitHub fails, everything falls back to content/site.ts.
*/

const REVALIDATE_SECONDS = 3600;

type GqlRepo = {
  name: string;
  description: string | null;
  url: string;
  stargazerCount: number;
  isPrivate: boolean;
  primaryLanguage: { name: string; color: string | null } | null;
} | null;

const repoFields = "name description url stargazerCount isPrivate primaryLanguage { name color }";
const levels = { NONE: 0, FIRST_QUARTILE: 1, SECOND_QUARTILE: 2, THIRD_QUARTILE: 3, FOURTH_QUARTILE: 4 } as const;

async function query<T>(gql: string, variables: Record<string, unknown>): Promise<T | null> {
  const token = process.env.GITHUB_TOKEN;
  if (!token) return null;
  try {
    const res = await fetch("https://api.github.com/graphql", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ query: gql, variables }),
      next: { revalidate: REVALIDATE_SECONDS },
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) {
      console.warn(`GitHub API returned ${res.status}; using the content file instead`);
      return null;
    }
    const json = (await res.json()) as { data?: T; errors?: unknown };
    if (json.errors || !json.data) {
      console.warn("GitHub API returned errors; using the content file instead");
      return null;
    }
    return json.data;
  } catch {
    console.warn("GitHub API unreachable; using the content file instead");
    return null;
  }
}

function toCard(repo: NonNullable<GqlRepo>, fallback?: PinnedProject): RepoCard {
  return {
    name: fallback?.name ?? repo.name,
    description: fallback?.description ?? repo.description ?? "",
    language: repo.primaryLanguage?.name ?? fallback?.language,
    languageColor: repo.primaryLanguage?.color ?? fallback?.languageColor,
    stars: repo.stargazerCount,
    href: fallback?.href ?? repo.url,
    note: fallback?.note,
  };
}

export async function getGitHubData(): Promise<{ pinned: RepoCard[]; calendar: ContributionCalendar | null }> {
  const login = process.env.GITHUB_USERNAME || site.handle;
  const withRepo = site.pinned.filter((p) => p.repo);

  // One request: the calendar, profile pins, and any public repos named in the content file
  const aliases = withRepo
    .map((p, i) => {
      const [owner, name] = p.repo!.split("/");
      return `r${i}: repository(owner: ${JSON.stringify(owner)}, name: ${JSON.stringify(name)}) { ${repoFields} }`;
    })
    .join("\n");
  const gql = `query($login: String!) {
    user(login: $login) {
      pinnedItems(first: 6, types: REPOSITORY) { nodes { ... on Repository { ${repoFields} } } }
      contributionsCollection {
        contributionCalendar {
          totalContributions
          weeks { contributionDays { date contributionCount contributionLevel } }
        }
      }
    }
    ${aliases}
  }`;

  type Data = {
    user: {
      pinnedItems: { nodes: GqlRepo[] };
      contributionsCollection: {
        contributionCalendar: {
          totalContributions: number;
          weeks: { contributionDays: { date: string; contributionCount: number; contributionLevel: keyof typeof levels }[] }[];
        };
      };
    } | null;
  } & Record<string, GqlRepo>;

  const data = await query<Data>(gql, { login });
  if (!data?.user) return { pinned: site.pinned, calendar: null };

  const cal = data.user.contributionsCollection.contributionCalendar;
  const calendar: ContributionCalendar = {
    total: cal.totalContributions,
    weeks: cal.weeks.map((w) =>
      w.contributionDays.map((d) => ({ date: d.date, count: d.contributionCount, level: levels[d.contributionLevel] ?? 0 }))
    ),
  };

  const profilePins = data.user.pinnedItems.nodes.filter((r): r is NonNullable<GqlRepo> => !!r && !r.isPrivate);
  let pinned: RepoCard[];
  if (site.useGitHubPinned && profilePins.length > 0) {
    pinned = profilePins.map((r) => toCard(r));
  } else {
    pinned = site.pinned.map((p) => {
      const i = withRepo.indexOf(p);
      const repo = i >= 0 ? data[`r${i}`] : null;
      return repo && !repo.isPrivate ? toCard(repo, p) : p;
    });
  }

  return { pinned, calendar };
}
