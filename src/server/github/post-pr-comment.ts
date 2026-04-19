/**
 * Post or update the AI review as a GitHub PR conversation comment (Issues API).
 * @see https://docs.github.com/en/rest/issues/comments
 */

const GITHUB_API = "https://api.github.com";
const MAX_BODY = 65_000;

export type GithubRepoRef = {
	owner: string;
	repo: string;
	prNumber: number;
};

/** Parse https://github.com/owner/repo/pull/123 */
export function parseGithubPrUrl(url: string): GithubRepoRef | null {
	try {
		const u = new URL(url.trim());
		if (u.hostname !== "github.com" && u.hostname !== "www.github.com") {
			return null;
		}
		const parts = u.pathname.split("/").filter(Boolean);
		if (parts.length < 4 || parts[2] !== "pull") return null;
		const prNumber = Number.parseInt(parts[3] ?? "", 10);
		if (Number.isNaN(prNumber) || prNumber < 1) return null;
		return {
			owner: parts[0] ?? "",
			repo: parts[1] ?? "",
			prNumber,
		};
	} catch {
		return null;
	}
}

function truncateBody(text: string): string {
	if (text.length <= MAX_BODY) return text;
	return `${text.slice(0, MAX_BODY - 20)}\n\n…(truncated)`;
}

export function formatCodePulseComment(aiMarkdown: string): string {
	const body = aiMarkdown.trim();
	return `### CodePulse AI review\n\n${body}`;
}

type CreateResult =
	| { ok: true; commentId: string; htmlUrl: string }
	| { ok: false; error: string; status?: number };

async function githubJson(
	url: string,
	accessToken: string,
	init: RequestInit,
): Promise<{ ok: boolean; status: number; data: unknown }> {
	const res = await fetch(url, {
		...init,
		headers: {
			Authorization: `Bearer ${accessToken}`,
			Accept: "application/vnd.github+json",
			"X-GitHub-Api-Version": "2022-11-28",
			...(init.headers as Record<string, string>),
		},
	});
	const text = await res.text();
	let data: unknown = null;
	try {
		data = text ? JSON.parse(text) : null;
	} catch {
		data = { raw: text };
	}
	return { ok: res.ok, status: res.status, data };
}

export async function createIssueComment(
	ref: GithubRepoRef,
	body: string,
	accessToken: string,
): Promise<CreateResult> {
	const url = `${GITHUB_API}/repos/${ref.owner}/${ref.repo}/issues/${ref.prNumber}/comments`;
	const { ok, status, data } = await githubJson(url, accessToken, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ body: truncateBody(body) }),
	});
	if (!ok || !data || typeof data !== "object") {
		const msg =
			typeof data === "object" &&
			data &&
			"message" in data &&
			typeof (data as { message?: string }).message === "string"
				? (data as { message: string }).message
				: `GitHub API error (${status})`;
		return { ok: false, error: msg, status };
	}
	const id = String((data as { id?: number }).id ?? "");
	const htmlUrl = String((data as { html_url?: string }).html_url ?? "");
	if (!id)
		return { ok: false, error: "Missing comment id from GitHub", status };
	return { ok: true, commentId: id, htmlUrl };
}

/**
 * Resolve owner/repo for the PR from linked repository row and/or PR URL.
 */
export function resolvePullRequestRef(params: {
	prNumber: number;
	repository: { owner: string; name: string } | null;
	prUrl: string | null;
}): GithubRepoRef | null {
	if (params.repository?.owner && params.repository?.name) {
		return {
			owner: params.repository.owner,
			repo: params.repository.name,
			prNumber: params.prNumber,
		};
	}
	if (params.prUrl) {
		const parsed = parseGithubPrUrl(params.prUrl);
		if (!parsed) return null;
		return {
			owner: parsed.owner,
			repo: parsed.repo,
			prNumber: params.prNumber,
		};
	}
	return null;
}

export async function updateIssueComment(
	ref: GithubRepoRef,
	commentId: string,
	body: string,
	accessToken: string,
): Promise<CreateResult> {
	const url = `${GITHUB_API}/repos/${ref.owner}/${ref.repo}/issues/comments/${commentId}`;
	const { ok, status, data } = await githubJson(url, accessToken, {
		method: "PATCH",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ body: truncateBody(body) }),
	});
	if (status === 404) {
		return { ok: false, error: "not_found", status };
	}
	if (!ok || !data || typeof data !== "object") {
		const msg =
			typeof data === "object" &&
			data &&
			"message" in data &&
			typeof (data as { message?: string }).message === "string"
				? (data as { message: string }).message
				: `GitHub API error (${status})`;
		return { ok: false, error: msg, status };
	}
	const id = String((data as { id?: number }).id ?? commentId);
	const htmlUrl = String((data as { html_url?: string }).html_url ?? "");
	return { ok: true, commentId: id, htmlUrl };
}
