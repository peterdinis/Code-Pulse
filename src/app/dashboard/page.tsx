"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useSession, signOut } from "~/lib/client";
import { api } from "~/trpc/react";
import {
  LayoutDashboard,
  LogOut,
  ArrowLeft,
  FolderGit2,
  GitPullRequest,
  PlusCircle,
  FileCheck,
  Trash2,
} from "lucide-react";

type DashboardSection = "repositories" | "reviews" | "include-repo" | "new-review";

export default function DashboardPage() {
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const [section, setSection] = useState<DashboardSection>("repositories");

  useEffect(() => {
    if (!isPending && !session?.user) {
      router.replace("/");
    }
  }, [session, isPending, router]);

  if (isPending) {
    return (
      <div className="min-h-screen bg-[#0a0c0f] flex items-center justify-center">
        <p className="text-[#6e7681] text-sm">Loading…</p>
      </div>
    );
  }

  if (!session?.user) {
    return null;
  }

  const userId = session.user.id;

  return (
    <div className="min-h-screen bg-[#0a0c0f] text-[#c9d1d9] font-mono antialiased flex">
      {/* Sidebar */}
      <aside className="w-[240px] shrink-0 border-r border-[#1e2733] bg-[#0f1218] flex flex-col">
        <div className="p-4 border-b border-[#1e2733]">
          <Link
            href="/"
            className="flex items-center gap-2 text-[13px] text-[#6e7681] hover:text-[#00e5a0] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Home
          </Link>
        </div>
        <nav className="p-2 flex-1">
          <p className="px-3 py-2 text-[10px] text-[#6e7681] uppercase tracking-widest">
            Dashboard
          </p>
          <button
            type="button"
            onClick={() => setSection("repositories")}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] transition-colors ${
              section === "repositories"
                ? "bg-[#00e5a0]/10 text-[#00e5a0]"
                : "text-[#c9d1d9] hover:bg-[#151b24]"
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
                ? "bg-[#00e5a0]/10 text-[#00e5a0]"
                : "text-[#c9d1d9] hover:bg-[#151b24]"
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
                ? "bg-[#00e5a0]/10 text-[#00e5a0]"
                : "text-[#c9d1d9] hover:bg-[#151b24]"
            }`}
          >
            <PlusCircle className="w-4 h-4 shrink-0" />
            Include repository
          </button>
          <button
            type="button"
            onClick={() => setSection("new-review")}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] transition-colors ${
              section === "new-review"
                ? "bg-[#00e5a0]/10 text-[#00e5a0]"
                : "text-[#c9d1d9] hover:bg-[#151b24]"
            }`}
          >
            <FileCheck className="w-4 h-4 shrink-0" />
            New PR review
          </button>
        </nav>
        <div className="p-2 border-t border-[#1e2733]">
          <span className="block px-3 py-2 text-[12px] text-[#6e7681] truncate">
            {session.user.email}
          </span>
          <button
            type="button"
            onClick={() => signOut()}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] text-[#6e7681] hover:text-[#ff7b7b] hover:bg-[#ff7b7b]/10 transition-colors"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            Sign out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-14 border-b border-[#1e2733] flex items-center justify-between px-5 md:px-10 bg-[#0a0c0f]/90 backdrop-blur-xl">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#151b24] border border-[#1e2733] flex items-center justify-center">
              <LayoutDashboard className="w-4 h-4 text-[#00e5a0]" />
            </div>
            <h1 className="font-sans font-bold text-lg text-white tracking-tight">
              {section === "repositories" && "Repositories"}
              {section === "reviews" && "PR Reviews"}
              {section === "include-repo" && "Include repository"}
              {section === "new-review" && "New PR review"}
            </h1>
          </div>
        </header>

        <main className="flex-1 overflow-auto p-5 md:p-10">
          {section === "repositories" && (
            <RepositoriesSection userId={userId} />
          )}
          {section === "reviews" && <ReviewsSection userId={userId} />}
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

function RepositoriesSection({ userId }: { userId: string }) {
  const { data: repos, isLoading } = api.repository.list.useQuery({ userId });
  const utils = api.useUtils();
  const remove = api.repository.remove.useMutation({
    onSuccess: () => utils.repository.list.invalidate(),
  });

  if (isLoading) {
    return (
      <p className="text-[#6e7681] text-sm">Loading repositories…</p>
    );
  }

  if (!repos?.length) {
    return (
      <div className="rounded-xl border border-[#1e2733] bg-[#0f1218] p-8 text-center">
        <FolderGit2 className="w-12 h-12 text-[#6e7681] mx-auto mb-3" />
        <p className="text-[#6e7681] text-sm mb-1">No repositories yet</p>
        <p className="text-[12px] text-[#6e7681]">
          Use &quot;Include repository&quot; to add one.
        </p>
      </div>
    );
  }

  return (
    <ul className="space-y-3">
      {repos.map((repo) => (
        <li
          key={repo.id}
          className="flex items-center justify-between gap-4 p-4 rounded-xl border border-[#1e2733] bg-[#0f1218]"
        >
          <div className="flex items-center gap-3 min-w-0">
            <FolderGit2 className="w-5 h-5 text-[#00e5a0] shrink-0" />
            <div className="min-w-0">
              <p className="text-[14px] font-medium text-white truncate">
                {repo.fullName}
              </p>
              {repo.defaultBranch && (
                <p className="text-[12px] text-[#6e7681]">
                  default: {repo.defaultBranch}
                </p>
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={() => remove.mutate({ id: repo.id, userId })}
            className="p-2 rounded-lg text-[#6e7681] hover:text-[#ff7b7b] hover:bg-[#ff7b7b]/10 transition-colors shrink-0"
            title="Remove repository"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </li>
      ))}
    </ul>
  );
}

function ReviewsSection({ userId }: { userId: string }) {
  const { data: reviews, isLoading } = api.prReview.list.useQuery({ userId });

  if (isLoading) {
    return <p className="text-[#6e7681] text-sm">Loading PR reviews…</p>;
  }

  if (!reviews?.length) {
    return (
      <div className="rounded-xl border border-[#1e2733] bg-[#0f1218] p-8 text-center">
        <GitPullRequest className="w-12 h-12 text-[#6e7681] mx-auto mb-3" />
        <p className="text-[#6e7681] text-sm mb-1">No PR reviews yet</p>
        <p className="text-[12px] text-[#6e7681]">
          Use &quot;New PR review&quot; to create one.
        </p>
      </div>
    );
  }

  const statusColors: Record<string, string> = {
    pending: "text-[#f5a623]",
    in_progress: "text-[#00e5a0]",
    completed: "text-[#00e5a0]",
    failed: "text-[#ff7b7b]",
  };

  return (
    <ul className="space-y-3">
      {reviews.map((review) => (
        <li
          key={review.id}
          className="p-4 rounded-xl border border-[#1e2733] bg-[#0f1218]"
        >
          <div className="flex items-center gap-3 flex-wrap">
            <GitPullRequest className="w-5 h-5 text-[#00e5a0] shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="text-[14px] font-medium text-white">
                #{review.prNumber}
                {review.prTitle ? ` — ${review.prTitle}` : ""}
              </p>
              {review.prUrl && (
                <a
                  href={review.prUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[12px] text-[#00e5a0] hover:underline truncate block"
                >
                  {review.prUrl}
                </a>
              )}
            </div>
            <span
              className={`text-[12px] font-medium uppercase tracking-wider ${
                statusColors[review.status] ?? "text-[#6e7681]"
              }`}
            >
              {review.status.replace("_", " ")}
            </span>
          </div>
          {review.summary && (
            <p className="mt-2 text-[13px] text-[#6e7681] pl-8">
              {review.summary}
            </p>
          )}
        </li>
      ))}
    </ul>
  );
}

function IncludeRepositorySection({ userId }: { userId: string }) {
  const [fullName, setFullName] = useState("");
  const [defaultBranch, setDefaultBranch] = useState("main");
  const utils = api.useUtils();
  const add = api.repository.add.useMutation({
    onSuccess: () => {
      utils.repository.list.invalidate();
      setFullName("");
    },
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
      defaultBranch: defaultBranch.trim() || undefined,
    });
  };

  return (
    <div className="max-w-md">
      <form
        onSubmit={handleSubmit}
        className="p-6 rounded-xl border border-[#1e2733] bg-[#0f1218] space-y-4"
      >
        <div>
          <label
            htmlFor="fullName"
            className="block text-[12px] text-[#6e7681] uppercase tracking-wider mb-2"
          >
            Repository (owner/name)
          </label>
          <input
            id="fullName"
            type="text"
            placeholder="owner/repo"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="w-full px-4 py-2.5 rounded-lg bg-[#0a0c0f] border border-[#1e2733] text-[#c9d1d9] text-[14px] placeholder:text-[#6e7681] focus:outline-none focus:border-[#00e5a0]"
          />
        </div>
        <div>
          <label
            htmlFor="defaultBranch"
            className="block text-[12px] text-[#6e7681] uppercase tracking-wider mb-2"
          >
            Default branch (optional)
          </label>
          <input
            id="defaultBranch"
            type="text"
            placeholder="main"
            value={defaultBranch}
            onChange={(e) => setDefaultBranch(e.target.value)}
            className="w-full px-4 py-2.5 rounded-lg bg-[#0a0c0f] border border-[#1e2733] text-[#c9d1d9] text-[14px] placeholder:text-[#6e7681] focus:outline-none focus:border-[#00e5a0]"
          />
        </div>
        <button
          type="submit"
          disabled={add.isPending || !fullName.trim()}
          className="w-full py-2.5 rounded-lg bg-[#00e5a0] text-[#0a0c0f] font-semibold text-[14px] hover:bg-[#00e5a0]/90 disabled:opacity-50 disabled:pointer-events-none transition-colors"
        >
          {add.isPending ? "Adding…" : "Include repository"}
        </button>
        {add.isError && (
          <p className="text-[13px] text-[#ff7b7b]">
            {add.error.message}
          </p>
        )}
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
      utils.prReview.list.invalidate();
      setPrNumber("");
      setPrUrl("");
      setPrTitle("");
    },
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
    <div className="max-w-md">
      <form
        onSubmit={handleSubmit}
        className="p-6 rounded-xl border border-[#1e2733] bg-[#0f1218] space-y-4"
      >
        {repos && repos.length > 0 && (
          <div>
            <label
              htmlFor="repositoryId"
              className="block text-[12px] text-[#6e7681] uppercase tracking-wider mb-2"
            >
              Repository (optional)
            </label>
            <select
              id="repositoryId"
              value={repositoryId}
              onChange={(e) => setRepositoryId(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg bg-[#0a0c0f] border border-[#1e2733] text-[#c9d1d9] text-[14px] focus:outline-none focus:border-[#00e5a0]"
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
            className="block text-[12px] text-[#6e7681] uppercase tracking-wider mb-2"
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
            className="w-full px-4 py-2.5 rounded-lg bg-[#0a0c0f] border border-[#1e2733] text-[#c9d1d9] text-[14px] placeholder:text-[#6e7681] focus:outline-none focus:border-[#00e5a0]"
          />
        </div>
        <div>
          <label
            htmlFor="prTitle"
            className="block text-[12px] text-[#6e7681] uppercase tracking-wider mb-2"
          >
            PR title (optional)
          </label>
          <input
            id="prTitle"
            type="text"
            placeholder="Fix login bug"
            value={prTitle}
            onChange={(e) => setPrTitle(e.target.value)}
            className="w-full px-4 py-2.5 rounded-lg bg-[#0a0c0f] border border-[#1e2733] text-[#c9d1d9] text-[14px] placeholder:text-[#6e7681] focus:outline-none focus:border-[#00e5a0]"
          />
        </div>
        <div>
          <label
            htmlFor="prUrl"
            className="block text-[12px] text-[#6e7681] uppercase tracking-wider mb-2"
          >
            PR URL (optional)
          </label>
          <input
            id="prUrl"
            type="url"
            placeholder="https://github.com/owner/repo/pull/42"
            value={prUrl}
            onChange={(e) => setPrUrl(e.target.value)}
            className="w-full px-4 py-2.5 rounded-lg bg-[#0a0c0f] border border-[#1e2733] text-[#c9d1d9] text-[14px] placeholder:text-[#6e7681] focus:outline-none focus:border-[#00e5a0]"
          />
        </div>
        <button
          type="submit"
          disabled={create.isPending || !prNumber.trim()}
          className="w-full py-2.5 rounded-lg bg-[#00e5a0] text-[#0a0c0f] font-semibold text-[14px] hover:bg-[#00e5a0]/90 disabled:opacity-50 disabled:pointer-events-none transition-colors"
        >
          {create.isPending ? "Creating…" : "Create PR review"}
        </button>
        {create.isError && (
          <p className="text-[13px] text-[#ff7b7b]">
            {create.error.message}
          </p>
        )}
      </form>
    </div>
  );
}
