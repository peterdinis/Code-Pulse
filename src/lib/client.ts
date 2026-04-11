import { createAuthClient } from "better-auth/react";

/**
 * Must match the origin you use in the browser (`window.location.origin` on the client).
 * For SSR, set NEXT_PUBLIC_BETTER_AUTH_URL or NEXT_PUBLIC_APP_URL (same as BETTER_AUTH_URL).
 */
function getBaseURL() {
	if (typeof window !== "undefined") {
		return window.location.origin;
	}
	return (
		process.env.NEXT_PUBLIC_BETTER_AUTH_URL ??
		process.env.NEXT_PUBLIC_APP_URL ??
		""
	);
}

export const client = createAuthClient({
	baseURL: getBaseURL(),
});

export const { signIn, signOut, signUp, useSession, getSession } = client;
