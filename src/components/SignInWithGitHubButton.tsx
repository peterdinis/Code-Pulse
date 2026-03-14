"use client";

import { useState } from "react";
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
			} else {
				setIsLoading(false);
			}
		} catch {
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
