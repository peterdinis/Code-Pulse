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
} from "lucide-react";
import { ThemeToggle } from "~/components/ThemeToggle";
import { NotificationBell } from "~/components/NotificationBell";

type DashboardSection = "repositories" | "reviews" | "include-repo" | "new-review";

export default function DashboardPage() {
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const [section, setSection] = useState<DashboardSection>("repositories");
  const [selectedReviewId, setSelectedReviewId] = useState<string | null>(null);

  useEffect(() => {
    if (!isPending && !session?.user) {
      router.replace("/");
    }
  }, [session, isPending, router]);

  if (isPending) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground text-sm">Loading…</p>
      </div>
    );
  }

  if (!session?.user) {
    return null;
  }

  const userId = session.user.id;

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
              onSelectReview={setSelectedReviewId}
            />
          )}
          {section === "include-repo" && (
            <IncludeRepositorySection userId={userId} />
          )}
          {section === "new-review" && (
            <NewReviewSection userId={userId} />
          )}
        </main>
      </div>
    </div>
  );
}

function RepositoriesSection({
  userId,
  onSelectReview,
}: {
  userId: string;
  onSelectReview: (id: string) => void;
}) {
  const { data: repos, isLoading } = api.repository.list.useQuery({ userId });
  const utils = api.useUtils();
  const remove = api.repository.remove.useMutation({
    onSuccess: () => {
      utils.repository.list.invalidate();
      toast.success("Repository removed");
    },
  });

  if (isLoading) {
    return (
      <p className="text-muted-foreground text-sm">Loading repositories…</p>
    );
  }

  if (!repos?.length) {
    return (
      <div className="rounded-xl border border-border bg-card p-10 text-center">
        <FolderGit2 className="w-14 h-14 text-muted-foreground/60 mx-auto mb-4" />
        <p className="text-muted-foreground font-medium mb-1">No repositories yet</p>
        <p className="text-sm text-muted-foreground">
          Add a repository in &quot;Add repository&quot; to save and view your projects.
        </p>
      </div>
    );
  }

  return (
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
                className="p-2 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors shrink-0"
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
            />
          </li>
        );
      })}
    </ul>
  );
}

function RepoReviews({
  userId,
  repositoryId,
  repoName,
  onSelectReview,
}: {
  userId: string;
  repositoryId: string;
  repoName: string;
  onSelectReview: (id: string) => void;
}) {
  const { data: reviews, isLoading } = api.prReview.listByRepositoryId.useQuery({
    userId,
    repositoryId,
  });

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
            <ReviewCard key={r.id} review={r} onView={() => onSelectReview(r.id)} />
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
}: {
  review: ReviewRecord;
  onView?: () => void;
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
        {onView && (
          <button
            type="button"
            onClick={onView}
            className="mt-2 text-[12px] text-primary font-medium hover:underline"
          >
            View diff & AI review →
          </button>
        )}
      </div>
    </div>
  );
}

function ReviewsSection({
  userId,
  onSelectReview,
}: {
  userId: string;
  onSelectReview: (id: string) => void;
}) {
  const { data: reviews, isLoading } = api.prReview.list.useQuery({ userId });

  if (isLoading) {
    return <p className="text-muted-foreground text-sm">Loading PR reviews…</p>;
  }

  if (!reviews?.length) {
    return (
      <div className="rounded-xl border border-border bg-card p-10 text-center">
        <GitPullRequest className="w-14 h-14 text-muted-foreground/60 mx-auto mb-4" />
        <p className="text-muted-foreground font-medium mb-1">No PR reviews yet</p>
        <p className="text-sm text-muted-foreground">
          Create one in &quot;New PR review&quot;. If you pick a repository, it will show under that repo too.
        </p>
      </div>
    );
  }

  return (
    <ul className="space-y-3">
      {reviews.map((review) => (
        <li key={review.id}>
          <ReviewCard review={review} onView={() => onSelectReview(review.id)} />
        </li>
      ))}
    </ul>
  );
}

function IncludeRepositorySection({ userId }: { userId: string }) {
  const [fullName, setFullName] = useState("");
  const [url, setUrl] = useState("");
  const [defaultBranch, setDefaultBranch] = useState("main");
  const utils = api.useUtils();
  const add = api.repository.add.useMutation({
    onSuccess: () => {
      utils.repository.list.invalidate();
      setFullName("");
      setUrl("");
      toast.success("Repository added. You can view it in the list.");
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

function NewReviewSection({ userId }: { userId: string }) {
  const { data: repos } = api.repository.list.useQuery({ userId });
  const [prNumber, setPrNumber] = useState("");
  const [prUrl, setPrUrl] = useState("");
  const [prTitle, setPrTitle] = useState("");
  const [repositoryId, setRepositoryId] = useState("");
  const utils = api.useUtils();
  const create = api.prReview.create.useMutation({
    onSuccess: () => {
      utils.prReview.invalidate();
      setPrNumber("");
      setPrUrl("");
      setPrTitle("");
      toast.success("PR review created. It will appear in All PR reviews and under the chosen repository.");
    },
    onError: (err) => toast.error(err.message),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseInt(prNumber, 10);
    if (Number.isNaN(num) || num < 1) return;
    create.mutate({
      userId,
      repositoryId: repositoryId || undefined,
      prNumber: num,
      prUrl: prUrl.trim() || undefined,
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
        {repos && repos.length > 0 && (
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
    { enabled: !!reviewId }
  );
  const utils = api.useUtils();
  const [diffText, setDiffText] = useState("");

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
      utils.notification.list.invalidate();
      utils.notification.unreadCount.invalidate();
      toast.success("AI review completed. Check notifications.");
    },
    onError: (e) => toast.error(e.message),
  });

  useEffect(() => {
    if (review?.diffText != null) setDiffText(review.diffText ?? "");
  }, [review?.diffText]);

  if (isLoading || !review) {
    return (
      <div className="fixed inset-0 z-40 flex items-center justify-center bg-background/80 backdrop-blur-sm">
        <p className="text-muted-foreground text-sm">Loading review…</p>
      </div>
    );
  }

  return (
    <div className="fixed inset-y-0 right-0 z-40 w-full max-w-2xl border-l border-border bg-card shadow-2xl flex flex-col overflow-hidden">
      <div className="shrink-0 flex items-center justify-between gap-4 p-4 border-b border-border bg-muted/30">
        <div className="min-w-0">
          <h2 className="text-lg font-semibold text-foreground truncate">
            PR #{review.prNumber}
            {review.prTitle ? ` — ${review.prTitle}` : ""}
          </h2>
          {review.prUrl && (
            <a
              href={review.prUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-primary hover:underline inline-flex items-center gap-1"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              Open PR
            </a>
          )}
        </div>
        <button
          type="button"
          onClick={onClose}
          className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors shrink-0"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        <section>
          <div className="flex items-center gap-2 mb-2">
            <FileDiff className="w-4 h-4 text-primary" />
            <h3 className="text-sm font-semibold text-foreground">
              Diff (paste your changes here)
            </h3>
          </div>
          <textarea
            value={diffText}
            onChange={(e) => setDiffText(e.target.value)}
            placeholder="Paste git diff or patch content…"
            className="w-full h-40 px-3 py-2 rounded-lg bg-background border border-input text-foreground text-[13px] font-mono placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-y min-h-[120px]"
            spellCheck={false}
          />
          <button
            type="button"
            onClick={() =>
              updateDiff.mutate({ id: reviewId, userId, diffText })
            }
            disabled={updateDiff.isPending}
            className="mt-2 px-4 py-2 rounded-lg bg-muted text-foreground text-sm font-medium hover:bg-muted/80 disabled:opacity-50"
          >
            {updateDiff.isPending ? "Saving…" : "Save diff"}
          </button>
        </section>

        <section>
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-4 h-4 text-primary" />
            <h3 className="text-sm font-semibold text-foreground">
              AI review
            </h3>
          </div>
          <p className="text-[13px] text-muted-foreground mb-2">
            Run AI analysis on the diff above. When finished, you’ll get a
            notification.
          </p>
          <button
            type="button"
            onClick={() => runAi.mutate({ id: reviewId, userId })}
            disabled={runAi.isPending}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 disabled:opacity-50"
          >
            <Sparkles className="w-4 h-4" />
            {runAi.isPending ? "Running AI review…" : "Run AI review"}
          </button>
        </section>

        {review.aiReview && (
          <section>
            <h3 className="text-sm font-semibold text-foreground mb-2">
              AI review result
            </h3>
            <div className="rounded-lg border border-border bg-muted/20 p-4">
              <pre className="text-[13px] text-foreground whitespace-pre-wrap font-sans leading-relaxed">
                {review.aiReview}
              </pre>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
