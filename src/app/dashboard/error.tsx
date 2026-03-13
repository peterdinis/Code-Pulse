"use client";

import { useEffect } from "react";
import Link from "next/link";
import { LayoutDashboard } from "lucide-react";

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
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="max-w-md w-full rounded-xl border border-border bg-card p-8 text-center">
        <div className="w-12 h-12 rounded-lg bg-destructive/10 flex items-center justify-center mx-auto mb-4">
          <LayoutDashboard className="w-6 h-6 text-destructive" />
        </div>
        <h1 className="text-lg font-semibold text-foreground mb-2">
          Dashboard error
        </h1>
        <p className="text-sm text-muted-foreground mb-6">
          {error.message || "Failed to load dashboard. This can happen when a query fails or the session is invalid."}
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => reset()}
            className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90"
          >
            Try again
          </button>
          <Link
            href="/"
            className="px-4 py-2 rounded-lg border border-border text-foreground text-sm font-medium hover:bg-accent"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}
