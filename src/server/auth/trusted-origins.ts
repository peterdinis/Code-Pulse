import { env } from "~/env";

/**
 * Origins allowed for OAuth callbackURL / CSRF checks.
 * Pairs localhost ↔ 127.0.0.1 so dev works when BETTER_AUTH_URL uses one host and the browser uses the other.
 */
export function buildTrustedOrigins(): string[] {
	const origins = new Set<string>();

	const add = (value: string | undefined) => {
		const v = value?.trim();
		if (!v) return;
		try {
			origins.add(new URL(v).origin);
		} catch {
			/* ignore invalid URL */
		}
	};

	add(env.BETTER_AUTH_URL);
	add(process.env.NEXT_PUBLIC_APP_URL);

	for (const existing of [...origins]) {
		try {
			const u = new URL(existing);
			if (u.protocol !== "http:") continue;
			if (u.hostname !== "localhost" && u.hostname !== "127.0.0.1") continue;
			const portPart = u.port ? `:${u.port}` : ":3000";
			origins.add(`http://localhost${portPart}`);
			origins.add(`http://127.0.0.1${portPart}`);
		} catch {
			/* ignore */
		}
	}

	const extra = env.BETTER_AUTH_TRUSTED_ORIGINS;
	if (extra) {
		for (const part of extra.split(",")) {
			add(part.trim());
		}
	}

	if (process.env.VERCEL_URL) {
		const v = process.env.VERCEL_URL;
		add(v.startsWith("http") ? v : `https://${v}`);
	}

	return [...origins];
}
