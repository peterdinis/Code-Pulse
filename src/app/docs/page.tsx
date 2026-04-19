"use client";

import {
	Book,
	GitBranch,
	Key,
	ListOrdered,
	MessageSquare,
	Shield,
	Sparkles,
	Zap,
} from "lucide-react";
import { MarketingHeader } from "~/components/layout/MarketingHeader";

export default function DocsPage() {
	return (
		<div className="relative min-h-screen bg-background font-sans text-foreground antialiased">
			<div
				aria-hidden
				className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_120%_80%_at_50%_-25%,var(--brand-muted),transparent_58%)]"
			/>
			<MarketingHeader backHref="/" backLabel="Back to home" />

			<main className="relative mx-auto max-w-180 px-5 py-16 md:px-10">
				<h1 className="mb-2 font-display font-extrabold text-3xl text-foreground tracking-tight md:text-4xl">
					Documentation
				</h1>
				<p className="mb-12 text-muted-foreground text-sm">
					Get started with CodePulse and ship better code with AI-powered
					reviews.
				</p>

				<nav className="mb-16 grid gap-4 sm:grid-cols-2">
					<DocCard
						desc="Instant analysis, deep insights, GitHub-native workflow, team analytics."
						href="/#features"
						icon={<Zap className="h-5 w-5 text-brand" />}
						title="Features"
					/>
					<DocCard
						desc="Connect repositories, create PR reviews, run AI analysis, and manage limits."
						href="/dashboard"
						icon={<GitBranch className="h-5 w-5 text-brand" />}
						title="Dashboard"
					/>
					<DocCard
						desc="Create an account to sync repositories and start reviewing pull requests."
						href="/signup"
						icon={<Shield className="h-5 w-5 text-brand" />}
						title="Sign up"
					/>
				</nav>

				<section
					className="space-y-6 border-border/80 border-t pt-12"
					id="getting-started"
				>
					<h2 className="flex items-center gap-2 font-bold font-display text-foreground text-xl">
						<Book className="h-5 w-5 text-brand" />
						Getting started
					</h2>
					<ol className="list-inside list-decimal space-y-4 text-[13px] text-muted-foreground leading-relaxed">
						<li>
							<strong className="text-foreground">Sign in with GitHub</strong> —
							Use the button on the{" "}
							<a className="font-medium text-brand hover:underline" href="/">
								home page
							</a>{" "}
							or go to the dashboard after signing in.
						</li>
						<li>
							<strong className="text-foreground">Add a repository</strong> —
							From the dashboard, add a GitHub repo you want to review.
						</li>
						<li>
							<strong className="text-foreground">Create a PR review</strong> —
							Create a new review, paste your diff (e.g. from{" "}
							<code className="rounded bg-muted px-1.5 py-0.5 text-brand">
								git diff
							</code>
							), and save.
						</li>
						<li>
							<strong className="text-foreground">Run AI review</strong> —
							Choose ChatGPT or Gemini in settings, add your API key, then run
							the AI review. You’ll get a notification when it’s done.
						</li>
					</ol>
				</section>

				<section
					className="space-y-6 border-border/80 border-t pt-12"
					id="ai-providers"
				>
					<h2 className="flex items-center gap-2 font-bold font-display text-foreground text-xl">
						<Key className="h-5 w-5 text-brand" />
						AI providers & API keys
					</h2>
					<p className="text-[13px] text-muted-foreground leading-relaxed">
						CodePulse supports two AI backends for code reviews. You choose one
						and add your own API key so you control usage and costs.
					</p>
					<ul className="list-inside list-disc space-y-3 text-[13px] text-muted-foreground">
						<li>
							<strong className="text-foreground">ChatGPT (OpenAI)</strong> —
							Use an OpenAI API key. You can also set{" "}
							<code className="rounded bg-muted px-1 text-brand">
								OPENAI_API_KEY
							</code>{" "}
							in your server environment as a fallback.
						</li>
						<li>
							<strong className="text-foreground">Gemini (Google)</strong> — Use
							a Google AI Studio API key. Get one at{" "}
							<a
								className="font-medium text-brand hover:underline"
								href="https://aistudio.google.com/app/apikey"
								rel="noopener noreferrer"
								target="_blank"
							>
								aistudio.google.com
							</a>
							.
						</li>
					</ul>
					<p className="text-[13px] text-muted-foreground leading-relaxed">
						In the dashboard, open a PR review and use the{" "}
						<strong className="text-foreground">Provider & API keys</strong>{" "}
						section to select the provider and paste your key. Keys are stored
						per account and used only for your AI reviews.
					</p>
				</section>

				<section
					className="space-y-6 border-border/80 border-t pt-12"
					id="limits"
				>
					<h2 className="flex items-center gap-2 font-bold font-display text-foreground text-xl">
						<ListOrdered className="h-5 w-5 text-brand" />
						AI review limit
					</h2>
					<p className="text-[13px] text-muted-foreground leading-relaxed">
						You can set an optional limit (e.g. 5 or 10) for how many AI reviews
						can be completed. Once you hit the limit, the “Run AI review” button
						is disabled until you increase or clear the limit. This helps you
						control usage when using your own API key.
					</p>
				</section>

				<section
					className="space-y-6 border-border/80 border-t pt-12"
					id="running-review"
				>
					<h2 className="flex items-center gap-2 font-bold font-display text-foreground text-xl">
						<Sparkles className="h-5 w-5 text-brand" />
						Running an AI review
					</h2>
					<ol className="list-inside list-decimal space-y-3 text-[13px] text-muted-foreground leading-relaxed">
						<li>
							Open a PR review from the dashboard and paste your diff (or leave
							it empty to use a sample).
						</li>
						<li>
							Configure your AI provider and API key in the same panel if you
							haven’t already.
						</li>
						<li>
							Click <strong className="text-foreground">Run AI review</strong>.
							The status will show “Running…” until the review is ready.
						</li>
						<li>
							When it’s done, you’ll see the result in the{" "}
							<strong className="text-foreground">AI review result</strong>{" "}
							section and get a notification.
						</li>
					</ol>
				</section>

				<section
					className="space-y-4 border-border/80 border-t pt-12"
					id="help"
				>
					<h2 className="flex items-center gap-2 font-bold font-display text-foreground text-xl">
						<MessageSquare className="h-5 w-5 text-brand" />
						Need help?
					</h2>
					<p className="text-[13px] text-muted-foreground leading-relaxed">
						Open an issue on our GitHub repository or contact support. We’re in
						public beta and improving every day.
					</p>
					<a
						className="mt-4 inline-flex items-center gap-2 rounded-xl border border-brand/30 bg-brand/10 px-4 py-2 font-medium text-[13px] text-brand transition-colors hover:bg-brand/15"
						href="/"
					>
						Back to home
					</a>
				</section>
			</main>
		</div>
	);
}

function DocCard({
	href,
	icon,
	title,
	desc,
}: {
	href: string;
	icon: React.ReactNode;
	title: string;
	desc: string;
}) {
	const className =
		"block rounded-2xl border border-border/80 bg-card/80 p-5 backdrop-blur-sm transition-all hover:border-brand/35 hover:bg-card";
	return (
		<a className={className} href={href}>
			<div className="flex items-start gap-4">
				<div className="shrink-0">{icon}</div>
				<div>
					<h3 className="mb-1 font-bold font-display text-foreground">
						{title}
					</h3>
					<p className="text-[12px] text-muted-foreground leading-relaxed">
						{desc}
					</p>
				</div>
			</div>
		</a>
	);
}
