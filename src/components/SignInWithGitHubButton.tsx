"use client";

import { useState } from "react";
import { toast } from "sonner";
import { signIn } from "~/lib/client";

/** Default redirect path after GitHub sign-in. Override with NEXT_PUBLIC_AUTH_CALLBACK_URL. */
const DEFAULT_CALLBACK_PATH = "/auth/callback";

function getDefaultCallbackURL(): string {
	if (typeof window !== "undefined") {
		const fromEnv = process.env.NEXT_PUBLIC_AUTH_CALLBACK_URL;
		if (fromEnv)
			return fromEnv.startsWith("/")
				? `${window.location.origin}${fromEnv}`
				: fromEnv;
		return `${window.location.origin}${DEFAULT_CALLBACK_PATH}`;
	}
	const fromEnv = process.env.NEXT_PUBLIC_AUTH_CALLBACK_URL;
	const base = process.env.NEXT_PUBLIC_APP_URL ?? "";
	return fromEnv
		? fromEnv.startsWith("/")
			? `${base}${fromEnv}`
			: fromEnv
		: DEFAULT_CALLBACK_PATH;
}

type SignInWithGitHubButtonProps = {
	/** URL or path to redirect to after successful sign-in. Defaults to NEXT_PUBLIC_AUTH_CALLBACK_URL or "/". */
	callbackURL?: string;
	className?: string;
	children: React.ReactNode;
};

/**
 * better-auth uses @better-fetch/fetch, which returns `{ data: <json body>, error }`.
 * OAuth redirect URL lives at `data.url`, not top-level `url`.
 */
function getOAuthRedirectUrl(result: unknown): string | undefined {
	if (!result || typeof result !== "object") return;
	const r = result as Record<string, unknown>;
	const data = r.data;
	if (data && typeof data === "object" && data !== null) {
		const u = (data as Record<string, unknown>).url;
		if (typeof u === "string" && u.length > 0) return u;
	}
	if (typeof r.url === "string" && r.url.length > 0) return r.url;
	return;
}

function getFetchErrorMessage(result: unknown): string | undefined {
	if (!result || typeof result !== "object") return;
	const err = (result as Record<string, unknown>).error;
	if (!err || typeof err !== "object") return;
	const msg = (err as Record<string, unknown>).message;
	return typeof msg === "string" ? msg : undefined;
}

/**
 * Button that starts GitHub OAuth sign-in via better-auth.
 * User is created/updated in the database and session is set on success.
 */
export function SignInWithGitHubButton({
	callbackURL,
	className,
	children,
}: SignInWithGitHubButtonProps) {
	const [isLoading, setIsLoading] = useState(false);
	const resolvedCallbackURL = callbackURL ?? getDefaultCallbackURL();

	const handleSignIn = async () => {
		if (isLoading) return;
		setIsLoading(true);
		try {
			const result = await signIn.social({
				provider: "github",
				callbackURL: resolvedCallbackURL,
			});
			const redirectUrl = getOAuthRedirectUrl(result);
			if (redirectUrl) {
				window.location.href = redirectUrl;
				return;
			}
			const apiMessage = getFetchErrorMessage(result);
			toast.error("Could not start sign-in", {
				description:
					apiMessage ??
					"The server did not return a GitHub redirect. Check BETTER_AUTH_URL and the network tab.",
			});
			setIsLoading(false);
		} catch (e) {
			console.error("[SignInWithGitHubButton]", e);
			toast.error("GitHub sign-in failed", {
				description:
					e instanceof Error
						? e.message
						: "Verify GitHub OAuth app settings and env vars. Open GET /api/auth/callback-url for the exact callback URL.",
			});
			setIsLoading(false);
		}
	};

	return (
		<button
			aria-busy={isLoading}
			className={className}
			disabled={isLoading}
			onClick={handleSignIn}
			type="button"
		>
			{isLoading ? "Redirecting…" : children}
		</button>
	);
}
