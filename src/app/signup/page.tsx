import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { SignUpContent } from "./_components/SignUpContent";

export const metadata: Metadata = {
  title: "Sign up — CodePulse",
  description: "Create your CodePulse account with GitHub. Free for open-source.",
};

export default function SignUpPage() {
  return (
    <div className="min-h-screen bg-[#0a0c0f] text-[#c9d1d9] font-mono antialiased flex flex-col">
      <header className="sticky top-0 z-50 border-b border-[#1e2733] bg-[#0a0c0f]/95 backdrop-blur-xl px-5 md:px-10 h-14 flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-[#6e7681] hover:text-[#00e5a0] transition-colors text-[13px]"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </Link>
        <Link
          href="/"
          className="font-sans font-extrabold text-[1.1rem] text-white flex items-center gap-2 tracking-tight"
        >
          <span className="w-2 h-2 rounded-full bg-[#00e5a0] animate-pulse" />
          CodePulse
        </Link>
      </header>

      <main className="flex-1 flex items-center justify-center px-5 py-16">
        <SignUpContent />
      </main>
    </div>
  );
}
