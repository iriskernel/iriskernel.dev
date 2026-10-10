"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import type { NowPlaying as Track } from "@/lib/spotify";
import { BrandIconSpotify } from "./SpotifyIcon";
import { Panel } from "./Panel";

const REFRESH_MS = 60_000;

function timeAgo(iso: string) {
  const s = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 1000));
  if (s < 60) return "just now";
  const m = Math.round(s / 60);
  if (m < 60) return `${m} min ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h} h ago`;
  const d = Math.round(h / 24);
  return `${d} day${d === 1 ? "" : "s"} ago`;
}

export function NowPlaying() {
  const [track, setTrack] = useState<Track | null | undefined>(undefined);

  useEffect(() => {
    let alive = true;
    async function load() {
      try {
        const res = await fetch("/api/now-playing");
        const json = (await res.json()) as { enabled: boolean; track?: Track | null };
        if (alive) setTrack(json.track ?? null);
      } catch {
        if (alive) setTrack(null);
      }
    }
    load();
    // Refresh every minute, but only while the tab is visible
    const timer = setInterval(() => {
      if (document.visibilityState === "visible") load();
    }, REFRESH_MS);
    const onVisible = () => {
      if (document.visibilityState === "visible") load();
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      alive = false;
      clearInterval(timer);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, []);

  return (
    <Panel id="now-playing" title="Now playing">
      {/* Fixed height, so the page doesn't jump when the song loads */}
      <div className="flex h-12 items-center gap-3">
        {track === undefined ? (
          <p className="text-sm text-mu">Loading…</p>
        ) : track === null ? (
          <p className="text-sm text-mu">Not listening right now.</p>
        ) : (
          <>
            {track.albumArt ? (
              <Image src={track.albumArt} alt="" width={48} height={48} unoptimized className="size-12 shrink-0 rounded-md" />
            ) : (
              <div aria-hidden="true" className="size-12 shrink-0 rounded-md bg-sf" />
            )}
            <div className="min-w-0 flex-1">
              <p className="flex items-center gap-1.5 text-xs text-mu">
                <BrandIconSpotify />
                {track.isPlaying ? (
                  <span className="text-ac">Now playing</span>
                ) : (
                  <span>Last played{track.playedAt ? ` · ${timeAgo(track.playedAt)}` : ""}</span>
                )}
              </p>
              <a href={track.songUrl} className="block truncate text-sm font-medium text-ac2 hover:underline">
                {track.song}
              </a>
              <p className="truncate text-sm text-mu">{track.artist}</p>
            </div>
          </>
        )}
      </div>
    </Panel>
  );
}
