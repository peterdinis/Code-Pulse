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
		<div className="flex min-h-screen flex-col items-center justify-center bg-[#0a0c0f] px-5 font-mono text-[#c9d1d9]">
			<h1 className="mb-2 font-bold font-sans text-white text-xl">
				Something went wrong
			</h1>
			<p className="mb-4 max-w-md text-center text-[#6e7681] text-[13px]">
				{error.message || "An error occurred loading the docs."}
			</p>
			<div className="flex gap-3">
				<button
					className="rounded-lg border border-[#00e5a0]/40 bg-[#00e5a0]/20 px-4 py-2 font-medium text-[#00e5a0] text-[13px] hover:bg-[#00e5a0]/30"
					onClick={reset}
					type="button"
				>
					Try again
				</button>
				<Link
					className="rounded-lg border border-[#1e2733] px-4 py-2 text-[#6e7681] text-[13px] hover:border-[#00e5a0]/40 hover:text-[#00e5a0]"
					href="/"
				>
					Back to home
				</Link>
			</div>
		</div>
	);
}
