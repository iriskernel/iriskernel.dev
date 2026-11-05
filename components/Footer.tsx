import Link from "next/link";
import { site } from "@/content/site";

export function Footer() {
  return (
    <footer className="mt-16 border-t border-ln">
      <div className="mx-auto flex max-w-[1000px] flex-wrap items-center justify-between gap-2 px-6 py-6 text-sm text-mu">
        <p>
          <span aria-hidden="true">$ </span>
          {site.handle} · {new Date().getFullYear()}
        </p>
        <p className="flex gap-4">
          <Link href="/log/rss.xml" className="hover:text-ac2">
            RSS
          </Link>
          <Link href="/terminal" className="inline-flex items-center gap-1.5 hover:text-ac2" title="Open terminal (Ctrl+Alt+T)">
            <span aria-hidden="true">&gt;_ </span>terminal
            <kbd className="hidden rounded border border-ln bg-sf px-1.5 py-0.5 text-[10px] font-mono text-mu sm:inline-block">Ctrl+Alt+T</kbd>
          </Link>
        </p>
      </div>
    </footer>
  );
}
