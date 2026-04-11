import { env } from "~/env";

/**
 * GitHub OAuth callback URLs to register (Authorization callback URL in the GitHub app).
 * Without GITHUB_CALLBACK_URL, Better Auth uses the request host, so local dev may need both
 * localhost and 127.0.0.1 if you switch between them.
 * GET /api/auth/callback-url
 */
export async function GET() {
	const base = env.BETTER_AUTH_URL.replace(/\/$/, "");
	const suffix = "/api/auth/callback/github";

	if (env.GITHUB_CALLBACK_URL?.trim()) {
		const callbackURL = env.GITHUB_CALLBACK_URL.replace(/\/$/, "");
		return Response.json(
			{
				callbackURL,
				message:
					"GITHUB_CALLBACK_URL is set — register exactly this URL in your GitHub OAuth app (no trailing slash).",
			},
			{ headers: { "Cache-Control": "no-store" } },
		);
	}

	const primary = `${base}${suffix}`;
	const urls = new Set<string>([primary]);

	if (env.NODE_ENV === "development") {
		try {
			const u = new URL(base);
			const port = u.port || "3000";
			if (u.hostname === "localhost") {
				urls.add(`http://127.0.0.1:${port}${suffix}`);
			}
			if (u.hostname === "127.0.0.1") {
				urls.add(`http://localhost:${port}${suffix}`);
			}
		} catch {
			/* ignore */
		}
	}

	return Response.json(
		{
			callbackURLs: [...urls],
			message:
				"Register every callbackURLs entry in GitHub → OAuth App → Authorization callback URL (GitHub allows multiple). Without GITHUB_CALLBACK_URL, redirect_uri matches the host you use in the browser.",
		},
		{ headers: { "Cache-Control": "no-store" } },
	);
}
