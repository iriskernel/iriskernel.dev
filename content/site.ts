/*
  All personal text on the site lives in this file.
  Edit it freely; no component needs to change.
*/

export type LinkIcon = "github" | "email" | "link";

export type PinnedProject = {
  name: string;
  description: string;
  language?: string;
  /** Dot color for the language, like GitHub's */
  languageColor?: string;
  /** "owner/name" of a PUBLIC repo; stars and language are then loaded from GitHub */
  repo?: string;
  /** Where the card links to. Leave out for a "coming soon" card. */
  href?: string;
  /** Small muted note under the description, e.g. "Private repo" */
  note?: string;
};

export const site = {
  url: "https://iriskernel.dev",
  handle: "iriskernel",
  /** Shown as the big name in the sidebar. Only the handle for now. */
  name: "iriskernel",
  /** Initials for the avatar circle and the top bar mark */
  initials: "ik",
  /**
   * Avatar: { kind: "initials" } draws the initials in a circle.
   * To use a photo, put it in /public (e.g. /public/avatar.jpg) and use
   * { kind: "image", src: "/avatar.jpg" }.
   */
  avatar: { kind: "initials" } as { kind: "initials" } | { kind: "image"; src: string },

  bio: "I like computers and cars, and how both work under the hood.",
  about: [
    "I'm iriskernel. I like computers and cars, and I'm happiest when I'm figuring out how something works under the hood, whether that's a web app or an engine.",
    "Right now I'm building groupy, a place to listen to music together with friends.",
  ],
  /** The small status line under the links */
  status: "Building groupy",

  /** Sidebar and contact links. Add more here, e.g. { label: "Bluesky", href: "https://…", icon: "link" } */
  links: [{ label: "GitHub", href: "https://github.com/iriskernel", icon: "github" }] as {
    label: string;
    href: string;
    icon: LinkIcon;
  }[],

  /**
   * Email for the contact section, split in two so it isn't in the page as one string.
   * Set to null to hide it. Example: { user: "hello", domain: "example.com" }
   */
  email: null as { user: string; domain: string } | null,

  contact: {
    line: "Want to talk about a project, groupy, or cars? GitHub is the best place to find me for now.",
  },

  currentlyBuilding: {
    name: "groupy",
    pitch: "Listening rooms for friends",
    pill: "Early test build",
    href: "https://groupy.iriskernel.dev",
    note: "Private repo",
    /** Case study slug in content/projects; the link only appears once that page is marked ready */
    caseStudy: "groupy",
  },

  /**
   * Pinned project cards. If useGitHubPinned is true and the GitHub token is set,
   * the pinned repos from your GitHub profile are shown instead.
   */
  useGitHubPinned: false,
  pinned: [
    {
      name: "groupy",
      description: "Listening rooms for friends.",
      language: "TypeScript",
      languageColor: "#3178c6",
      href: "https://groupy.iriskernel.dev",
      note: "Private repo",
    },
    {
      name: "Coming soon",
      description: "Something new is in the garage.",
    },
  ] as PinnedProject[],

  /** Tech stack strip. icon is a Simple Icons slug (https://simpleicons.org). */
  techStack: [
    { name: "Next.js", icon: "nextdotjs" },
    { name: "TypeScript", icon: "typescript" },
    { name: "Tailwind", icon: "tailwindcss" },
    { name: "Prisma", icon: "prisma" },
    { name: "Supabase", icon: "supabase" },
    { name: "Vercel", icon: "vercel" },
  ],
};
