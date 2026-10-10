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
          <Link href="/terminal" className="hover:text-ac2">
            <span aria-hidden="true">&gt;_ </span>terminal
          </Link>
        </p>
      </div>
    </footer>
  );
}
