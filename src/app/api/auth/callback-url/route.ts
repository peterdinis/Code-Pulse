import { env } from "~/env";

/**
 * Returns the exact GitHub OAuth callback URL this app uses.
 * Copy this value into your GitHub OAuth App → Authorization callback URL.
 * GET /api/auth/callback-url
 */
export async function GET() {
  const baseURL = env.BETTER_AUTH_URL.replace(/\/$/, "");
  const callbackURL =
    env.GITHUB_CALLBACK_URL?.replace(/\/$/, "") ??
    `${baseURL}/api/auth/callback/github`;

  return Response.json(
    {
      callbackURL,
      message:
        "Copy the callbackURL value above and paste it into GitHub OAuth App → Authorization callback URL. It must match exactly (no trailing slash).",
    },
    { headers: { "Cache-Control": "no-store" } }
  );
}
