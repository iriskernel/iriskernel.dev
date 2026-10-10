export type ContributionDay = { date: string; count: number; level: 0 | 1 | 2 | 3 | 4 };
export type ContributionCalendar = { total: number; weeks: ContributionDay[][] };

export type RepoCard = {
  name: string;
  description: string;
  language?: string;
  languageColor?: string;
  stars?: number;
  href?: string;
  note?: string;
};
