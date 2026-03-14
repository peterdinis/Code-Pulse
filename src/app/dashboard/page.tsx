"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useSession, signOut } from "~/lib/client";
import { api } from "~/trpc/react";
import { toast } from "sonner";
import {
  LayoutDashboard,
  LogOut,
  ArrowLeft,
  FolderGit2,
  GitPullRequest,
  PlusCircle,
  FileCheck,
  Trash2,
  ExternalLink,
  X,
  Sparkles,
  FileDiff,
  Search,
  Filter,
} from "lucide-react";
import { ThemeToggle } from "~/components/ThemeToggle";
import { NotificationBell } from "~/components/NotificationBell";
import { ClientOnly } from "~/components/ClientOnly";
import { DiffViewer } from "~/components/DiffViewer";
import { MarkdownReview } from "~/components/MarkdownReview";
import { PaginationBar } from "~/components/PaginationBar";
import { LoadingScreen } from "~/components/LoadingScreen";

type DashboardSection = "repositories" | "reviews" | "include-repo" | "new-review";

function RedirectToHome() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/");
  }, [router]);
  return <LoadingScreen label="Redirecting…" />;
}

export default function DashboardPage() {
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const [section, setSection] = useState<DashboardSection>("repositories");
  const [selectedReviewId, setSelectedReviewId] = useState<string | null>(null);

  return (
    <ClientOnly fallback={<LoadingScreen label="Loading dashboard…" />}>
      {isPending ? (
        <LoadingScreen label="Loading dashboard…" />
      ) : !session?.user ? (
        <RedirectToHome />
      ) : (
        <DashboardContent
          userId={session.user.id}
          section={section}
          setSection={setSection}
          selectedReviewId={selectedReviewId}
          setSelectedReviewId={setSelectedReviewId}
          session={session}
        />
      )}
    </ClientOnly>
  );
}

function DashboardContent({
  userId,
  section,
  setSection,
  selectedReviewId,
  setSelectedReviewId,
  session,
}: {
  userId: string;
  section: DashboardSection;
  setSection: (s: DashboardSection) => void;
  selectedReviewId: string | null;
  setSelectedReviewId: (id: string | null) => void;
  session: { user: { email?: string | null } };
}) {
  return (
    <div className="min-h-screen bg-background text-foreground font-sans antialiased flex">
      {/* Sidebar */}
      <aside className="w-[260px] shrink-0 border-r border-border bg-card flex flex-col">
        <div className="p-4 border-b border-border flex items-center justify-between gap-2">
          <Link
            href="/"
            className="flex items-center gap-2 text-[13px] text-muted-foreground hover:text-primary transition-colors"
          >
            <ArrowLeft className="w-4 h-4 shrink-0" />
            Home
          </Link>
          <ThemeToggle />
        </div>
        <nav className="p-2 flex-1">
          <p className="px-3 py-2 text-[10px] text-muted-foreground uppercase tracking-widest font-medium">
            Dashboard
          </p>
          <button
            type="button"
            onClick={() => setSection("repositories")}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] transition-colors ${
              section === "repositories"
                ? "bg-primary/10 text-primary font-medium"
                : "text-foreground hover:bg-accent"
            }`}
          >
            <FolderGit2 className="w-4 h-4 shrink-0" />
            All repositories
          </button>
          <button
            type="button"
            onClick={() => setSection("reviews")}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] transition-colors ${
              section === "reviews"
                ? "bg-primary/10 text-primary font-medium"
                : "text-foreground hover:bg-accent"
            }`}
          >
            <GitPullRequest className="w-4 h-4 shrink-0" />
            All PR reviews
          </button>
          <button
            type="button"
            onClick={() => setSection("include-repo")}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] transition-colors ${
              section === "include-repo"
                ? "bg-primary/10 text-primary font-medium"
                : "text-foreground hover:bg-accent"
            }`}
          >
            <PlusCircle className="w-4 h-4 shrink-0" />
            Add repository
          </button>
          <button
            type="button"
            onClick={() => setSection("new-review")}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] transition-colors ${
              section === "new-review"
                ? "bg-primary/10 text-primary font-medium"
                : "text-foreground hover:bg-accent"
            }`}
          >
            <FileCheck className="w-4 h-4 shrink-0" />
            New PR review
          </button>
        </nav>
        <div className="p-2 border-t border-border">
          <span className="block px-3 py-2 text-[12px] text-muted-foreground truncate">
            {session.user.email}
          </span>
          <button
            type="button"
            onClick={() => signOut()}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            Sign out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-14 border-b border-border flex items-center justify-between px-5 md:px-10 bg-background/95 backdrop-blur-xl">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-muted border border-border flex items-center justify-center">
              <LayoutDashboard className="w-4 h-4 text-primary" />
            </div>
            <h1 className="font-semibold text-lg text-foreground tracking-tight">
              {section === "repositories" && "Repositories"}
              {section === "reviews" && "PR reviews"}
              {section === "include-repo" && "Add repository"}
              {section === "new-review" && "New PR review"}
            </h1>
          </div>
          <NotificationBell userId={userId} />
        </header>

        <main className="flex-1 overflow-auto p-6 md:p-10 relative">
          {selectedReviewId && (
            <ReviewDetailPanel
              reviewId={selectedReviewId}
              userId={userId}
              onClose={() => setSelectedReviewId(null)}
            />
          )}
          {section === "repositories" && (
            <RepositoriesSection
              userId={userId}
              onSelectReview={setSelectedReviewId}
            />
          )}
          {section === "reviews" && (
            <ReviewsSection
              userId={userId}
              selectedReviewId={selectedReviewId}
              onSelectReview={setSelectedReviewId}
            />
          )}
          {section === "include-repo" && (
          <IncludeRepositorySection
            userId={userId}
            onDone={() => setSection("repositories")}
          />
          )}
          {section === "new-review" && (
          <NewReviewSection
            userId={userId}
            onCreated={(id) => {
              setSection("reviews");
              setSelectedReviewId(id);
            }}
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
  }, [search]);

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
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <Filter className="w-4 h-4 text-muted-foreground shrink-0" />
            <label htmlFor="repo-search" className="sr-only">
              Search repositories
            </label>
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              <input
                id="repo-search"
                type="search"
                placeholder="Filter by name (e.g. owner/repo)"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-lg bg-background border border-input text-foreground text-[14px] placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded text-muted-foreground hover:text-foreground hover:bg-accent"
                  aria-label="Clear search"
                >
                  <X className="w-4 h-4" />
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
          <FolderGit2 className="w-14 h-14 text-muted-foreground/60 mx-auto mb-4" />
          <p className="text-muted-foreground font-medium mb-1">
            {search.trim() ? "No repositories match your filter" : "No repositories yet"}
          </p>
          <p className="text-sm text-muted-foreground">
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
                  key={repo.id}
                  className="rounded-xl border border-border bg-card overflow-hidden"
                >
                  <div className="flex items-center justify-between gap-4 p-4 hover:bg-muted/30 transition-colors">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <FolderGit2 className="w-5 h-5 text-primary shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="text-[14px] font-medium text-foreground truncate">
                          {repo.fullName}
                        </p>
                        {repo.defaultBranch && (
                          <p className="text-[12px] text-muted-foreground">
                            branch: {repo.defaultBranch}
                          </p>
                        )}
                        <a
                          href={repoUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 mt-1 text-[12px] text-primary hover:underline"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          Open project
                        </a>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => remove.mutate({ id: repo.id, userId })}
                      disabled={remove.isPending}
                      className="p-2 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors shrink-0 disabled:opacity-50"
                      title="Remove repository"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <RepoReviews
                    userId={userId}
                    repositoryId={repo.id}
                    repoName={repo.fullName}
                    onSelectReview={onSelectReview}
                    onDeleteReview={(reviewId) => removeReview.mutate({ id: reviewId, userId })}
                  />
                </li>
              );
            })}
          </ul>

          {totalPages > 1 && (
            <PaginationBar
              page={page}
              totalPages={totalPages}
              total={total}
              pageSize={pageSize}
              onPageChange={setPage}
              pageSizeOptions={REPO_PAGE_SIZES}
              onPageSizeChange={(n) => {
                setPageSize(n);
                setPage(1);
              }}
              label="repositories"
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
    <div className="border-t border-border bg-muted/20 px-4 py-3">
      <p className="text-[11px] text-muted-foreground uppercase tracking-wider font-medium mb-2">
        Reviews in this repository ({count})
      </p>
      {count === 0 ? (
        <p className="text-[13px] text-muted-foreground">
          No reviews yet. Create one in &quot;New PR review&quot; and select <strong>{repoName}</strong> to see it here.
        </p>
      ) : (
        <ul className="space-y-2">
          {(reviews ?? []).map((r) => (
            <ReviewCard
              key={r.id}
              review={r}
              onView={() => onSelectReview(r.id)}
              onDelete={() => onDeleteReview(r.id)}
            />
          ))}
        </ul>
      )}
    </div>
  );
}

const REVIEW_STATUS_STYLES: Record<string, string> = {
  pending: "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30",
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
  const statusStyle = REVIEW_STATUS_STYLES[review.status] ?? "bg-muted text-muted-foreground border-border";
  return (
    <div className="flex items-start gap-3 p-3 rounded-lg border border-border bg-card hover:border-primary/20 transition-colors">
      <div className="w-8 h-8 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
        <GitPullRequest className="w-4 h-4 text-primary" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[14px] font-semibold text-foreground">
            #{review.prNumber}
            {review.prTitle ? ` — ${review.prTitle}` : ""}
          </span>
          <span
            className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium border ${statusStyle}`}
          >
            {review.status.replace("_", " ")}
          </span>
        </div>
        {review.prUrl && (
          <a
            href={review.prUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 mt-1.5 text-[12px] text-primary hover:underline"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            Open PR
          </a>
        )}
        {review.summary && (
          <p className="mt-2 text-[13px] text-muted-foreground leading-relaxed line-clamp-2">
            {review.summary}
          </p>
        )}
        <div className="mt-2 flex flex-wrap items-center gap-2">
          {onView && (
            <button
              type="button"
              onClick={onView}
              className="text-[12px] text-primary font-medium hover:underline"
            >
              View diff & AI review →
            </button>
          )}
          {onDelete && (
            <button
              type="button"
              onClick={onDelete}
              className="text-[12px] text-destructive font-medium hover:underline"
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
  selectedReviewId,
  onSelectReview,
}: {
  userId: string;
  selectedReviewId: string | null;
  onSelectReview: (id: string | null) => void;
}) {
  const [status, setStatus] = useState<string>("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const utils = api.useUtils();
  const remove = api.prReview.remove.useMutation({
    onSuccess: (_data, variables) => {
      utils.prReview.list.invalidate();
      utils.prReview.listByRepositoryId.invalidate();
      if (variables.id === selectedReviewId) {
        onSelectReview(null);
      }
      toast.success("PR review removed");
    },
    onError: (err) => toast.error(err.message ?? "Failed to remove PR review"),
  });

  const { data, isLoading } = api.prReview.list.useQuery(
    {
      userId,
      status: status && status in { pending: 1, in_progress: 1, completed: 1, failed: 1 } ? (status as "pending" | "in_progress" | "completed" | "failed") : undefined,
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
  }, [status, search]);

  if (isLoading && !data) {
    return <p className="text-muted-foreground text-sm">Loading PR reviews…</p>;
  }

  return (
    <div className="space-y-4">
      {/* Filter bar */}
      <div className="rounded-xl border border-border bg-card p-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 min-w-0 flex-1 flex-wrap">
            <Filter className="w-4 h-4 text-muted-foreground shrink-0" />
            <label htmlFor="review-status" className="sr-only">
              Filter by status
            </label>
            <select
              id="review-status"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="rounded-lg border border-input bg-background px-3 py-2 text-[14px] text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            >
              {REVIEW_STATUS_OPTIONS.map((opt) => (
                <option key={opt.value || "all"} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <label htmlFor="review-search" className="sr-only">
              Search PR reviews
            </label>
            <div className="relative flex-1 min-w-[200px] max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              <input
                id="review-search"
                type="search"
                placeholder="Search by PR # or title…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-lg bg-background border border-input text-foreground text-[14px] placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded text-muted-foreground hover:text-foreground hover:bg-accent"
                  aria-label="Clear search"
                >
                  <X className="w-4 h-4" />
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
          <GitPullRequest className="w-14 h-14 text-muted-foreground/60 mx-auto mb-4" />
          <p className="text-muted-foreground font-medium mb-1">
            {status || search.trim()
              ? "No PR reviews match your filters"
              : "No PR reviews yet"}
          </p>
          <p className="text-sm text-muted-foreground">
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
                  review={review}
                  onView={() => onSelectReview(review.id)}
                  onDelete={() => remove.mutate({ id: review.id, userId })}
                />
              </li>
            ))}
          </ul>

          {totalPages > 1 && (
            <PaginationBar
              page={page}
              totalPages={totalPages}
              total={total}
              pageSize={pageSize}
              onPageChange={setPage}
              pageSizeOptions={REVIEW_PAGE_SIZES}
              onPageSizeChange={(n) => {
                setPageSize(n);
                setPage(1);
              }}
              label="reviews"
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
    const parts = trimmed.split("/").map((p) => p.trim()).filter(Boolean);
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
      <p className="text-sm text-muted-foreground mb-4">
        Save a link to your project (repository). You can always view and open your saved projects under &quot;All repositories&quot;.
      </p>
      <form
        onSubmit={handleSubmit}
        className="p-6 rounded-xl border border-border bg-card space-y-4"
      >
        <div>
          <label
            htmlFor="fullName"
            className="block text-[12px] text-muted-foreground uppercase tracking-wider mb-2 font-medium"
          >
            Repository (owner/name)
          </label>
          <input
            id="fullName"
            type="text"
            placeholder="e.g. vercel/next.js"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="w-full px-4 py-2.5 rounded-lg bg-background border border-input text-foreground text-[14px] placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <div>
          <label
            htmlFor="url"
            className="block text-[12px] text-muted-foreground uppercase tracking-wider mb-2 font-medium"
          >
            Project link (optional)
          </label>
          <input
            id="url"
            type="url"
            placeholder="https://github.com/owner/repo"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="w-full px-4 py-2.5 rounded-lg bg-background border border-input text-foreground text-[14px] placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <div>
          <label
            htmlFor="defaultBranch"
            className="block text-[12px] text-muted-foreground uppercase tracking-wider mb-2 font-medium"
          >
            Default branch (optional)
          </label>
          <input
            id="defaultBranch"
            type="text"
            placeholder="main"
            value={defaultBranch}
            onChange={(e) => setDefaultBranch(e.target.value)}
            className="w-full px-4 py-2.5 rounded-lg bg-background border border-input text-foreground text-[14px] placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <button
          type="submit"
          disabled={add.isPending || !fullName.trim()}
          className="w-full py-2.5 rounded-lg bg-primary text-primary-foreground font-semibold text-[14px] hover:opacity-90 disabled:opacity-50 disabled:pointer-events-none transition-opacity"
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
    { userId, pageSize: 100 },
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
      toast.success(
        "PR review created. Opening the review…",
      );
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
      <div className="rounded-xl border border-border bg-card p-6 mb-6">
        <h3 className="text-sm font-semibold text-foreground mb-1">Create a PR review</h3>
        <p className="text-[13px] text-muted-foreground">
          Add a pull request to track. If you select a repository, this review will automatically appear under that repo in &quot;All repositories&quot; so you can see all reviews per project.
        </p>
      </div>
      <form
        onSubmit={handleSubmit}
        className="p-6 rounded-xl border border-border bg-card space-y-5"
      >
        {repos.length > 0 && (
          <div>
            <label
              htmlFor="repositoryId"
              className="block text-[12px] text-muted-foreground uppercase tracking-wider mb-2 font-medium"
            >
              Repository (optional)
            </label>
            <select
              id="repositoryId"
              value={repositoryId}
              onChange={(e) => setRepositoryId(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg bg-background border border-input text-foreground text-[14px] focus:outline-none focus:ring-2 focus:ring-ring"
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
            htmlFor="prNumber"
            className="block text-[12px] text-muted-foreground uppercase tracking-wider mb-2 font-medium"
          >
            PR number *
          </label>
          <input
            id="prNumber"
            type="number"
            min={1}
            placeholder="42"
            value={prNumber}
            onChange={(e) => setPrNumber(e.target.value)}
            className="w-full px-4 py-2.5 rounded-lg bg-background border border-input text-foreground text-[14px] placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <div>
          <label
            htmlFor="prTitle"
            className="block text-[12px] text-muted-foreground uppercase tracking-wider mb-2 font-medium"
          >
            PR title (optional)
          </label>
          <input
            id="prTitle"
            type="text"
            placeholder="Fix login bug"
            value={prTitle}
            onChange={(e) => setPrTitle(e.target.value)}
            className="w-full px-4 py-2.5 rounded-lg bg-background border border-input text-foreground text-[14px] placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <div>
          <label
            htmlFor="prUrl"
            className="block text-[12px] text-muted-foreground uppercase tracking-wider mb-2 font-medium"
          >
            PR link (optional)
          </label>
          <input
            id="prUrl"
            type="url"
            placeholder="https://github.com/owner/repo/pull/42"
            value={prUrl}
            onChange={(e) => setPrUrl(e.target.value)}
            className="w-full px-4 py-2.5 rounded-lg bg-background border border-input text-foreground text-[14px] placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <button
          type="submit"
          disabled={create.isPending || !prNumber.trim()}
          className="w-full py-3 rounded-lg bg-primary text-primary-foreground font-semibold text-[14px] hover:opacity-90 disabled:opacity-50 disabled:pointer-events-none transition-opacity"
        >
          {create.isPending ? "Creating…" : "Create PR review"}
        </button>
      </form>
    </div>
  );
}

function ReviewDetailPanelSkeleton() {
  return (
    <div className="fixed inset-y-0 right-0 z-40 w-full max-w-2xl border-l border-border bg-card shadow-2xl flex flex-col overflow-hidden">
      <div className="shrink-0 flex items-center justify-between gap-4 p-4 border-b border-border bg-muted/30">
        <div className="flex-1 min-w-0 space-y-2">
          <div className="h-5 w-48 rounded-md bg-muted animate-pulse" />
          <div className="h-4 w-32 rounded bg-muted animate-pulse" />
        </div>
        <div className="h-9 w-9 rounded-lg bg-muted animate-pulse shrink-0" />
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        <div className="space-y-2">
          <div className="h-4 w-40 rounded bg-muted animate-pulse" />
          <div className="h-36 rounded-lg bg-muted/50 animate-pulse" />
          <div className="h-9 w-24 rounded-lg bg-muted animate-pulse" />
        </div>
        <div className="space-y-2">
          <div className="h-4 w-24 rounded bg-muted animate-pulse" />
          <div className="h-10 w-full rounded-lg bg-muted animate-pulse" />
        </div>
        <div className="space-y-2">
          <div className="h-4 w-36 rounded bg-muted animate-pulse" />
          <div className="h-48 rounded-lg bg-muted/30 animate-pulse" />
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
    onSuccess: () => {
      utils.prReview.getById.invalidate({ id: reviewId, userId });
      utils.prReview.list.invalidate();
      utils.prReview.listByRepositoryId.invalidate();
      utils.prReview.getAiReviewUsage.invalidate({ userId });
      utils.notification.list.invalidate();
      utils.notification.unreadCount.invalidate();
      toast.success("AI review completed.");
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
    <div className="fixed inset-y-0 right-0 z-40 w-full max-w-2xl border-l border-border bg-card shadow-2xl flex flex-col overflow-hidden">
      {/* Header */}
      <div className="shrink-0 flex items-center justify-between gap-4 p-4 border-b border-border bg-muted/30">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-lg font-semibold text-foreground truncate">
              PR #{review.prNumber}
              {review.prTitle ? ` — ${review.prTitle}` : ""}
            </h2>
            <span
              className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium ${
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
              href={review.prUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-primary hover:underline inline-flex items-center gap-1 mt-1"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              Open PR
            </a>
          )}
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={() => remove.mutate({ id: reviewId, userId })}
            disabled={remove.isPending}
            className="p-2 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors disabled:opacity-50"
            aria-label="Delete review"
            title="Delete PR review"
          >
            <Trash2 className="w-5 h-5" />
          </button>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Diff input */}
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <FileDiff className="w-4 h-4 text-primary shrink-0" />
            <h3 className="text-sm font-semibold text-foreground">
              Diff
            </h3>
          </div>
          <p className="text-[13px] text-muted-foreground">
            Paste your git diff or patch below, then save. Use &quot;Run AI review&quot; to analyze.
          </p>
          <textarea
            value={diffText}
            onChange={(e) => setDiffText(e.target.value)}
            placeholder="Paste git diff or patch content…"
            className="w-full h-40 px-3 py-2 rounded-lg bg-background border border-input text-foreground text-[13px] font-mono placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-y min-h-[120px]"
            spellCheck={false}
          />
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() =>
                updateDiff.mutate({ id: reviewId, userId, diffText })
              }
              disabled={updateDiff.isPending || diffText === (review.diffText ?? "")}
              className="px-4 py-2 rounded-lg bg-muted text-foreground text-sm font-medium hover:bg-muted/80 disabled:opacity-50 disabled:pointer-events-none transition-opacity"
            >
              {updateDiff.isPending ? "Saving…" : "Save diff"}
            </button>
            {diffText.trim() && (
              <div className="text-[12px] text-muted-foreground">
                Preview:
              </div>
            )}
          </div>
          {diffText.trim() && (
            <DiffViewer content={diffText} className="max-h-48 overflow-y-auto" />
          )}
        </section>

        {/* Run AI */}
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary shrink-0" />
            <h3 className="text-sm font-semibold text-foreground">
              AI review
            </h3>
          </div>
          <p className="text-[13px] text-muted-foreground">
            Run AI analysis on the diff. You’ll get a notification when it’s done.
          </p>
          {/* AI review limit */}
          <div className="rounded-lg border border-border bg-muted/20 p-3 space-y-2">
            <p className="text-[12px] font-medium text-foreground">
              AI review limit (optional)
            </p>
            <p className="text-[12px] text-muted-foreground">
              Set a limit (e.g. 5). After that many completed AI reviews, the button is disabled until you increase the limit or clear it.
            </p>
            <div className="flex flex-wrap items-center gap-2">
              <input
                type="number"
                min={1}
                max={1000}
                placeholder={aiUsage?.limit?.toString() ?? "No limit"}
                value={limitInput}
                onChange={(e) => setLimitInput(e.target.value)}
                className="w-20 px-2.5 py-1.5 rounded-md border border-input bg-background text-foreground text-[13px] focus:outline-none focus:ring-2 focus:ring-ring"
              />
              <button
                type="button"
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
                disabled={setLimit.isPending}
                className="px-3 py-1.5 rounded-md bg-muted text-foreground text-[13px] font-medium hover:bg-muted/80 disabled:opacity-50"
              >
                {setLimit.isPending ? "Saving…" : "Set limit"}
              </button>
              {aiUsage && aiUsage.limit != null && (
                <>
                  <span className="text-[12px] text-muted-foreground">
                    Used: <strong className="text-foreground">{aiUsage.used}</strong> / {aiUsage.limit}
                  </span>
                  <button
                    type="button"
                    onClick={() => setLimit.mutate({ userId, limit: null })}
                    disabled={setLimit.isPending}
                    className="text-[12px] text-muted-foreground hover:text-foreground hover:underline"
                  >
                    Clear limit
                  </button>
                </>
              )}
            </div>
          </div>
          {aiUsage && aiUsage.limit != null && aiUsage.used >= aiUsage.limit && (
            <p className="text-[12px] text-destructive">
              Limit reached. Increase the limit above to run more AI reviews.
            </p>
          )}
          <button
            type="button"
            onClick={() => runAi.mutate({ id: reviewId, userId })}
            disabled={
              runAi.isPending ||
              (aiUsage != null &&
                aiUsage.limit != null &&
                aiUsage.used >= aiUsage.limit)
            }
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 disabled:opacity-50 transition-opacity"
          >
            <Sparkles className="w-4 h-4" />
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
            <h3 className="text-sm font-semibold text-foreground">
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
