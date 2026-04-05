import { env } from "~/env";

/**
 * Better Auth base URL.
 * In development, allow both localhost and 127.0.0.1 (same port) so `baseURL` matches the
 * request Host and GitHub `redirect_uri` matches the address bar.
 * Production: single canonical `BETTER_AUTH_URL`.
 */
export function getAuthBaseURLConfig():
	| string
	| { allowedHosts: string[]; fallback: string } {
	const fallback = env.BETTER_AUTH_URL.replace(/\/$/, "");
	if (env.NODE_ENV !== "development") {
		return fallback;
	}

	try {
		const u = new URL(fallback);
		const hostname = u.hostname;
		const isLoopback =
			hostname === "localhost" ||
			hostname === "127.0.0.1" ||
			hostname === "[::1]";
		if (!isLoopback) {
			return fallback;
		}

		const port =
			u.port ||
			(u.protocol === "https:" ? "443" : "3000");
		const primary = u.port ? u.host : `${hostname}:${port}`;
		const hosts = new Set<string>([primary]);

		if (hostname === "localhost") {
			hosts.add(`127.0.0.1:${port}`);
		} else if (hostname === "127.0.0.1") {
			hosts.add(`localhost:${port}`);
		} else if (hostname === "[::1]") {
			hosts.add(`localhost:${port}`);
			hosts.add(`127.0.0.1:${port}`);
		}

		return { allowedHosts: [...hosts], fallback };
	} catch {
		return fallback;
	}
}
