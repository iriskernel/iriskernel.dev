/*
  Spotify "now playing", server side only. The refresh token, client ID and
  secret never leave the server; the browser only gets the fields in NowPlaying.

  Env: SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET, SPOTIFY_REFRESH_TOKEN,
  and NOW_PLAYING_ENABLED ("false" turns the card off).
*/

export type NowPlaying = {
  song: string;
  artist: string;
  albumArt: string | null;
  songUrl: string;
  isPlaying: boolean;
  /** ISO time for "last played"; null while playing */
  playedAt: string | null;
};

export function nowPlayingEnabled() {
  return (
    process.env.NOW_PLAYING_ENABLED !== "false" &&
    !!process.env.SPOTIFY_CLIENT_ID &&
    !!process.env.SPOTIFY_CLIENT_SECRET &&
    !!process.env.SPOTIFY_REFRESH_TOKEN
  );
}

// Access tokens last an hour; keep one in memory while the server instance lives
let cached: { token: string; expiresAt: number } | null = null;

async function accessToken(): Promise<string | null> {
  if (cached && cached.expiresAt > Date.now() + 60_000) return cached.token;
  const basic = Buffer.from(`${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`).toString("base64");
  const res = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: { Authorization: `Basic ${basic}`, "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ grant_type: "refresh_token", refresh_token: process.env.SPOTIFY_REFRESH_TOKEN ?? "" }),
    cache: "no-store",
    signal: AbortSignal.timeout(5000),
  });
  if (!res.ok) {
    console.warn(`Spotify token request failed (${res.status})`);
    return null;
  }
  const json = (await res.json()) as { access_token: string; expires_in: number };
  cached = { token: json.access_token, expiresAt: Date.now() + json.expires_in * 1000 };
  return json.access_token;
}

type Track = {
  name: string;
  artists: { name: string }[];
  album: { images: { url: string; width: number | null }[] };
  external_urls: { spotify: string };
};

function pick(track: Track, isPlaying: boolean, playedAt: string | null): NowPlaying {
  // Smallest image that is still at least 48px wide (Spotify lists them largest first)
  const images = track.album.images;
  const art = [...images].reverse().find((i) => (i.width ?? 0) >= 48) ?? images[0];
  return {
    song: track.name,
    artist: track.artists.map((a) => a.name).join(", "),
    albumArt: art?.url ?? null,
    songUrl: track.external_urls.spotify,
    isPlaying,
    playedAt,
  };
}

export async function getNowPlaying(): Promise<NowPlaying | null> {
  if (!nowPlayingEnabled()) return null;
  try {
    const token = await accessToken();
    if (!token) return null;
    const headers = { Authorization: `Bearer ${token}` };

    const current = await fetch("https://api.spotify.com/v1/me/player/currently-playing", {
      headers,
      cache: "no-store",
      signal: AbortSignal.timeout(5000),
    });
    if (current.status === 200) {
      const json = (await current.json()) as { is_playing: boolean; currently_playing_type: string; item: Track | null };
      if (json.is_playing && json.currently_playing_type === "track" && json.item) return pick(json.item, true, null);
    }

    const recent = await fetch("https://api.spotify.com/v1/me/player/recently-played?limit=1", {
      headers,
      cache: "no-store",
      signal: AbortSignal.timeout(5000),
    });
    if (!recent.ok) return null;
    const json = (await recent.json()) as { items: { track: Track; played_at: string }[] };
    const last = json.items[0];
    return last ? pick(last.track, false, last.played_at) : null;
  } catch {
    console.warn("Spotify unreachable");
    return null;
  }
}
