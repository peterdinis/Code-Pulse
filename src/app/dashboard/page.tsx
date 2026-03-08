"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useSession, signOut } from "~/lib/client";
import { LayoutDashboard, LogOut, ArrowLeft } from "lucide-react";

export default function DashboardPage() {
  const router = useRouter();
  const { data: session, isPending } = useSession();

  useEffect(() => {
    if (!isPending && !session?.user) {
      router.replace("/");
    }
  }, [session, isPending, router]);

  if (isPending) {
    return (
      <div className="min-h-screen bg-[#0a0c0f] flex items-center justify-center">
        <p className="text-[#6e7681] text-sm">Loading…</p>
      </div>
    );
  }

  if (!session?.user) {
    return null;
  }

  const user = session.user;

  return (
    <div className="min-h-screen bg-[#0a0c0f] text-[#c9d1d9] font-mono antialiased">
      <header className="border-b border-[#1e2733] px-5 md:px-10 h-14 flex items-center justify-between backdrop-blur-xl bg-[#0a0c0f]/90">
        <Link
          href="/"
          className="flex items-center gap-2 text-[13px] text-[#6e7681] hover:text-[#00e5a0] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to home
        </Link>
        <div className="flex items-center gap-4">
          <span className="text-[13px] text-[#6e7681] hidden sm:inline">
            {user.email}
          </span>
          <button
            type="button"
            onClick={() => signOut()}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-md text-[13px] text-[#6e7681] hover:text-[#ff7b7b] hover:bg-[#ff7b7b]/10 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sign out
          </button>
        </div>
      </header>

      <main className="max-w-[900px] mx-auto px-5 md:px-10 py-12 md:py-16">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-lg bg-[#151b24] border border-[#1e2733] flex items-center justify-center">
            <LayoutDashboard className="w-5 h-5 text-[#00e5a0]" />
          </div>
          <div>
            <h1 className="font-sans font-bold text-xl text-white tracking-tight">
              Dashboard
            </h1>
            <p className="text-[13px] text-[#6e7681]">
              Welcome back, {user.name ?? user.email}
            </p>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <section className="p-6 rounded-xl border border-[#1e2733] bg-[#0f1218]">
            <h2 className="text-[11px] text-[#00e5a0] uppercase tracking-widest mb-3">
              Profile
            </h2>
            <div className="flex items-center gap-4">
              {user.image && (
                <img
                  src={user.image}
                  alt=""
                  className="w-12 h-12 rounded-full border border-[#1e2733]"
                />
              )}
              <div>
                <p className="text-[14px] font-medium text-white">
                  {user.name ?? "—"}
                </p>
                <p className="text-[13px] text-[#6e7681]">{user.email}</p>
              </div>
            </div>
          </section>

          <section className="p-6 rounded-xl border border-[#1e2733] bg-[#0f1218]">
            <h2 className="text-[11px] text-[#00e5a0] uppercase tracking-widest mb-3">
              Quick actions
            </h2>
            <ul className="space-y-2 text-[13px]">
              <li>
                <Link
                  href="/"
                  className="text-[#00e5a0] hover:underline"
                >
                  ← Back to homepage
                </Link>
              </li>
            </ul>
          </section>
        </div>
      </main>
    </div>
  );
}
