import { getNowPlaying, nowPlayingEnabled } from "@/lib/spotify";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!nowPlayingEnabled()) {
    return Response.json({ enabled: false }, { headers: { "Cache-Control": "public, s-maxage=300" } });
  }
  const track = await getNowPlaying();
  // Vercel's CDN keeps the answer for 30 seconds, so Spotify is asked at most twice a minute
  return Response.json(
    { enabled: true, track },
    { headers: { "Cache-Control": "public, s-maxage=30, stale-while-revalidate=30" } }
  );
}
