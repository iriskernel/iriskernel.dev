import Link from "next/link";
import { site } from "@/content/site";
import { Mark } from "./Mark";
import { ThemeToggle } from "./ThemeToggle";

const nav = [
  { href: "/projects", label: "Projects" },
  { href: "/log", label: "Log" },
  { href: "/#contact", label: "Contact" },
];

export function TopBar() {
  return (
    <header className="border-b border-ln">
      <div className="mx-auto flex max-w-[1000px] flex-wrap items-center justify-between gap-x-6 gap-y-2 px-6 py-3">
        <Link href="/" className="flex items-center gap-2 font-medium">
          <Mark />
          <span>{site.handle}</span>
        </Link>
        <nav aria-label="Main" className="flex items-center gap-4 text-sm">
          {nav.map((item) => (
            <Link key={item.href} href={item.href} className="text-mu hover:text-ac2">
              {item.label}
            </Link>
          ))}
          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
}
