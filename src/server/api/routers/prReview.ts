import { and, count, eq, like, or, type SQL } from "drizzle-orm";
import { revalidateTag, unstable_cache } from "next/cache";
import { z } from "zod";
import { runAiReview } from "~/server/ai-review";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import {
	account,
	notification,
	prReview,
	repository,
	userSettings,
} from "~/server/db/schema";
import {
	createIssueComment,
	fetchPullRequestDiff,
	formatCodePulseComment,
	resolvePullRequestRef,
	updateIssueComment,
} from "~/server/github/post-pr-comment";

const statusEnum = z.enum(["pending", "in_progress", "completed", "failed"]);

const PAGE_SIZE_DEFAULT = 10;
const PAGE_SIZE_MAX = 50;

export const prReviewRouter = createTRPCRouter({
	getById: publicProcedure
		.input(z.object({ id: z.string().min(1), userId: z.string().min(1) }))
		.query(async ({ ctx, input }) => {
			const [row] = await ctx.db
				.select()
				.from(prReview)
				.where(
					and(eq(prReview.id, input.id), eq(prReview.userId, input.userId)),
				)
				.limit(1);
			return row ?? null;
		}),

	list: publicProcedure
		.input(
			z.object({
				userId: z.string().min(1),
				status: statusEnum.optional(),
				search: z.string().optional(),
				page: z.number().int().min(1).optional().default(1),
				pageSize: z
					.number()
					.int()
					.min(1)
					.max(PAGE_SIZE_MAX)
					.optional()
					.default(PAGE_SIZE_DEFAULT),
			}),
		)
		.query(async ({ ctx, input }) => {
			const cacheKey: string[] = [
				"pr-review-list",
				input.userId,
				input.status ?? "",
				input.search ?? "",
				String(input.page),
				String(input.pageSize),
			];

			return unstable_cache(
				async () => {
					const conditions: Parameters<typeof and>[0][] = [
						eq(prReview.userId, input.userId),
					];
					if (input.status) {
						conditions.push(eq(prReview.status, input.status));
					}
					if (input.search?.trim()) {
						const term = input.search.trim();
						const termLike = `%${term}%`;
						const num = Number.parseInt(term, 10);
						if (Number.isNaN(num)) {
							conditions.push(like(prReview.prTitle, termLike));
						} else {
							const searchOr = or(
								eq(prReview.prNumber, num),
								like(prReview.prTitle, termLike),
							);
							if (searchOr) conditions.push(searchOr);
						}
					}
					const whereClause =
						conditions.length > 1 ? and(...conditions) : conditions[0];

					const [totalResult] = await ctx.db
						.select({ count: count() })
						.from(prReview)
						.where(whereClause as SQL);

					const total = totalResult?.count ?? 0;
					const page = Math.max(1, input.page);
					const pageSize = Math.min(PAGE_SIZE_MAX, Math.max(1, input.pageSize));
					const totalPages = Math.max(1, Math.ceil(total / pageSize));
					const offset = (page - 1) * pageSize;

					const items = await ctx.db.query.prReview.findMany({
						where: whereClause as SQL,
						orderBy: (r, { desc }) => [desc(r.createdAt)],
						limit: pageSize,
						offset,
					});

					return {
						items,
						total,
						page,
						pageSize,
						totalPages,
					};
				},
				cacheKey,
				{ revalidate: 60, tags: ["pr-review-list"] },
			)();
		}),

	listByRepositoryId: publicProcedure
		.input(
			z.object({
				userId: z.string().min(1),
				repositoryId: z.string().min(1),
			}),
		)
		.query(async ({ ctx, input }) => {
			return ctx.db.query.prReview.findMany({
				where: and(
					eq(prReview.userId, input.userId),
					eq(prReview.repositoryId, input.repositoryId),
				),
				orderBy: (r, { desc }) => [desc(r.createdAt)],
			});
		}),

	create: publicProcedure
		.input(
			z.object({
				userId: z.string().min(1),
				repositoryId: z.string().optional(),
				prNumber: z.number().int().positive(),
				prUrl: z
					.string()
					.optional()
					.transform((v) => (v?.trim() ? v.trim() : undefined)),
				prTitle: z.string().optional(),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			revalidateTag("pr-review-list");
			const id = crypto.randomUUID();
			await ctx.db.insert(prReview).values({
				id,
				userId: input.userId,
				repositoryId: input.repositoryId ?? null,
				prNumber: input.prNumber,
				prUrl: input.prUrl ?? null,
				prTitle: input.prTitle ?? null,
				status: "pending",
			});
			return { id };
		}),

	remove: publicProcedure
		.input(z.object({ id: z.string().min(1), userId: z.string().min(1) }))
		.mutation(async ({ ctx, input }) => {
			revalidateTag("pr-review-list");
			await ctx.db
				.delete(prReview)
				.where(
					and(eq(prReview.id, input.id), eq(prReview.userId, input.userId)),
				);
			return { ok: true };
		}),

	updateStatus: publicProcedure
		.input(
			z.object({
				id: z.string().min(1),
				userId: z.string().min(1),
				status: statusEnum,
				summary: z.string().optional(),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			revalidateTag("pr-review-list");
			await ctx.db
				.update(prReview)
				.set({
					status: input.status,
					...(input.summary !== undefined && { summary: input.summary }),
				})
				.where(
					and(eq(prReview.id, input.id), eq(prReview.userId, input.userId)),
				);
			return { ok: true };
		}),

	updateDiff: publicProcedure
		.input(
			z.object({
				id: z.string().min(1),
				userId: z.string().min(1),
				diffText: z.string(),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			await ctx.db
				.update(prReview)
				.set({ diffText: input.diffText || null })
				.where(
					and(eq(prReview.id, input.id), eq(prReview.userId, input.userId)),
				);
			return { ok: true };
		}),

	getAiReviewUsage: publicProcedure
		.input(z.object({ userId: z.string().min(1) }))
		.query(async ({ ctx, input }) => {
			const [settings] = await ctx.db
				.select({
					aiReviewLimit: userSettings.aiReviewLimit,
					aiProvider: userSettings.aiProvider,
					openaiApiKey: userSettings.openaiApiKey,
					geminiApiKey: userSettings.geminiApiKey,
					postAiReviewToGitHub: userSettings.postAiReviewToGitHub,
				})
				.from(userSettings)
				.where(eq(userSettings.userId, input.userId))
				.limit(1);
			const [usedResult] = await ctx.db
				.select({ count: count() })
				.from(prReview)
				.where(
					and(
						eq(prReview.userId, input.userId),
						eq(prReview.status, "completed"),
					),
				);
			const limit = settings?.aiReviewLimit ?? null;
			const used = usedResult?.count ?? 0;
			const provider = settings?.aiProvider === "gemini" ? "gemini" : "openai";
			return {
				limit,
				used,
				provider,
				openaiConfigured: !!settings?.openaiApiKey?.trim(),
				geminiConfigured: !!settings?.geminiApiKey?.trim(),
				postAiReviewToGitHub: settings?.postAiReviewToGitHub ?? false,
			};
		}),

	setAiReviewLimit: publicProcedure
		.input(
			z.object({
				userId: z.string().min(1),
				limit: z.number().int().min(1).max(1000).nullable(),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			await ctx.db
				.insert(userSettings)
				.values({
					userId: input.userId,
					aiReviewLimit: input.limit,
				})
				.onConflictDoUpdate({
					target: userSettings.userId,
					set: { aiReviewLimit: input.limit },
				});
			return { ok: true };
		}),

	setAiReviewSettings: publicProcedure
		.input(
			z.object({
				userId: z.string().min(1),
				provider: z.enum(["openai", "gemini"]).optional(),
				openaiApiKey: z.string().nullable().optional(),
				geminiApiKey: z.string().nullable().optional(),
				postAiReviewToGitHub: z.boolean().optional(),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			const [existing] = await ctx.db
				.select()
				.from(userSettings)
				.where(eq(userSettings.userId, input.userId))
				.limit(1);

			const updates: Partial<{
				aiProvider: "openai" | "gemini";
				openaiApiKey: string | null;
				geminiApiKey: string | null;
				postAiReviewToGitHub: boolean;
			}> = {};
			if (input.provider !== undefined) updates.aiProvider = input.provider;
			if (input.openaiApiKey !== undefined)
				updates.openaiApiKey = input.openaiApiKey?.trim() || null;
			if (input.geminiApiKey !== undefined)
				updates.geminiApiKey = input.geminiApiKey?.trim() || null;
			if (input.postAiReviewToGitHub !== undefined)
				updates.postAiReviewToGitHub = input.postAiReviewToGitHub;

			if (Object.keys(updates).length === 0) return { ok: true };

			const merged = {
				userId: input.userId,
				aiReviewLimit: existing?.aiReviewLimit ?? null,
				aiProvider: updates.aiProvider ?? existing?.aiProvider ?? "openai",
				openaiApiKey: updates.openaiApiKey ?? existing?.openaiApiKey ?? null,
				geminiApiKey: updates.geminiApiKey ?? existing?.geminiApiKey ?? null,
				postAiReviewToGitHub:
					updates.postAiReviewToGitHub ??
					existing?.postAiReviewToGitHub ??
					false,
			};

			await ctx.db.insert(userSettings).values(merged).onConflictDoUpdate({
				target: userSettings.userId,
				set: updates,
			});
			return { ok: true };
		}),

	runAiReview: publicProcedure
		.input(
			z.object({
				id: z.string().min(1),
				userId: z.string().min(1),
				refreshFromGitHub: z.boolean().optional().default(true),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			revalidateTag("pr-review-list");
			const [review] = await ctx.db
				.select()
				.from(prReview)
				.where(
					and(eq(prReview.id, input.id), eq(prReview.userId, input.userId)),
				)
				.limit(1);
			if (!review) throw new Error("Review not found");

			const [settings] = await ctx.db
				.select({
					aiReviewLimit: userSettings.aiReviewLimit,
					aiProvider: userSettings.aiProvider,
					openaiApiKey: userSettings.openaiApiKey,
					geminiApiKey: userSettings.geminiApiKey,
					postAiReviewToGitHub: userSettings.postAiReviewToGitHub,
				})
				.from(userSettings)
				.where(eq(userSettings.userId, input.userId))
				.limit(1);
			const [usedResult] = await ctx.db
				.select({ count: count() })
				.from(prReview)
				.where(
					and(
						eq(prReview.userId, input.userId),
						eq(prReview.status, "completed"),
					),
				);
			const limit = settings?.aiReviewLimit ?? null;
			const used = usedResult?.count ?? 0;
			if (limit !== null && used >= limit) {
				throw new Error(
					`AI review limit reached (${used}/${limit}). Increase the limit to run more reviews.`,
				);
			}

			await ctx.db
				.update(prReview)
				.set({ status: "in_progress" })
				.where(
					and(eq(prReview.id, input.id), eq(prReview.userId, input.userId)),
				);

			const [ghAccount] = await ctx.db
				.select({ accessToken: account.accessToken })
				.from(account)
				.where(
					and(
						eq(account.userId, input.userId),
						eq(account.providerId, "github"),
					),
				)
				.limit(1);
			const githubToken = ghAccount?.accessToken?.trim() ?? null;

			let repoRow: { owner: string; name: string } | null = null;
			if (review.repositoryId) {
				const [r] = await ctx.db
					.select({
						owner: repository.owner,
						name: repository.name,
					})
					.from(repository)
					.where(eq(repository.id, review.repositoryId))
					.limit(1);
				if (r) repoRow = r;
			}

			const pullRequestRef = resolvePullRequestRef({
				prNumber: review.prNumber,
				repository: repoRow,
				prUrl: review.prUrl,
			});

			let diffText = review.diffText;
			let githubDiffFetched = false;
			if (input.refreshFromGitHub && pullRequestRef) {
				const diffResult = await fetchPullRequestDiff(pullRequestRef, githubToken);
				if (diffResult.ok) {
					diffText = diffResult.diff;
					githubDiffFetched = true;
					await ctx.db
						.update(prReview)
						.set({ diffText: diffResult.diff })
						.where(
							and(eq(prReview.id, input.id), eq(prReview.userId, input.userId)),
						);
				}
			}

			const provider = settings?.aiProvider === "gemini" ? "gemini" : "openai";
			const aiReviewText = await runAiReview(
				{
					prTitle: review.prTitle,
					prNumber: review.prNumber,
					diffText,
				},
				{
					provider,
					openaiApiKey: settings?.openaiApiKey ?? null,
					geminiApiKey: settings?.geminiApiKey ?? null,
				},
			);

			let nextGithubCommentId = review.githubCommentId ?? null;
			let githubSummaryPosted = false;

			if (settings?.postAiReviewToGitHub) {
				if (githubToken && pullRequestRef) {
					const body = formatCodePulseComment(aiReviewText);
					if (nextGithubCommentId) {
						const upd = await updateIssueComment(
							pullRequestRef,
							nextGithubCommentId,
							body,
							githubToken,
						);
						if (upd.ok) {
							nextGithubCommentId = upd.commentId;
							githubSummaryPosted = true;
						} else if (upd.error === "not_found" || upd.status === 404) {
							const created = await createIssueComment(
								pullRequestRef,
								body,
								githubToken,
							);
							if (created.ok) {
								nextGithubCommentId = created.commentId;
								githubSummaryPosted = true;
							}
						} else {
							console.error(
								"[CodePulse] GitHub comment update failed:",
								upd.error,
							);
						}
					} else {
						const created = await createIssueComment(
							pullRequestRef,
							body,
							githubToken,
						);
						if (created.ok) {
							nextGithubCommentId = created.commentId;
							githubSummaryPosted = true;
						} else {
							console.error(
								"[CodePulse] GitHub comment create failed:",
								created.error,
							);
						}
					}
				} else {
					console.warn(
						"[CodePulse] Skipping GitHub post: missing token or repo/PR context (add repo + PR link, and sign in with GitHub).",
					);
				}
			}

			await ctx.db
				.update(prReview)
				.set({
					status: "completed",
					aiReview: aiReviewText,
					summary: aiReviewText.slice(0, 500),
					githubCommentId: nextGithubCommentId,
				})
				.where(
					and(eq(prReview.id, input.id), eq(prReview.userId, input.userId)),
				);

			const notifId = crypto.randomUUID();
			await ctx.db.insert(notification).values({
				id: notifId,
				userId: input.userId,
				type: "ai_review_done",
				title: `AI review completed`,
				body: `PR #${review.prNumber}${review.prTitle ? `: ${review.prTitle}` : ""}`,
				relatedId: input.id,
			});

			return {
				ok: true,
				aiReview: aiReviewText,
				githubSummaryPosted,
				githubDiffFetched,
			};
		}),
});
