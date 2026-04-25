"use client";

import { ArrowLeft, ExternalLink, FileDiff, Sparkles, Trash2 } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { DiffViewer } from "~/components/DiffViewer";
import { LoadingScreen } from "~/components/LoadingScreen";
import { MarkdownReview } from "~/components/MarkdownReview";
import { ThemeToggle } from "~/components/ThemeToggle";
import { useSession } from "~/lib/client";
import { api } from "~/trpc/react";

export default function ReviewWorkspacePage() {
	const router = useRouter();
	const params = useParams<{ id: string }>();
	const reviewId = params?.id ?? "";
	const { data: session, isPending } = useSession();

	if (isPending) return <LoadingScreen label="Loading review workspace..." />;
	if (!session?.user?.id) return <LoadingScreen label="Redirecting..." />;

	return <ReviewWorkspace reviewId={reviewId} userId={session.user.id} />;
}

function ReviewWorkspace({ reviewId, userId }: { reviewId: string; userId: string }) {
	const router = useRouter();
	const { data: review, isLoading } = api.prReview.getById.useQuery(
		{ id: reviewId, userId },
		{ enabled: !!reviewId, throwOnError: true },
	);
	const { data: aiUsage } = api.prReview.getAiReviewUsage.useQuery(
		{ userId },
		{ enabled: !!userId },
	);
	const utils = api.useUtils();

	const [diffText, setDiffText] = useState("");
	const [providerSelect, setProviderSelect] = useState<"openai" | "gemini">("openai");
	const [openaiKeyInput, setOpenaiKeyInput] = useState("");
	const [geminiKeyInput, setGeminiKeyInput] = useState("");
	const [postToGitHub, setPostToGitHub] = useState(false);
	const [autoFetchFromGitHub, setAutoFetchFromGitHub] = useState(true);

	useEffect(() => {
		if (review?.diffText != null) setDiffText(review.diffText ?? "");
	}, [review?.diffText]);

	useEffect(() => {
		if (aiUsage?.provider === "openai" || aiUsage?.provider === "gemini") {
			setProviderSelect(aiUsage.provider);
		}
	}, [aiUsage?.provider]);

	useEffect(() => {
		if (aiUsage?.postAiReviewToGitHub !== undefined) {
			setPostToGitHub(aiUsage.postAiReviewToGitHub);
		}
	}, [aiUsage?.postAiReviewToGitHub]);

	const updateDiff = api.prReview.updateDiff.useMutation({
		onSuccess: () => {
			utils.prReview.getById.invalidate({ id: reviewId, userId });
			toast.success("Diff saved");
		},
		onError: (e) => toast.error(e.message),
	});

	const setAiSettings = api.prReview.setAiReviewSettings.useMutation({
		onSuccess: () => {
			utils.prReview.getAiReviewUsage.invalidate({ userId });
			setOpenaiKeyInput("");
			setGeminiKeyInput("");
			toast.success("AI settings saved");
		},
		onError: (e) => toast.error(e.message),
	});

	const runAi = api.prReview.runAiReview.useMutation({
		onSuccess: (data) => {
			utils.prReview.getById.invalidate({ id: reviewId, userId });
			utils.prReview.list.invalidate();
			utils.prReview.listByRepositoryId.invalidate();
			utils.prReview.getAiReviewUsage.invalidate({ userId });
			utils.notification.list.invalidate();
			utils.notification.unreadCount.invalidate();
			const base = data?.githubSummaryPosted
				? "AI review completed and posted on the GitHub PR."
				: "AI review completed.";
			toast.success(
				data?.githubDiffFetched ? `${base} Latest GitHub diff synced.` : base,
			);
		},
		onError: (e) => toast.error(e.message),
	});

	const remove = api.prReview.remove.useMutation({
		onSuccess: () => {
			utils.prReview.list.invalidate();
			utils.prReview.listByRepositoryId.invalidate();
			toast.success("PR review removed");
			router.push("/dashboard");
		},
		onError: (e) => toast.error(e.message),
	});

	const title = useMemo(() => {
		if (!review) return "Review workspace";
		return `PR #${review.prNumber}${review.prTitle ? ` - ${review.prTitle}` : ""}`;
	}, [review]);

	if (isLoading || !review) return <LoadingScreen label="Loading review workspace..." />;

	return (
		<div className="min-h-screen bg-background text-foreground">
			<header className="flex h-14 items-center justify-between border-border/80 border-b px-5 md:px-8">
				<div className="flex items-center gap-3">
					<Link
						className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
						href="/dashboard"
					>
						<ArrowLeft className="h-4 w-4" />
						Back to dashboard
					</Link>
					<span className="text-muted-foreground">|</span>
					<h1 className="truncate font-semibold text-base">{title}</h1>
				</div>
				<ThemeToggle />
			</header>

			<main className="mx-auto grid w-full max-w-7xl gap-6 p-6 md:grid-cols-2">
				<section className="space-y-4 rounded-xl border border-border bg-card p-4">
					<div className="flex items-center justify-between gap-3">
						<div>
							<p className="font-medium text-sm">Diff & source</p>
							<p className="text-muted-foreground text-xs">
								Paste manually, or let review auto-fetch latest PR diff from GitHub.
							</p>
						</div>
						{review.prUrl && (
							<a
								className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
								href={review.prUrl}
								rel="noopener noreferrer"
								target="_blank"
							>
								<ExternalLink className="h-3.5 w-3.5" />
								Open PR
							</a>
						)}
					</div>

					<div className="flex items-start gap-2 rounded-md border border-border/80 bg-background/50 p-3">
						<input
							checked={autoFetchFromGitHub}
							className="mt-1 h-4 w-4 shrink-0 rounded border-input"
							id="auto-fetch-diff-workspace"
							onChange={(e) => setAutoFetchFromGitHub(e.target.checked)}
							type="checkbox"
						/>
						<label
							className="cursor-pointer text-[12px] text-muted-foreground leading-snug"
							htmlFor="auto-fetch-diff-workspace"
						>
							<span className="font-medium text-foreground">
								Auto-fetch latest PR diff from GitHub
							</span>
							<br />
							When enabled, Run AI review first tries GitHub. If it fails, saved
							diff is used.
						</label>
					</div>

					<textarea
						className="h-56 w-full resize-y rounded-lg border border-input bg-background px-3 py-2 font-mono text-[13px] placeholder:text-muted-foreground"
						onChange={(e) => setDiffText(e.target.value)}
						placeholder="Paste git diff or patch content..."
						spellCheck={false}
						value={diffText}
					/>
					<div className="flex flex-wrap items-center gap-2">
						<button
							className="rounded-md bg-muted px-3 py-2 text-sm hover:bg-muted/80 disabled:opacity-50"
							disabled={updateDiff.isPending || diffText === (review.diffText ?? "")}
							onClick={() => updateDiff.mutate({ id: reviewId, userId, diffText })}
							type="button"
						>
							{updateDiff.isPending ? "Saving..." : "Save diff"}
						</button>
						<button
							className="inline-flex items-center gap-2 rounded-md bg-primary px-3 py-2 font-medium text-primary-foreground text-sm hover:opacity-90 disabled:opacity-50"
							disabled={runAi.isPending}
							onClick={() =>
								runAi.mutate({
									id: reviewId,
									userId,
									refreshFromGitHub: autoFetchFromGitHub,
								})
							}
							type="button"
						>
							<Sparkles className="h-4 w-4" />
							{runAi.isPending ? "Running AI review..." : "Run AI review"}
						</button>
						<button
							className="inline-flex items-center gap-2 rounded-md border border-destructive/30 px-3 py-2 text-destructive text-sm hover:bg-destructive/10"
							disabled={remove.isPending}
							onClick={() => remove.mutate({ id: reviewId, userId })}
							type="button"
						>
							<Trash2 className="h-4 w-4" />
							Delete review
						</button>
					</div>

					{diffText.trim() && (
						<div className="rounded-lg border border-border p-3">
							<div className="mb-2 inline-flex items-center gap-2 text-muted-foreground text-xs">
								<FileDiff className="h-3.5 w-3.5" />
								Diff preview
							</div>
							<DiffViewer className="max-h-72 overflow-y-auto" content={diffText} />
						</div>
					)}
				</section>

				<section className="space-y-4 rounded-xl border border-border bg-card p-4">
					<div>
						<p className="font-medium text-sm">AI options & output</p>
						<p className="text-muted-foreground text-xs">
							Configure provider, keys and GitHub posting. Result appears below.
						</p>
					</div>

					<div className="space-y-2">
						<label className="block text-xs text-muted-foreground" htmlFor="provider">
							AI provider
						</label>
						<select
							className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
							id="provider"
							onChange={(e) =>
								setProviderSelect(e.target.value as "openai" | "gemini")
							}
							value={providerSelect}
						>
							<option value="openai">ChatGPT (OpenAI)</option>
							<option value="gemini">Gemini (Google)</option>
						</select>
					</div>

					<div className="space-y-2">
						<label
							className="block text-xs text-muted-foreground"
							htmlFor="openai-key"
						>
							OpenAI API key
						</label>
						<input
							autoComplete="off"
							className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
							id="openai-key"
							onChange={(e) => setOpenaiKeyInput(e.target.value)}
							placeholder="sk-... (leave empty to keep current)"
							type="password"
							value={openaiKeyInput}
						/>
					</div>

					<div className="space-y-2">
						<label
							className="block text-xs text-muted-foreground"
							htmlFor="gemini-key"
						>
							Gemini API key
						</label>
						<input
							autoComplete="off"
							className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
							id="gemini-key"
							onChange={(e) => setGeminiKeyInput(e.target.value)}
							placeholder="Leave empty to keep current"
							type="password"
							value={geminiKeyInput}
						/>
					</div>

					<div className="flex items-start gap-2 rounded-md border border-border/80 bg-background/50 p-3">
						<input
							checked={postToGitHub}
							className="mt-1 h-4 w-4 shrink-0 rounded border-input"
							id="post-to-github-workspace"
							onChange={(e) => setPostToGitHub(e.target.checked)}
							type="checkbox"
						/>
						<label
							className="cursor-pointer text-[12px] text-muted-foreground leading-snug"
							htmlFor="post-to-github-workspace"
						>
							<span className="font-medium text-foreground">
								Post AI summary to GitHub PR
							</span>
						</label>
					</div>

					<button
						className="rounded-md bg-muted px-3 py-2 text-sm hover:bg-muted/80 disabled:opacity-50"
						disabled={setAiSettings.isPending}
						onClick={() =>
							setAiSettings.mutate({
								userId,
								provider: providerSelect,
								openaiApiKey: openaiKeyInput.trim() || undefined,
								geminiApiKey: geminiKeyInput.trim() || undefined,
								postAiReviewToGitHub: postToGitHub,
							})
						}
						type="button"
					>
						{setAiSettings.isPending ? "Saving..." : "Save AI settings"}
					</button>

					<div className="rounded-lg border border-border p-3">
						<p className="mb-2 font-medium text-sm">AI review output</p>
						{review.aiReview ? (
							<MarkdownReview content={review.aiReview} />
						) : (
							<p className="text-muted-foreground text-sm">
								No AI output yet. Run AI review to generate it.
							</p>
						)}
					</div>
				</section>
			</main>
		</div>
	);
}
