/*
  One-time helper: gets a Spotify refresh token for the "now playing" card.
  Runs only on your computer (npm run spotify:token). It is not part of the website.

  1. Put SPOTIFY_CLIENT_ID and SPOTIFY_CLIENT_SECRET in .env.local (never committed).
  2. In the Spotify app settings, add the redirect URI http://127.0.0.1:8888/callback
  3. Run: npm run spotify:token, open the link it prints, and approve.
  4. Copy the refresh token it prints into Vercel as SPOTIFY_REFRESH_TOKEN.
*/
import { randomBytes } from "node:crypto";
import { createServer } from "node:http";

const HOST = "127.0.0.1";
const PORT = 8888;
const REDIRECT_URI = `http://${HOST}:${PORT}/callback`;
const SCOPES = "user-read-currently-playing user-read-recently-played";

try {
  process.loadEnvFile(".env.local");
} catch {
  // No .env.local: the variables may already be set in the shell
}

const clientId = process.env.SPOTIFY_CLIENT_ID;
const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
if (!clientId || !clientSecret) {
  console.error("Missing SPOTIFY_CLIENT_ID or SPOTIFY_CLIENT_SECRET. Add them to .env.local and run again.");
  process.exit(1);
}

// Random value that must come back unchanged, so nobody else can finish the login for you
const state = randomBytes(16).toString("hex");

const authorizeUrl =
  "https://accounts.spotify.com/authorize?" +
  new URLSearchParams({ client_id: clientId, response_type: "code", redirect_uri: REDIRECT_URI, scope: SCOPES, state });

const server = createServer(async (req, res) => {
  const url = new URL(req.url ?? "/", REDIRECT_URI);
  if (url.pathname !== "/callback") {
    res.writeHead(404).end();
    return;
  }

  const finish = (status: number, message: string) => {
    res.writeHead(status, { "Content-Type": "text/plain; charset=utf-8" }).end(message);
    server.close();
  };

  if (url.searchParams.get("state") !== state) return finish(400, "State did not match. Run the script again.");
  const code = url.searchParams.get("code");
  if (!code) return finish(400, `Spotify said: ${url.searchParams.get("error") ?? "no code"}. Run the script again.`);

  const tokenRes = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({ grant_type: "authorization_code", code, redirect_uri: REDIRECT_URI }),
  });
  if (!tokenRes.ok) return finish(500, `Token exchange failed (${tokenRes.status}). Check the client ID, secret and redirect URI.`);

  const json = (await tokenRes.json()) as { refresh_token?: string };
  if (!json.refresh_token) return finish(500, "Spotify did not return a refresh token.");

  console.log("\nYour refresh token (shown once; copy it into Vercel as SPOTIFY_REFRESH_TOKEN):\n");
  console.log(json.refresh_token);
  console.log("\nDo not paste it into chat or commit it.\n");
  finish(200, "Done. Go back to your terminal; you can close this tab.");
});

server.listen(PORT, HOST, () => {
  console.log("Open this link in your browser and approve access:\n");
  console.log(authorizeUrl + "\n");
});
