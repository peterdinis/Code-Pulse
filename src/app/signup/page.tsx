import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { SignUpContent } from "./_components/SignUpContent";

export const metadata: Metadata = {
	title: "Sign up — CodePulse",
	description:
		"Create your CodePulse account with GitHub. Free for open-source.",
};

export default function SignUpPage() {
	return (
		<div className="flex min-h-screen flex-col bg-background font-mono text-foreground antialiased">
			<header className="sticky top-0 z-50 flex h-14 items-center justify-between border-border border-b bg-background/95 px-5 backdrop-blur-xl md:px-10">
				<Link
					className="inline-flex items-center gap-2 text-[13px] text-muted-foreground transition-colors hover:text-[#00e5a0]"
					href="/"
				>
					<ArrowLeft className="h-4 w-4" />
					Back
				</Link>
				<Link
					className="flex items-center gap-2 font-extrabold font-sans text-[1.1rem] text-foreground tracking-tight"
					href="/"
				>
					<span className="h-2 w-2 animate-pulse rounded-full bg-[#00e5a0]" />
					CodePulse
				</Link>
			</header>

			<main className="flex flex-1 items-center justify-center px-5 py-16">
				<SignUpContent />
			</main>
		</div>
	);
}
