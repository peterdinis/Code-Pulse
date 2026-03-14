"use client";

import {
	ArrowLeft,
	Book,
	GitBranch,
	Key,
	ListOrdered,
	MessageSquare,
	Shield,
	Sparkles,
	Zap,
} from "lucide-react";

export default function DocsPage() {
	return (
		<div className="min-h-screen bg-[#0a0c0f] font-mono text-[#c9d1d9] antialiased">
			<header className="sticky top-0 z-50 flex h-14 items-center justify-between border-[#1e2733] border-b bg-[#0a0c0f]/95 px-5 backdrop-blur-xl md:px-10">
				<a
					className="inline-flex items-center gap-2 text-[#6e7681] text-[13px] transition-colors hover:text-[#00e5a0]"
					href="/"
				>
					<ArrowLeft className="h-4 w-4" />
					Back to home
				</a>
				<a
					className="flex items-center gap-2 font-extrabold font-sans text-[1.1rem] text-white tracking-tight"
					href="/"
				>
					<span className="h-2 w-2 animate-pulse rounded-full bg-[#00e5a0]" />
					CodePulse
				</a>
			</header>

			<main className="mx-auto max-w-[720px] px-5 py-16 md:px-10">
				<h1 className="mb-2 font-extrabold font-sans text-3xl text-white tracking-tight md:text-4xl">
					Documentation
				</h1>
				<p className="mb-12 text-[#6e7681] text-sm">
					Get started with CodePulse and ship better code with AI-powered
					reviews.
				</p>

				{/* Quick links */}
				<nav className="mb-16 grid gap-4 sm:grid-cols-2">
					<DocCard
						desc="Instant analysis, deep insights, GitHub-native workflow, team analytics."
						href="/#features"
						icon={<Zap className="h-5 w-5 text-[#00e5a0]" />}
						title="Features"
					/>
					<DocCard
						desc="Connect repositories, create PR reviews, run AI analysis, and manage limits."
						href="/dashboard"
						icon={<GitBranch className="h-5 w-5 text-[#00e5a0]" />}
						title="Dashboard"
					/>
					<DocCard
						desc="Free for open-source. Set your own AI review limit; bring your API key."
						href="/#pricing"
						icon={<Shield className="h-5 w-5 text-[#00e5a0]" />}
						title="Pricing"
					/>
				</nav>

				{/* Getting started */}
				<section
					className="space-y-6 border-[#1e2733] border-t pt-12"
					id="getting-started"
				>
					<h2 className="flex items-center gap-2 font-bold font-sans text-white text-xl">
						<Book className="h-5 w-5 text-[#00e5a0]" />
						Getting started
					</h2>
					<ol className="list-inside list-decimal space-y-4 text-[#6e7681] text-[13px] leading-relaxed">
						<li>
							<strong className="text-[#c9d1d9]">Sign in with GitHub</strong> —
							Use the button on the{" "}
							<a className="text-[#00e5a0] hover:underline" href="/">
								home page
							</a>{" "}
							or go to the dashboard after signing in.
						</li>
						<li>
							<strong className="text-[#c9d1d9]">Add a repository</strong> —
							From the dashboard, add a GitHub repo you want to review.
						</li>
						<li>
							<strong className="text-[#c9d1d9]">Create a PR review</strong> —
							Create a new review, paste your diff (e.g. from{" "}
							<code className="rounded bg-[#1e2733] px-1.5 py-0.5 text-[#00e5a0]">
								git diff
							</code>
							), and save.
						</li>
						<li>
							<strong className="text-[#c9d1d9]">Run AI review</strong> — Choose
							ChatGPT or Gemini in settings, add your API key, then run the AI
							review. You’ll get a notification when it’s done.
						</li>
					</ol>
				</section>

				{/* AI providers & API keys */}
				<section
					className="space-y-6 border-[#1e2733] border-t pt-12"
					id="ai-providers"
				>
					<h2 className="flex items-center gap-2 font-bold font-sans text-white text-xl">
						<Key className="h-5 w-5 text-[#00e5a0]" />
						AI providers & API keys
					</h2>
					<p className="text-[#6e7681] text-[13px] leading-relaxed">
						CodePulse supports two AI backends for code reviews. You choose one
						and add your own API key so you control usage and costs.
					</p>
					<ul className="list-inside list-disc space-y-3 text-[#6e7681] text-[13px]">
						<li>
							<strong className="text-[#c9d1d9]">ChatGPT (OpenAI)</strong> — Use
							an OpenAI API key. You can also set{" "}
							<code className="rounded bg-[#1e2733] px-1 text-[#00e5a0]">
								OPENAI_API_KEY
							</code>{" "}
							in your server environment as a fallback.
						</li>
						<li>
							<strong className="text-[#c9d1d9]">Gemini (Google)</strong> — Use
							a Google AI Studio API key. Get one at{" "}
							<a
								className="text-[#00e5a0] hover:underline"
								href="https://aistudio.google.com/app/apikey"
								rel="noopener noreferrer"
								target="_blank"
							>
								aistudio.google.com
							</a>
							.
						</li>
					</ul>
					<p className="text-[#6e7681] text-[13px] leading-relaxed">
						In the dashboard, open a PR review and use the{" "}
						<strong className="text-[#c9d1d9]">Provider & API keys</strong>{" "}
						section to select the provider and paste your key. Keys are stored
						per account and used only for your AI reviews.
					</p>
				</section>

				{/* AI review limit */}
				<section
					className="space-y-6 border-[#1e2733] border-t pt-12"
					id="limits"
				>
					<h2 className="flex items-center gap-2 font-bold font-sans text-white text-xl">
						<ListOrdered className="h-5 w-5 text-[#00e5a0]" />
						AI review limit
					</h2>
					<p className="text-[#6e7681] text-[13px] leading-relaxed">
						You can set an optional limit (e.g. 5 or 10) for how many AI reviews
						can be completed. Once you hit the limit, the “Run AI review” button
						is disabled until you increase or clear the limit. This helps you
						control usage when using your own API key.
					</p>
				</section>

				{/* Running a review */}
				<section
					className="space-y-6 border-[#1e2733] border-t pt-12"
					id="running-review"
				>
					<h2 className="flex items-center gap-2 font-bold font-sans text-white text-xl">
						<Sparkles className="h-5 w-5 text-[#00e5a0]" />
						Running an AI review
					</h2>
					<ol className="list-inside list-decimal space-y-3 text-[#6e7681] text-[13px] leading-relaxed">
						<li>
							Open a PR review from the dashboard and paste your diff (or leave
							it empty to use a sample).
						</li>
						<li>
							Configure your AI provider and API key in the same panel if you
							haven’t already.
						</li>
						<li>
							Click <strong className="text-[#c9d1d9]">Run AI review</strong>.
							The status will show “Running…” until the review is ready.
						</li>
						<li>
							When it’s done, you’ll see the result in the{" "}
							<strong className="text-[#c9d1d9]">AI review result</strong>{" "}
							section and get a notification.
						</li>
					</ol>
				</section>

				{/* Need help */}
				<section
					className="space-y-4 border-[#1e2733] border-t pt-12"
					id="help"
				>
					<h2 className="flex items-center gap-2 font-bold font-sans text-white text-xl">
						<MessageSquare className="h-5 w-5 text-[#00e5a0]" />
						Need help?
					</h2>
					<p className="text-[#6e7681] text-[13px] leading-relaxed">
						Open an issue on our GitHub repository or contact support. We’re in
						public beta and improving every day.
					</p>
					<a
						className="mt-4 inline-flex items-center gap-2 rounded-lg border border-[#00e5a0]/30 bg-[#00e5a0]/10 px-4 py-2 font-medium text-[#00e5a0] text-[13px] transition-colors hover:bg-[#00e5a0]/20"
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
		"block p-5 rounded-lg border border-[#1e2733] bg-[#0f1218] hover:border-[#00e5a0]/40 hover:bg-[#0f1218]/80 transition-all";
	return (
		<a className={className} href={href}>
			<div className="flex items-start gap-4">
				<div className="shrink-0">{icon}</div>
				<div>
					<h3 className="mb-1 font-bold font-sans text-white">{title}</h3>
					<p className="text-[#6e7681] text-[12px] leading-relaxed">{desc}</p>
				</div>
			</div>
		</a>
	);
}
