import type { Metadata } from "next";
import { MarketingHeader } from "~/components/layout/MarketingHeader";
import { SignUpContent } from "./_components/SignUpContent";

export const metadata: Metadata = {
	title: "Sign up",
	description:
		"Create your CodePulse account with GitHub. Connect repositories and run AI-powered pull request reviews.",
	openGraph: {
		title: "Sign up — CodePulse",
		description:
			"Create your CodePulse account with GitHub and start AI code reviews.",
	},
};

export default function SignUpPage() {
	return (
		<div className="relative flex min-h-screen flex-col bg-background font-sans text-foreground antialiased">
			<div
				aria-hidden
				className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_120%_80%_at_50%_-25%,var(--brand-muted),transparent_58%)]"
			/>
			<MarketingHeader backHref="/" backLabel="Back to home" />

			<main className="relative flex flex-1 items-center justify-center px-5 py-16">
				<SignUpContent />
			</main>
		</div>
	);
}
