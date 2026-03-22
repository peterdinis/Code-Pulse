import { createAuthClient } from "better-auth/react";

function getBaseURL() {
	if (typeof window !== "undefined") return window.location.origin;
	return process.env.NEXT_PUBLIC_APP_URL ?? "";
}

export const client = createAuthClient({
	baseURL: getBaseURL(),
});

export const { signIn, signOut, signUp, useSession, getSession } = client;
