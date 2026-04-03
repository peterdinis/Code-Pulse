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
		<div className="flex min-h-screen items-center justify-center bg-background">
			<p className="text-muted-foreground text-sm">Signing you in…</p>
		</div>
	);
}
