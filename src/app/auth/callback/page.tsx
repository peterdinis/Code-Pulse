"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
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
    <div className="min-h-screen flex items-center justify-center bg-[#0a0c0f]">
      <p className="text-[#6e7681] text-sm">Signing you in…</p>
    </div>
  );
}
