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
			if (result && "url" in result && typeof result.url === "string") {
				window.location.href = result.url;
				return;
			}
			toast.error("Could not start sign-in", {
				description:
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
