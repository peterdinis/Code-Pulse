"use client";

import {
	ArrowLeft,
	ExternalLink,
	FileCheck,
	FileDiff,
	Filter,
	FolderGit2,
	GitPullRequest,
	LayoutDashboard,
	LogOut,
	PlusCircle,
	Search,
	Sparkles,
	Trash2,
	X,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ClientOnly } from "~/components/ClientOnly";
import { DiffViewer } from "~/components/DiffViewer";
import { LoadingScreen } from "~/components/LoadingScreen";
import { MarkdownReview } from "~/components/MarkdownReview";
import { NotificationBell } from "~/components/NotificationBell";
import { PaginationBar } from "~/components/PaginationBar";
import { ThemeToggle } from "~/components/ThemeToggle";
import { signOut, useSession } from "~/lib/client";
import { api } from "~/trpc/react";

type DashboardSection =
	| "repositories"
	| "reviews"
	| "include-repo"
	| "new-review";

function RedirectToHome() {
	const router = useRouter();
	useEffect(() => {
		router.replace("/");
	}, [router]);
	return <LoadingScreen label="Redirecting…" />;
}

export default function DashboardPage() {
	const { data: session, isPending } = useSession();
	const [section, setSection] = useState<DashboardSection>("repositories");

	return (
		<ClientOnly fallback={<LoadingScreen label="Loading dashboard…" />}>
			{isPending ? (
				<LoadingScreen label="Loading dashboard…" />
			) : !session?.user ? (
				<RedirectToHome />
			) : (
				<DashboardContent
					section={section}
					session={session}
					setSection={setSection}
					userId={session.user.id}
				/>
			)}
		</ClientOnly>
	);
}

function DashboardContent({
	userId,
	section,
	setSection,
	session,
}: {
	userId: string;
	section: DashboardSection;
	setSection: (s: DashboardSection) => void;
	session: { user: { email?: string | null } };
}) {
	const router = useRouter();
	const openReviewPage = (id: string) => router.push(`/dashboard/review/${id}`);

	return (
		<div className="flex min-h-screen bg-background font-sans text-foreground antialiased">
			{/* Sidebar */}
			<aside className="flex w-65 shrink-0 flex-col border-border/80 border-r bg-sidebar/95 backdrop-blur-sm">
				<div className="flex items-center justify-between gap-2 border-border/80 border-b p-4">
					<Link
						className="flex items-center gap-2 text-[13px] text-muted-foreground transition-colors hover:text-brand"
						href="/"
					>
						<ArrowLeft className="h-4 w-4 shrink-0" />
						Home
					</Link>
					<ThemeToggle />
				</div>
				<nav className="flex-1 p-2">
					<p className="px-3 py-2 font-medium text-[10px] text-muted-foreground uppercase tracking-widest">
						Dashboard
					</p>
					<button
						className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] transition-colors ${
							section === "repositories"
								? "bg-brand/12 font-medium text-brand"
								: "text-foreground hover:bg-accent"
						}`}
						onClick={() => setSection("repositories")}
						type="button"
					>
						<FolderGit2 className="h-4 w-4 shrink-0" />
						All repositories
					</button>
					<button
						className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] transition-colors ${
							section === "reviews"
								? "bg-brand/12 font-medium text-brand"
								: "text-foreground hover:bg-accent"
						}`}
						onClick={() => setSection("reviews")}
						type="button"
					>
						<GitPullRequest className="h-4 w-4 shrink-0" />
						All PR reviews
					</button>
					<button
						className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] transition-colors ${
							section === "include-repo"
								? "bg-brand/12 font-medium text-brand"
								: "text-foreground hover:bg-accent"
						}`}
						onClick={() => setSection("include-repo")}
						type="button"
					>
						<PlusCircle className="h-4 w-4 shrink-0" />
						Add repository
					</button>
					<button
						className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] transition-colors ${
							section === "new-review"
								? "bg-brand/12 font-medium text-brand"
								: "text-foreground hover:bg-accent"
						}`}
						onClick={() => setSection("new-review")}
						type="button"
					>
						<FileCheck className="h-4 w-4 shrink-0" />
						New PR review
					</button>
				</nav>
				<div className="border-border border-t p-2">
					<span className="block truncate px-3 py-2 text-[12px] text-muted-foreground">
						{session.user.email}
					</span>
					<button
						className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
						onClick={() => signOut()}
						type="button"
					>
						<LogOut className="h-4 w-4 shrink-0" />
						Sign out
					</button>
				</div>
			</aside>

			{/* Main content */}
			<div className="flex min-w-0 flex-1 flex-col">
				<header className="z-20 flex h-14 items-center justify-between border-border/80 border-b bg-background/90 px-5 backdrop-blur-xl md:px-10">
					<div className="flex items-center gap-3">
						<div className="flex h-9 w-9 items-center justify-center rounded-xl border border-border/80 bg-muted/80">
							<LayoutDashboard className="h-4 w-4 text-brand" />
						</div>
						<h1 className="font-display font-semibold text-foreground text-lg tracking-tight">
							{section === "repositories" && "Repositories"}
							{section === "reviews" && "PR reviews"}
							{section === "include-repo" && "Add repository"}
							{section === "new-review" && "New PR review"}
						</h1>
					</div>
					<NotificationBell userId={userId} />
				</header>

				<main className="relative flex-1 overflow-auto p-6 md:p-10">
					{section === "repositories" && (
						<RepositoriesSection
							onSelectReview={openReviewPage}
							userId={userId}
						/>
					)}
					{section === "reviews" && (
						<ReviewsSection
							onSelectReview={openReviewPage}
							userId={userId}
						/>
					)}
					{section === "include-repo" && (
						<IncludeRepositorySection
							onDone={() => setSection("repositories")}
							userId={userId}
						/>
					)}
					{section === "new-review" && (
						<NewReviewSection
							onCreated={(id) => openReviewPage(id)}
							userId={userId}
						/>
					)}
				</main>
			</div>
		</div>
	);
}

const REPO_PAGE_SIZES = [6, 12, 24, 48];

function RepositoriesSection({
	userId,
	onSelectReview,
}: {
	userId: string;
	onSelectReview: (id: string) => void;
}) {
	const [search, setSearch] = useState("");
	const [page, setPage] = useState(1);
	const [pageSize, setPageSize] = useState(8);

	const { data, isLoading } = api.repository.list.useQuery(
		{
			userId,
			search: search.trim() || undefined,
			page,
			pageSize,
		},
		{
			staleTime: 2 * 60 * 1000,
			gcTime: 5 * 60 * 1000,
			throwOnError: true,
		},
	);

	const utils = api.useUtils();
	const remove = api.repository.remove.useMutation({
		onSuccess: () => {
			utils.repository.list.invalidate();
			toast.success("Repository removed");
		},
		onError: (err) => toast.error(err.message ?? "Failed to remove repository"),
	});
	const removeReview = api.prReview.remove.useMutation({
		onSuccess: () => {
			utils.prReview.list.invalidate();
			utils.prReview.listByRepositoryId.invalidate();
			toast.success("PR review removed");
		},
		onError: (err) => toast.error(err.message ?? "Failed to remove PR review"),
	});

	const repos = data?.items ?? [];
	const total = data?.total ?? 0;
	const totalPages = data?.totalPages ?? 1;

	useEffect(() => {
		setPage(1);
	}, []);

	if (isLoading && !data) {
		return (
			<p className="text-muted-foreground text-sm">Loading repositories…</p>
		);
	}

	return (
		<div className="space-y-4">
			{/* Filter bar */}
			<div className="rounded-xl border border-border bg-card p-4">
				<div className="flex flex-wrap items-center gap-3">
					<div className="flex min-w-0 flex-1 items-center gap-2">
						<Filter className="h-4 w-4 shrink-0 text-muted-foreground" />
						<label className="sr-only" htmlFor="repo-search">
							Search repositories
						</label>
						<div className="relative max-w-sm flex-1">
							<Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
							<input
								className="w-full rounded-lg border border-input bg-background py-2 pr-4 pl-9 text-[14px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
								id="repo-search"
								onChange={(e) => setSearch(e.target.value)}
								placeholder="Filter by name (e.g. owner/repo)"
								type="search"
								value={search}
							/>
							{search && (
								<button
									aria-label="Clear search"
									className="absolute top-1/2 right-2 -translate-y-1/2 rounded p-1 text-muted-foreground hover:bg-accent hover:text-foreground"
									onClick={() => setSearch("")}
									type="button"
								>
									<X className="h-4 w-4" />
								</button>
							)}
						</div>
					</div>
					{(search || total > pageSize) && (
						<span className="text-[12px] text-muted-foreground">
							{total} {total === 1 ? "repository" : "repositories"}
						</span>
					)}
				</div>
			</div>

			{!repos.length ? (
				<div className="rounded-xl border border-border bg-card p-10 text-center">
					<FolderGit2 className="mx-auto mb-4 h-14 w-14 text-muted-foreground/60" />
					<p className="mb-1 font-medium text-muted-foreground">
						{search.trim()
							? "No repositories match your filter"
							: "No repositories yet"}
					</p>
					<p className="text-muted-foreground text-sm">
						{search.trim()
							? "Try a different search or clear the filter."
							: 'Add a repository in "Add repository" to save and view your projects.'}
					</p>
				</div>
			) : (
				<>
					<ul className="space-y-4">
						{repos.map((repo) => {
							const repoUrl = repo.url ?? `https://github.com/${repo.fullName}`;
							return (
								<li
									className="overflow-hidden rounded-xl border border-border bg-card"
									key={repo.id}
								>
									<div className="flex items-center justify-between gap-4 p-4 transition-colors hover:bg-muted/30">
										<div className="flex min-w-0 flex-1 items-center gap-3">
											<FolderGit2 className="h-5 w-5 shrink-0 text-primary" />
											<div className="min-w-0 flex-1">
												<p className="truncate font-medium text-[14px] text-foreground">
													{repo.fullName}
												</p>
												{repo.defaultBranch && (
													<p className="text-[12px] text-muted-foreground">
														branch: {repo.defaultBranch}
													</p>
												)}
												<a
													className="mt-1 inline-flex items-center gap-1.5 text-[12px] text-primary hover:underline"
													href={repoUrl}
													rel="noopener noreferrer"
													target="_blank"
												>
													<ExternalLink className="h-3.5 w-3.5" />
													Open project
												</a>
											</div>
										</div>
										<button
											className="shrink-0 rounded-lg p-2 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive disabled:opacity-50"
											disabled={remove.isPending}
											onClick={() => remove.mutate({ id: repo.id, userId })}
											title="Remove repository"
											type="button"
										>
											<Trash2 className="h-4 w-4" />
										</button>
									</div>
									<RepoReviews
										onDeleteReview={(reviewId) =>
											removeReview.mutate({ id: reviewId, userId })
										}
										onSelectReview={onSelectReview}
										repoName={repo.fullName}
										repositoryId={repo.id}
										userId={userId}
									/>
								</li>
							);
						})}
					</ul>

					{totalPages > 1 && (
						<PaginationBar
							label="repositories"
							onPageChange={setPage}
							onPageSizeChange={(n) => {
								setPageSize(n);
								setPage(1);
							}}
							page={page}
							pageSize={pageSize}
							pageSizeOptions={REPO_PAGE_SIZES}
							total={total}
							totalPages={totalPages}
						/>
					)}
				</>
			)}
		</div>
	);
}

function RepoReviews({
	userId,
	repositoryId,
	repoName,
	onSelectReview,
	onDeleteReview,
}: {
	userId: string;
	repositoryId: string;
	repoName: string;
	onSelectReview: (id: string) => void;
	onDeleteReview: (reviewId: string) => void;
}) {
	const { data: reviews, isLoading } = api.prReview.listByRepositoryId.useQuery(
		{ userId, repositoryId },
		{ staleTime: 60 * 1000, gcTime: 5 * 60 * 1000, throwOnError: true },
	);

	if (isLoading) return null;
	const count = reviews?.length ?? 0;

	return (
		<div className="border-border border-t bg-muted/20 px-4 py-3">
			<p className="mb-2 font-medium text-[11px] text-muted-foreground uppercase tracking-wider">
				Reviews in this repository ({count})
			</p>
			{count === 0 ? (
				<p className="text-[13px] text-muted-foreground">
					No reviews yet. Create one in &quot;New PR review&quot; and select{" "}
					<strong>{repoName}</strong> to see it here.
				</p>
			) : (
				<ul className="space-y-2">
					{(reviews ?? []).map((r) => (
						<ReviewCard
							key={r.id}
							onDelete={() => onDeleteReview(r.id)}
							onView={() => onSelectReview(r.id)}
							review={r}
						/>
					))}
				</ul>
			)}
		</div>
	);
}

const REVIEW_STATUS_STYLES: Record<string, string> = {
	pending:
		"bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30",
	in_progress: "bg-primary/15 text-primary border-primary/30",
	completed: "bg-primary/15 text-primary border-primary/30",
	failed: "bg-destructive/15 text-destructive border-destructive/30",
};

type ReviewRecord = {
	id: string;
	prNumber: number;
	prTitle: string | null;
	prUrl: string | null;
	status: string;
	summary: string | null;
};

function ReviewCard({
	review,
	onView,
	onDelete,
}: {
	review: ReviewRecord;
	onView?: () => void;
	onDelete?: () => void;
}) {
	const statusStyle =
		REVIEW_STATUS_STYLES[review.status] ??
		"bg-muted text-muted-foreground border-border";
	return (
		<div className="flex items-start gap-3 rounded-lg border border-border bg-card p-3 transition-colors hover:border-primary/20">
			<div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary/10">
				<GitPullRequest className="h-4 w-4 text-primary" />
			</div>
			<div className="min-w-0 flex-1">
				<div className="flex flex-wrap items-center gap-2">
					<span className="font-semibold text-[14px] text-foreground">
						#{review.prNumber}
						{review.prTitle ? ` — ${review.prTitle}` : ""}
					</span>
					<span
						className={`inline-flex items-center rounded-md border px-2 py-0.5 font-medium text-[11px] ${statusStyle}`}
					>
						{review.status.replace("_", " ")}
					</span>
				</div>
				{review.prUrl && (
					<a
						className="mt-1.5 inline-flex items-center gap-1.5 text-[12px] text-primary hover:underline"
						href={review.prUrl}
						rel="noopener noreferrer"
						target="_blank"
					>
						<ExternalLink className="h-3.5 w-3.5" />
						Open PR
					</a>
				)}
				{review.summary && (
					<p className="mt-2 line-clamp-2 text-[13px] text-muted-foreground leading-relaxed">
						{review.summary}
					</p>
				)}
				<div className="mt-2 flex flex-wrap items-center gap-2">
					{onView && (
						<button
							className="font-medium text-[12px] text-primary hover:underline"
							onClick={onView}
							type="button"
						>
							View diff & AI review →
						</button>
					)}
					{onDelete && (
						<button
							className="font-medium text-[12px] text-destructive hover:underline"
							onClick={onDelete}
							type="button"
						>
							Delete
						</button>
					)}
				</div>
			</div>
		</div>
	);
}

const REVIEW_PAGE_SIZES = [5, 10, 20, 50];
const REVIEW_STATUS_OPTIONS = [
	{ value: "", label: "All statuses" },
	{ value: "pending", label: "Pending" },
	{ value: "in_progress", label: "In progress" },
	{ value: "completed", label: "Completed" },
	{ value: "failed", label: "Failed" },
] as const;

function ReviewsSection({
	userId,
	onSelectReview,
}: {
	userId: string;
	onSelectReview: (id: string) => void;
}) {
	const [status, setStatus] = useState<string>("");
	const [search, setSearch] = useState("");
	const [page, setPage] = useState(1);
	const [pageSize, setPageSize] = useState(10);

	const utils = api.useUtils();
	const remove = api.prReview.remove.useMutation({
		onSuccess: () => {
			utils.prReview.list.invalidate();
			utils.prReview.listByRepositoryId.invalidate();
			toast.success("PR review removed");
		},
		onError: (err) => toast.error(err.message ?? "Failed to remove PR review"),
	});

	const { data, isLoading } = api.prReview.list.useQuery(
		{
			userId,
			status:
				status &&
				status in { pending: 1, in_progress: 1, completed: 1, failed: 1 }
					? (status as "pending" | "in_progress" | "completed" | "failed")
					: undefined,
			search: search.trim() || undefined,
			page,
			pageSize,
		},
		{
			staleTime: 2 * 60 * 1000,
			gcTime: 5 * 60 * 1000,
			throwOnError: true,
		},
	);

	const reviews = data?.items ?? [];
	const total = data?.total ?? 0;
	const totalPages = data?.totalPages ?? 1;

	useEffect(() => {
		setPage(1);
	}, []);

	if (isLoading && !data) {
		return <p className="text-muted-foreground text-sm">Loading PR reviews…</p>;
	}

	return (
		<div className="space-y-4">
			{/* Filter bar */}
			<div className="rounded-xl border border-border bg-card p-4">
				<div className="flex flex-wrap items-center gap-3">
					<div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
						<Filter className="h-4 w-4 shrink-0 text-muted-foreground" />
						<label className="sr-only" htmlFor="review-status">
							Filter by status
						</label>
						<select
							className="rounded-lg border border-input bg-background px-3 py-2 text-[14px] text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
							id="review-status"
							onChange={(e) => setStatus(e.target.value)}
							value={status}
						>
							{REVIEW_STATUS_OPTIONS.map((opt) => (
								<option key={opt.value || "all"} value={opt.value}>
									{opt.label}
								</option>
							))}
						</select>
						<label className="sr-only" htmlFor="review-search">
							Search PR reviews
						</label>
						<div className="relative min-w-50 max-w-sm flex-1">
							<Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
							<input
								className="w-full rounded-lg border border-input bg-background py-2 pr-4 pl-9 text-[14px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
								id="review-search"
								onChange={(e) => setSearch(e.target.value)}
								placeholder="Search by PR # or title…"
								type="search"
								value={search}
							/>
							{search && (
								<button
									aria-label="Clear search"
									className="absolute top-1/2 right-2 -translate-y-1/2 rounded p-1 text-muted-foreground hover:bg-accent hover:text-foreground"
									onClick={() => setSearch("")}
									type="button"
								>
									<X className="h-4 w-4" />
								</button>
							)}
						</div>
					</div>
					{(status || search || total > pageSize) && (
						<span className="text-[12px] text-muted-foreground">
							{total} {total === 1 ? "review" : "reviews"}
						</span>
					)}
				</div>
			</div>

			{!reviews.length ? (
				<div className="rounded-xl border border-border bg-card p-10 text-center">
					<GitPullRequest className="mx-auto mb-4 h-14 w-14 text-muted-foreground/60" />
					<p className="mb-1 font-medium text-muted-foreground">
						{status || search.trim()
							? "No PR reviews match your filters"
							: "No PR reviews yet"}
					</p>
					<p className="text-muted-foreground text-sm">
						{status || search.trim()
							? "Try changing the status filter or search."
							: 'Create one in "New PR review". If you pick a repository, it will show under that repo too.'}
					</p>
				</div>
			) : (
				<>
					<ul className="space-y-3">
						{reviews.map((review) => (
							<li key={review.id}>
								<ReviewCard
									onDelete={() => remove.mutate({ id: review.id, userId })}
									onView={() => onSelectReview(review.id)}
									review={review}
								/>
							</li>
						))}
					</ul>

					{totalPages > 1 && (
						<PaginationBar
							label="reviews"
							onPageChange={setPage}
							onPageSizeChange={(n) => {
								setPageSize(n);
								setPage(1);
							}}
							page={page}
							pageSize={pageSize}
							pageSizeOptions={REVIEW_PAGE_SIZES}
							total={total}
							totalPages={totalPages}
						/>
					)}
				</>
			)}
		</div>
	);
}

function IncludeRepositorySection({
	userId,
	onDone,
}: {
	userId: string;
	onDone: () => void;
}) {
	const [fullName, setFullName] = useState("");
	const [url, setUrl] = useState("");
	const [defaultBranch, setDefaultBranch] = useState("main");
	const utils = api.useUtils();
	const add = api.repository.add.useMutation({
		onSuccess: () => {
			utils.repository.list.invalidate();
			setFullName("");
			setUrl("");
			toast.success("Repository added.");
			onDone();
		},
		onError: (err) => toast.error(err.message),
	});

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		const trimmed = fullName.trim();
		if (!trimmed) return;
		const parts = trimmed
			.split("/")
			.map((p) => p.trim())
			.filter(Boolean);
		const owner = parts[0] ?? trimmed;
		const name = parts[1] ?? parts[0] ?? trimmed;
		add.mutate({
			userId,
			fullName: `${owner}/${name}`,
			owner,
			name,
			url: url.trim() || undefined,
			defaultBranch: defaultBranch.trim() || undefined,
		});
	};

	return (
		<div className="max-w-lg">
			<p className="mb-4 text-muted-foreground text-sm">
				Save a link to your project (repository). You can always view and open
				your saved projects under &quot;All repositories&quot;.
			</p>
			<form
				className="space-y-4 rounded-xl border border-border bg-card p-6"
				onSubmit={handleSubmit}
			>
				<div>
					<label
						className="mb-2 block font-medium text-[12px] text-muted-foreground uppercase tracking-wider"
						htmlFor="fullName"
					>
						Repository (owner/name)
					</label>
					<input
						className="w-full rounded-lg border border-input bg-background px-4 py-2.5 text-[14px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
						id="fullName"
						onChange={(e) => setFullName(e.target.value)}
						placeholder="e.g. vercel/next.js"
						type="text"
						value={fullName}
					/>
				</div>
				<div>
					<label
						className="mb-2 block font-medium text-[12px] text-muted-foreground uppercase tracking-wider"
						htmlFor="url"
					>
						Project link (optional)
					</label>
					<input
						className="w-full rounded-lg border border-input bg-background px-4 py-2.5 text-[14px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
						id="url"
						onChange={(e) => setUrl(e.target.value)}
						placeholder="https://github.com/owner/repo"
						type="url"
						value={url}
					/>
				</div>
				<div>
					<label
						className="mb-2 block font-medium text-[12px] text-muted-foreground uppercase tracking-wider"
						htmlFor="defaultBranch"
					>
						Default branch (optional)
					</label>
					<input
						className="w-full rounded-lg border border-input bg-background px-4 py-2.5 text-[14px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
						id="defaultBranch"
						onChange={(e) => setDefaultBranch(e.target.value)}
						placeholder="main"
						type="text"
						value={defaultBranch}
					/>
				</div>
				<button
					className="w-full rounded-lg bg-primary py-2.5 font-semibold text-[14px] text-primary-foreground transition-opacity hover:opacity-90 disabled:pointer-events-none disabled:opacity-50"
					disabled={add.isPending || !fullName.trim()}
					type="submit"
				>
					{add.isPending ? "Adding…" : "Add repository"}
				</button>
			</form>
		</div>
	);
}

function NewReviewSection({
	userId,
	onCreated,
}: {
	userId: string;
	onCreated: (id: string) => void;
}) {
	const { data: reposData } = api.repository.list.useQuery(
		{ userId, pageSize: 50 },
		{ staleTime: 2 * 60 * 1000, gcTime: 5 * 60 * 1000, throwOnError: true },
	);
	const repos = reposData?.items ?? [];
	const [prNumber, setPrNumber] = useState("");
	const [prUrl, setPrUrl] = useState("");
	const [prTitle, setPrTitle] = useState("");
	const [repositoryId, setRepositoryId] = useState("");
	const utils = api.useUtils();
	const create = api.prReview.create.useMutation({
		onSuccess: (data) => {
			utils.prReview.invalidate();
			setPrNumber("");
			setPrUrl("");
			setPrTitle("");
			toast.success("PR review created. Opening the review…");
			if (data?.id) {
				onCreated(data.id);
			}
		},
		onError: (err) => toast.error(err.message),
	});

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		const num = parseInt(prNumber, 10);
		if (Number.isNaN(num) || num < 1) return;
		let url: string | undefined = prUrl.trim() || undefined;
		if (url && !/^https?:\/\//i.test(url)) {
			url = `https://${url}`;
		}
		create.mutate({
			userId,
			repositoryId: repositoryId || undefined,
			prNumber: num,
			prUrl: url,
			prTitle: prTitle.trim() || undefined,
		});
	};

	return (
		<div className="max-w-xl">
			<div className="mb-6 rounded-xl border border-border bg-card p-6">
				<h3 className="mb-1 font-semibold text-foreground text-sm">
					Create a PR review
				</h3>
				<p className="text-[13px] text-muted-foreground">
					Add a pull request to track. If you select a repository, this review
					will automatically appear under that repo in &quot;All
					repositories&quot; so you can see all reviews per project.
				</p>
			</div>
			<form
				className="space-y-5 rounded-xl border border-border bg-card p-6"
				onSubmit={handleSubmit}
			>
				{repos.length > 0 && (
					<div>
						<label
							className="mb-2 block font-medium text-[12px] text-muted-foreground uppercase tracking-wider"
							htmlFor="repositoryId"
						>
							Repository (optional)
						</label>
						<select
							className="w-full rounded-lg border border-input bg-background px-4 py-2.5 text-[14px] text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
							id="repositoryId"
							onChange={(e) => setRepositoryId(e.target.value)}
							value={repositoryId}
						>
							<option value="">— None —</option>
							{repos.map((r) => (
								<option key={r.id} value={r.id}>
									{r.fullName}
								</option>
							))}
						</select>
					</div>
				)}
				<div>
					<label
						className="mb-2 block font-medium text-[12px] text-muted-foreground uppercase tracking-wider"
						htmlFor="prNumber"
					>
						PR number *
					</label>
					<input
						className="w-full rounded-lg border border-input bg-background px-4 py-2.5 text-[14px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
						id="prNumber"
						min={1}
						onChange={(e) => setPrNumber(e.target.value)}
						placeholder="42"
						type="number"
						value={prNumber}
					/>
				</div>
				<div>
					<label
						className="mb-2 block font-medium text-[12px] text-muted-foreground uppercase tracking-wider"
						htmlFor="prTitle"
					>
						PR title (optional)
					</label>
					<input
						className="w-full rounded-lg border border-input bg-background px-4 py-2.5 text-[14px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
						id="prTitle"
						onChange={(e) => setPrTitle(e.target.value)}
						placeholder="Fix login bug"
						type="text"
						value={prTitle}
					/>
				</div>
				<div>
					<label
						className="mb-2 block font-medium text-[12px] text-muted-foreground uppercase tracking-wider"
						htmlFor="prUrl"
					>
						PR link (optional)
					</label>
					<input
						className="w-full rounded-lg border border-input bg-background px-4 py-2.5 text-[14px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
						id="prUrl"
						onChange={(e) => setPrUrl(e.target.value)}
						placeholder="https://github.com/owner/repo/pull/42"
						type="url"
						value={prUrl}
					/>
				</div>
				<button
					className="w-full rounded-lg bg-primary py-3 font-semibold text-[14px] text-primary-foreground transition-opacity hover:opacity-90 disabled:pointer-events-none disabled:opacity-50"
					disabled={create.isPending || !prNumber.trim()}
					type="submit"
				>
					{create.isPending ? "Creating…" : "Create PR review"}
				</button>
			</form>
		</div>
	);
}

function ReviewDetailPanelSkeleton() {
	return (
		<div className="fixed inset-y-0 right-0 z-40 flex w-full max-w-2xl flex-col overflow-hidden border-border border-l bg-card shadow-2xl">
			<div className="flex shrink-0 items-center justify-between gap-4 border-border border-b bg-muted/30 p-4">
				<div className="min-w-0 flex-1 space-y-2">
					<div className="h-5 w-48 animate-pulse rounded-md bg-muted" />
					<div className="h-4 w-32 animate-pulse rounded bg-muted" />
				</div>
				<div className="h-9 w-9 shrink-0 animate-pulse rounded-lg bg-muted" />
			</div>
			<div className="flex-1 space-y-6 overflow-y-auto p-4">
				<div className="space-y-2">
					<div className="h-4 w-40 animate-pulse rounded bg-muted" />
					<div className="h-36 animate-pulse rounded-lg bg-muted/50" />
					<div className="h-9 w-24 animate-pulse rounded-lg bg-muted" />
				</div>
				<div className="space-y-2">
					<div className="h-4 w-24 animate-pulse rounded bg-muted" />
					<div className="h-10 w-full animate-pulse rounded-lg bg-muted" />
				</div>
				<div className="space-y-2">
					<div className="h-4 w-36 animate-pulse rounded bg-muted" />
					<div className="h-48 animate-pulse rounded-lg bg-muted/30" />
				</div>
			</div>
		</div>
	);
}

function ReviewDetailPanel({
	reviewId,
	userId,
	onClose,
}: {
	reviewId: string;
	userId: string;
	onClose: () => void;
}) {
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
	const [limitInput, setLimitInput] = useState("");
	const [providerSelect, setProviderSelect] = useState<"openai" | "gemini">(
		"openai",
	);
	const [openaiKeyInput, setOpenaiKeyInput] = useState("");
	const [geminiKeyInput, setGeminiKeyInput] = useState("");
	const [postToGitHub, setPostToGitHub] = useState(false);
	const [autoFetchFromGitHub, setAutoFetchFromGitHub] = useState(true);

	useEffect(() => {
		if (aiUsage?.provider === "openai" || aiUsage?.provider === "gemini")
			setProviderSelect(aiUsage.provider);
	}, [aiUsage?.provider]);

	useEffect(() => {
		if (aiUsage?.postAiReviewToGitHub !== undefined) {
			setPostToGitHub(aiUsage.postAiReviewToGitHub);
		}
	}, [aiUsage?.postAiReviewToGitHub]);

	const setAiSettings = api.prReview.setAiReviewSettings.useMutation({
		onSuccess: () => {
			utils.prReview.getAiReviewUsage.invalidate({ userId });
			setOpenaiKeyInput("");
			setGeminiKeyInput("");
			toast.success("AI settings saved.");
		},
		onError: (e) => toast.error(e.message),
	});

	const setLimit = api.prReview.setAiReviewLimit.useMutation({
		onSuccess: () => {
			utils.prReview.getAiReviewUsage.invalidate({ userId });
		},
		onError: (e) => toast.error(e.message),
	});

	const updateDiff = api.prReview.updateDiff.useMutation({
		onSuccess: () => {
			utils.prReview.getById.invalidate({ id: reviewId, userId });
			toast.success("Diff saved");
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
			utils.prReview.getById.invalidate();
			utils.prReview.list.invalidate();
			utils.prReview.listByRepositoryId.invalidate();
			toast.success("PR review removed");
			onClose();
		},
		onError: (e) => toast.error(e.message),
	});

	useEffect(() => {
		if (review?.diffText != null) setDiffText(review.diffText ?? "");
	}, [review?.diffText]);

	if (isLoading || !review) {
		return (
			<div className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm">
				<ReviewDetailPanelSkeleton />
			</div>
		);
	}

	const statusLabel =
		review.status === "in_progress"
			? "Running…"
			: review.status === "completed"
				? "Completed"
				: review.status === "failed"
					? "Failed"
					: "Pending";

	return (
		<div className="fixed inset-y-0 right-0 z-40 flex w-full max-w-2xl flex-col overflow-hidden border-border border-l bg-card shadow-2xl">
			{/* Header */}
			<div className="flex shrink-0 items-center justify-between gap-4 border-border border-b bg-muted/30 p-4">
				<div className="min-w-0 flex-1">
					<div className="flex flex-wrap items-center gap-2">
						<h2 className="truncate font-semibold text-foreground text-lg">
							PR #{review.prNumber}
							{review.prTitle ? ` — ${review.prTitle}` : ""}
						</h2>
						<span
							className={`inline-flex items-center rounded-md px-2 py-0.5 font-medium text-[11px] ${
								review.status === "completed"
									? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400"
									: review.status === "in_progress"
										? "bg-primary/15 text-primary"
										: review.status === "failed"
											? "bg-destructive/15 text-destructive"
											: "bg-muted text-muted-foreground"
							}`}
						>
							{statusLabel}
						</span>
					</div>
					{review.prUrl && (
						<a
							className="mt-1 inline-flex items-center gap-1 text-primary text-sm hover:underline"
							href={review.prUrl}
							rel="noopener noreferrer"
							target="_blank"
						>
							<ExternalLink className="h-3.5 w-3.5" />
							Open PR
						</a>
					)}
				</div>
				<div className="flex shrink-0 items-center gap-1">
					<button
						aria-label="Delete review"
						className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive disabled:opacity-50"
						disabled={remove.isPending}
						onClick={() => remove.mutate({ id: reviewId, userId })}
						title="Delete PR review"
						type="button"
					>
						<Trash2 className="h-5 w-5" />
					</button>
					<button
						aria-label="Close"
						className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
						onClick={onClose}
						type="button"
					>
						<X className="h-5 w-5" />
					</button>
				</div>
			</div>

			<div className="flex-1 space-y-6 overflow-y-auto p-4">
				{/* Diff input */}
				<section className="space-y-3">
					<div className="flex items-center gap-2">
						<FileDiff className="h-4 w-4 shrink-0 text-primary" />
						<h3 className="font-semibold text-foreground text-sm">Diff</h3>
					</div>
					<p className="text-[13px] text-muted-foreground">
						Paste your git diff or patch below, then save. Use &quot;Run AI
						review&quot; to analyze.
					</p>
					<textarea
						className="h-40 min-h-30 w-full resize-y rounded-lg border border-input bg-background px-3 py-2 font-mono text-[13px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
						onChange={(e) => setDiffText(e.target.value)}
						placeholder="Paste git diff or patch content…"
						spellCheck={false}
						value={diffText}
					/>
					<div className="flex flex-wrap items-center gap-2">
						<button
							className="rounded-lg bg-muted px-4 py-2 font-medium text-foreground text-sm transition-opacity hover:bg-muted/80 disabled:pointer-events-none disabled:opacity-50"
							disabled={
								updateDiff.isPending || diffText === (review.diffText ?? "")
							}
							onClick={() =>
								updateDiff.mutate({ id: reviewId, userId, diffText })
							}
							type="button"
						>
							{updateDiff.isPending ? "Saving…" : "Save diff"}
						</button>
						{diffText.trim() && (
							<div className="text-[12px] text-muted-foreground">Preview:</div>
						)}
					</div>
					{diffText.trim() && (
						<DiffViewer
							className="max-h-48 overflow-y-auto"
							content={diffText}
						/>
					)}
				</section>

				{/* Run AI */}
				<section className="space-y-3">
					<div className="flex items-center gap-2">
						<Sparkles className="h-4 w-4 shrink-0 text-primary" />
						<h3 className="font-semibold text-foreground text-sm">AI review</h3>
					</div>
					<p className="text-[13px] text-muted-foreground">
						Run AI analysis on the diff. You’ll get a notification when it’s
						done.
					</p>
					<div className="flex items-start gap-2 rounded-md border border-border/80 bg-background/50 p-3">
						<input
							checked={autoFetchFromGitHub}
							className="mt-1 h-4 w-4 shrink-0 rounded border-input"
							id="auto-fetch-diff"
							onChange={(e) => setAutoFetchFromGitHub(e.target.checked)}
							type="checkbox"
						/>
						<label
							className="cursor-pointer text-[12px] text-muted-foreground leading-snug"
							htmlFor="auto-fetch-diff"
						>
							<span className="font-medium text-foreground">
								Auto-fetch latest PR diff from GitHub
							</span>
							<br />
							When enabled, Run AI review first tries GitHub (using linked repo
							or PR URL). If fetch fails, your saved/manual diff is used.
						</label>
					</div>
					{/* AI provider & API keys */}
					<div className="space-y-3 rounded-lg border border-border bg-muted/20 p-3">
						<p className="font-medium text-[12px] text-foreground">
							Provider & API keys
						</p>
						<div className="flex flex-col gap-2">
							<label
								className="text-[12px] text-muted-foreground"
								htmlFor="ai-provider-select"
							>
								AI provider
							</label>
							<select
								className="w-full max-w-xs rounded-md border border-input bg-background px-3 py-2 text-[13px] text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
								id="ai-provider-select"
								onChange={(e) =>
									setProviderSelect(e.target.value as "openai" | "gemini")
								}
								value={providerSelect}
							>
								<option value="openai">ChatGPT (OpenAI)</option>
								<option value="gemini">Gemini (Google)</option>
							</select>
						</div>
						<div className="flex flex-col gap-1">
							<label
								className="text-[12px] text-muted-foreground"
								htmlFor="openai-api-key"
							>
								OpenAI API key{" "}
								{aiUsage?.openaiConfigured && (
									<span className="text-emerald-600 dark:text-emerald-400">
										(configured)
									</span>
								)}
							</label>
							<input
								autoComplete="off"
								className="w-full rounded-md border border-input bg-background px-3 py-2 text-[13px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
								id="openai-api-key"
								onChange={(e) => setOpenaiKeyInput(e.target.value)}
								placeholder="sk-… (leave empty to keep current)"
								type="password"
								value={openaiKeyInput}
							/>
						</div>
						<div className="flex flex-col gap-1">
							<label
								className="text-[12px] text-muted-foreground"
								htmlFor="gemini-api-key"
							>
								Gemini API key{" "}
								{aiUsage?.geminiConfigured && (
									<span className="text-emerald-600 dark:text-emerald-400">
										(configured)
									</span>
								)}
							</label>
							<input
								autoComplete="off"
								className="w-full rounded-md border border-input bg-background px-3 py-2 text-[13px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
								id="gemini-api-key"
								onChange={(e) => setGeminiKeyInput(e.target.value)}
								placeholder="Leave empty to keep current · Get key: aistudio.google.com"
								type="password"
								value={geminiKeyInput}
							/>
						</div>
						<div className="flex items-start gap-2 rounded-md border border-border/80 bg-background/50 p-3">
							<input
								checked={postToGitHub}
								className="mt-1 h-4 w-4 shrink-0 rounded border-input"
								id="post-to-github"
								onChange={(e) => setPostToGitHub(e.target.checked)}
								type="checkbox"
							/>
							<label
								className="cursor-pointer text-[12px] text-muted-foreground leading-snug"
								htmlFor="post-to-github"
							>
								<span className="font-medium text-foreground">
									Post AI summary to GitHub
								</span>
								<br />
								After each run, add the AI review as a comment on the PR
								conversation (needs a linked repo or PR URL, and GitHub sign-in
								with <code className="text-[11px] text-brand">repo</code> access
								— sign out and sign in again if you enabled this after
								upgrading).
							</label>
						</div>
						<button
							className="self-start rounded-md bg-muted px-3 py-1.5 font-medium text-[13px] text-foreground hover:bg-muted/80 disabled:opacity-50"
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
							{setAiSettings.isPending ? "Saving…" : "Save AI settings"}
						</button>
					</div>
					{/* AI review limit */}
					<div className="space-y-2 rounded-lg border border-border bg-muted/20 p-3">
						<p className="font-medium text-[12px] text-foreground">
							AI review limit (optional)
						</p>
						<p className="text-[12px] text-muted-foreground">
							Set a limit (e.g. 5). After that many completed AI reviews, the
							button is disabled until you increase the limit or clear it.
						</p>
						<div className="flex flex-wrap items-center gap-2">
							<input
								className="w-20 rounded-md border border-input bg-background px-2.5 py-1.5 text-[13px] text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
								max={1000}
								min={1}
								onChange={(e) => setLimitInput(e.target.value)}
								placeholder={aiUsage?.limit?.toString() ?? "No limit"}
								type="number"
								value={limitInput}
							/>
							<button
								className="rounded-md bg-muted px-3 py-1.5 font-medium text-[13px] text-foreground hover:bg-muted/80 disabled:opacity-50"
								disabled={setLimit.isPending}
								onClick={() => {
									const v = limitInput.trim();
									const num = v ? Number.parseInt(v, 10) : null;
									const isValid =
										num !== null &&
										!Number.isNaN(num) &&
										num >= 1 &&
										num <= 1000;
									if (v && !isValid) {
										toast.error("Enter a number between 1 and 1000");
										return;
									}
									setLimit.mutate({ userId, limit: num ?? null });
									setLimitInput("");
								}}
								type="button"
							>
								{setLimit.isPending ? "Saving…" : "Set limit"}
							</button>
							{aiUsage && aiUsage.limit != null && (
								<>
									<span className="text-[12px] text-muted-foreground">
										Used:{" "}
										<strong className="text-foreground">{aiUsage.used}</strong>{" "}
										/ {aiUsage.limit}
									</span>
									<button
										className="text-[12px] text-muted-foreground hover:text-foreground hover:underline"
										disabled={setLimit.isPending}
										onClick={() => setLimit.mutate({ userId, limit: null })}
										type="button"
									>
										Clear limit
									</button>
								</>
							)}
						</div>
					</div>
					{aiUsage &&
						aiUsage.limit != null &&
						aiUsage.used >= aiUsage.limit && (
							<p className="text-[12px] text-destructive">
								Limit reached. Increase the limit above to run more AI reviews.
							</p>
						)}
					<button
						className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 font-semibold text-primary-foreground text-sm transition-opacity hover:opacity-90 disabled:opacity-50"
						disabled={
							runAi.isPending ||
							(aiUsage != null &&
								aiUsage.limit != null &&
								aiUsage.used >= aiUsage.limit)
						}
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
						{runAi.isPending
							? "Running AI review…"
							: aiUsage != null &&
									aiUsage.limit != null &&
									aiUsage.used >= aiUsage.limit
								? "Run AI review (limit reached)"
								: "Run AI review"}
					</button>
				</section>

				{/* AI result */}
				{review.aiReview && (
					<section className="space-y-3">
						<h3 className="font-semibold text-foreground text-sm">
							AI review result
						</h3>
						<div className="rounded-xl border border-border bg-card p-5 shadow-sm">
							<MarkdownReview content={review.aiReview} />
						</div>
					</section>
				)}
			</div>
		</div>
	);
}
