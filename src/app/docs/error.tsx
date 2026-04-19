"use client";

import Link from "next/link";

export default function DocsError({
	error,
	reset,
}: {
	error: Error & { digest?: string };
	reset: () => void;
}) {
	return (
		<div className="flex min-h-screen flex-col items-center justify-center bg-background px-5 font-sans text-foreground">
			<h1 className="mb-2 font-bold font-display text-foreground text-xl">
				Something went wrong
			</h1>
			<p className="mb-4 max-w-md text-center text-[13px] text-muted-foreground">
				{error.message || "An error occurred loading the docs."}
			</p>
			<div className="flex gap-3">
				<button
					className="rounded-xl border border-brand/40 bg-brand/15 px-4 py-2 font-medium text-[13px] text-brand hover:bg-brand/25"
					onClick={reset}
					type="button"
				>
					Try again
				</button>
				<Link
					className="rounded-xl border border-border px-4 py-2 text-[13px] text-muted-foreground hover:border-brand/40 hover:text-brand"
					href="/"
				>
					Back to home
				</Link>
			</div>
		</div>
	);
}
