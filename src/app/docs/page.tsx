"use client";

import {
  ArrowLeft,
  Book,
  Zap,
  Shield,
  GitBranch,
  Key,
  Sparkles,
  ListOrdered,
  MessageSquare,
} from "lucide-react";

export default function DocsPage() {
  return (
    <div className="min-h-screen bg-[#0a0c0f] text-[#c9d1d9] font-mono antialiased">
      <header className="sticky top-0 z-50 border-b border-[#1e2733] bg-[#0a0c0f]/95 backdrop-blur-xl px-5 md:px-10 h-14 flex items-center justify-between">
        <a
          href="/"
          className="inline-flex items-center gap-2 text-[#6e7681] hover:text-[#00e5a0] transition-colors text-[13px]"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to home
        </a>
        <a
          href="/"
          className="font-sans font-extrabold text-[1.1rem] text-white flex items-center gap-2 tracking-tight"
        >
          <span className="w-2 h-2 rounded-full bg-[#00e5a0] animate-pulse" />
          CodePulse
        </a>
      </header>

      <main className="max-w-[720px] mx-auto px-5 md:px-10 py-16">
        <h1 className="font-sans text-3xl md:text-4xl font-extrabold text-white mb-2 tracking-tight">
          Documentation
        </h1>
        <p className="text-[#6e7681] text-sm mb-12">
          Get started with CodePulse and ship better code with AI-powered reviews.
        </p>

        {/* Quick links */}
        <nav className="grid gap-4 mb-16 sm:grid-cols-2">
          <DocCard
            href="/#features"
            icon={<Zap className="w-5 h-5 text-[#00e5a0]" />}
            title="Features"
            desc="Instant analysis, deep insights, GitHub-native workflow, team analytics."
          />
          <DocCard
            href="/dashboard"
            icon={<GitBranch className="w-5 h-5 text-[#00e5a0]" />}
            title="Dashboard"
            desc="Connect repositories, create PR reviews, run AI analysis, and manage limits."
          />
          <DocCard
            href="/#pricing"
            icon={<Shield className="w-5 h-5 text-[#00e5a0]" />}
            title="Pricing"
            desc="Free for open-source. Set your own AI review limit; bring your API key."
          />
        </nav>

        {/* Getting started */}
        <section className="space-y-6 border-t border-[#1e2733] pt-12" id="getting-started">
          <h2 className="font-sans text-xl font-bold text-white flex items-center gap-2">
            <Book className="w-5 h-5 text-[#00e5a0]" />
            Getting started
          </h2>
          <ol className="list-decimal list-inside space-y-4 text-[13px] text-[#6e7681] leading-relaxed">
            <li>
              <strong className="text-[#c9d1d9]">Sign in with GitHub</strong> — Use the button on the{" "}
              <a href="/" className="text-[#00e5a0] hover:underline">
                home page
              </a>{" "}
              or go to the dashboard after signing in.
            </li>
            <li>
              <strong className="text-[#c9d1d9]">Add a repository</strong> — From the dashboard, add a GitHub repo you want to review.
            </li>
            <li>
              <strong className="text-[#c9d1d9]">Create a PR review</strong> — Create a new review, paste your diff (e.g. from{" "}
              <code className="bg-[#1e2733] px-1.5 py-0.5 rounded text-[#00e5a0]">git diff</code>), and save.
            </li>
            <li>
              <strong className="text-[#c9d1d9]">Run AI review</strong> — Choose ChatGPT or Gemini in settings, add your API key, then run the AI review. You’ll get a notification when it’s done.
            </li>
          </ol>
        </section>

        {/* AI providers & API keys */}
        <section className="space-y-6 border-t border-[#1e2733] pt-12" id="ai-providers">
          <h2 className="font-sans text-xl font-bold text-white flex items-center gap-2">
            <Key className="w-5 h-5 text-[#00e5a0]" />
            AI providers & API keys
          </h2>
          <p className="text-[13px] text-[#6e7681] leading-relaxed">
            CodePulse supports two AI backends for code reviews. You choose one and add your own API key so you control usage and costs.
          </p>
          <ul className="space-y-3 text-[13px] text-[#6e7681] list-disc list-inside">
            <li>
              <strong className="text-[#c9d1d9]">ChatGPT (OpenAI)</strong> — Use an OpenAI API key. You can also set{" "}
              <code className="bg-[#1e2733] px-1 rounded text-[#00e5a0]">OPENAI_API_KEY</code> in your server environment as a fallback.
            </li>
            <li>
              <strong className="text-[#c9d1d9]">Gemini (Google)</strong> — Use a Google AI Studio API key. Get one at{" "}
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#00e5a0] hover:underline"
              >
                aistudio.google.com
              </a>
              .
            </li>
          </ul>
          <p className="text-[13px] text-[#6e7681] leading-relaxed">
            In the dashboard, open a PR review and use the <strong className="text-[#c9d1d9]">Provider & API keys</strong> section to select the provider and paste your key. Keys are stored per account and used only for your AI reviews.
          </p>
        </section>

        {/* AI review limit */}
        <section className="space-y-6 border-t border-[#1e2733] pt-12" id="limits">
          <h2 className="font-sans text-xl font-bold text-white flex items-center gap-2">
            <ListOrdered className="w-5 h-5 text-[#00e5a0]" />
            AI review limit
          </h2>
          <p className="text-[13px] text-[#6e7681] leading-relaxed">
            You can set an optional limit (e.g. 5 or 10) for how many AI reviews can be completed. Once you hit the limit, the “Run AI review” button is disabled until you increase or clear the limit. This helps you control usage when using your own API key.
          </p>
        </section>

        {/* Running a review */}
        <section className="space-y-6 border-t border-[#1e2733] pt-12" id="running-review">
          <h2 className="font-sans text-xl font-bold text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#00e5a0]" />
            Running an AI review
          </h2>
          <ol className="list-decimal list-inside space-y-3 text-[13px] text-[#6e7681] leading-relaxed">
            <li>Open a PR review from the dashboard and paste your diff (or leave it empty to use a sample).</li>
            <li>Configure your AI provider and API key in the same panel if you haven’t already.</li>
            <li>Click <strong className="text-[#c9d1d9]">Run AI review</strong>. The status will show “Running…” until the review is ready.</li>
            <li>When it’s done, you’ll see the result in the <strong className="text-[#c9d1d9]">AI review result</strong> section and get a notification.</li>
          </ol>
        </section>

        {/* Need help */}
        <section className="space-y-4 border-t border-[#1e2733] pt-12" id="help">
          <h2 className="font-sans text-xl font-bold text-white flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-[#00e5a0]" />
            Need help?
          </h2>
          <p className="text-[13px] text-[#6e7681] leading-relaxed">
            Open an issue on our GitHub repository or contact support. We’re in public beta and improving every day.
          </p>
          <a
            href="/"
            className="inline-flex items-center gap-2 mt-4 px-4 py-2 rounded-lg bg-[#00e5a0]/10 border border-[#00e5a0]/30 text-[#00e5a0] text-[13px] font-medium hover:bg-[#00e5a0]/20 transition-colors"
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
    <a href={href} className={className}>
      <div className="flex items-start gap-4">
        <div className="shrink-0">{icon}</div>
        <div>
          <h3 className="font-sans font-bold text-white mb-1">{title}</h3>
          <p className="text-[12px] text-[#6e7681] leading-relaxed">{desc}</p>
        </div>
      </div>
    </a>
  );
}
