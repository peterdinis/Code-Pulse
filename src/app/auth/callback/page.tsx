"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useSession } from "~/lib/client";

/**
 * Landing page after successful OAuth sign-in.
 * Redirects to home once session is available.
 */
export default function AuthCallbackPage() {
	const router = useRouter();
	const { isPending } = useSession();

	useEffect(() => {
		if (isPending) return;
		router.replace("/");
	}, [isPending, router]);

	return (
		<div className="relative flex min-h-screen flex-col items-center justify-center bg-background px-6">
			<div
				aria-hidden
				className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_100%_80%_at_50%_20%,var(--brand-muted),transparent_55%)]"
			/>
			<div className="relative flex flex-col items-center gap-4 rounded-2xl border border-border/80 bg-card/60 px-10 py-12 text-center backdrop-blur-sm">
				<div className="h-10 w-10 animate-loading-pulse rounded-full bg-brand/90 shadow-brand/25 shadow-lg" />
				<p className="font-medium text-foreground text-sm">Signing you in…</p>
				<p className="max-w-xs text-muted-foreground text-xs">
					You’ll be redirected to the home page in a moment.
				</p>
			</div>
		</div>
	);
}
