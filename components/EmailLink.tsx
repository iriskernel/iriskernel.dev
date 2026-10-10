"use client";

import { useSyncExternalStore } from "react";

const noop = () => () => {};

/** The address is put together in the browser, so it isn't in the page HTML for simple scrapers */
export function EmailLink({ user, domain }: { user: string; domain: string }) {
  // false while rendering on the server, true in the browser
  const inBrowser = useSyncExternalStore(noop, () => true, () => false);

  if (!inBrowser) return <span className="text-mu">Email (needs JavaScript)</span>;
  const address = `${user}@${domain}`;
  return (
    <a href={`mailto:${address}`} className="text-ac2 hover:underline">
      {address}
    </a>
  );
}
