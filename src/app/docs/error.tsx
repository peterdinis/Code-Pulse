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
    <div className="min-h-screen bg-[#0a0c0f] text-[#c9d1d9] font-mono flex flex-col items-center justify-center px-5">
      <h1 className="font-sans text-xl font-bold text-white mb-2">Something went wrong</h1>
      <p className="text-[13px] text-[#6e7681] mb-4 text-center max-w-md">
        {error.message || "An error occurred loading the docs."}
      </p>
      <div className="flex gap-3">
        <button
          type="button"
          onClick={reset}
          className="px-4 py-2 rounded-lg bg-[#00e5a0]/20 border border-[#00e5a0]/40 text-[#00e5a0] text-[13px] font-medium hover:bg-[#00e5a0]/30"
        >
          Try again
        </button>
        <Link
          href="/"
          className="px-4 py-2 rounded-lg border border-[#1e2733] text-[#6e7681] text-[13px] hover:text-[#00e5a0] hover:border-[#00e5a0]/40"
        >
          Back to home
        </Link>
      </div>
    </div>
  );
}
