"use client";

import { useEffect, useState } from "react";

/**
 * Renders children only after mount to avoid hydration mismatch when
 * content depends on client-only state (theme, session, etc.).
 */
export function ClientOnly({
  children,
  fallback = null,
}: {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return <>{fallback}</>;
  return <>{children}</>;
}
