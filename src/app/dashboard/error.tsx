"use client";

import { LayoutDashboard } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";

export default function DashboardError({
	error,
	reset,
}: {
	error: Error & { digest?: string };
	reset: () => void;
}) {
	useEffect(() => {
		console.error("Dashboard error:", error);
	}, [error]);

	return (
		<div className="flex min-h-screen items-center justify-center bg-background p-6">
			<div className="w-full max-w-md rounded-xl border border-border bg-card p-8 text-center">
				<div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-destructive/10">
					<LayoutDashboard className="h-6 w-6 text-destructive" />
				</div>
				<h1 className="mb-2 font-semibold text-foreground text-lg">
					Dashboard error
				</h1>
				<p className="mb-6 text-muted-foreground text-sm">
					{error.message ||
						"Failed to load dashboard. This can happen when a query fails or the session is invalid."}
				</p>
				<div className="flex flex-wrap items-center justify-center gap-3">
					<button
						className="rounded-lg bg-primary px-4 py-2 font-medium text-primary-foreground text-sm hover:opacity-90"
						onClick={() => reset()}
						type="button"
					>
						Try again
					</button>
					<Link
						className="rounded-lg border border-border px-4 py-2 font-medium text-foreground text-sm hover:bg-accent"
						href="/"
					>
						Go home
					</Link>
				</div>
			</div>
		</div>
	);
}
