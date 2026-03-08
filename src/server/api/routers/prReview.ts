import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { prReview, notification } from "~/server/db/schema";
import { eq, and } from "drizzle-orm";
import { runAiReview } from "~/server/ai-review";

const statusEnum = z.enum(["pending", "in_progress", "completed", "failed"]);

export const prReviewRouter = createTRPCRouter({
	getById: publicProcedure
		.input(z.object({ id: z.string().min(1), userId: z.string().min(1) }))
		.query(async ({ ctx, input }) => {
			const [row] = await ctx.db
				.select()
				.from(prReview)
				.where(
					and(
						eq(prReview.id, input.id),
						eq(prReview.userId, input.userId)
					)
				)
				.limit(1);
			return row ?? null;
		}),

	list: publicProcedure
		.input(z.object({ userId: z.string().min(1) }))
		.query(async ({ ctx, input }) => {
			return ctx.db.query.prReview.findMany({
				where: eq(prReview.userId, input.userId),
				orderBy: (r, { desc }) => [desc(r.createdAt)],
			});
		}),

	listByRepositoryId: publicProcedure
		.input(
			z.object({
				userId: z.string().min(1),
				repositoryId: z.string().min(1),
			})
		)
		.query(async ({ ctx, input }) => {
			return ctx.db.query.prReview.findMany({
				where: and(
					eq(prReview.userId, input.userId),
					eq(prReview.repositoryId, input.repositoryId)
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
				prUrl: z.string().url().optional(),
				prTitle: z.string().optional(),
			})
		)
		.mutation(async ({ ctx, input }) => {
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

	updateStatus: publicProcedure
		.input(
			z.object({
				id: z.string().min(1),
				userId: z.string().min(1),
				status: statusEnum,
				summary: z.string().optional(),
			})
		)
		.mutation(async ({ ctx, input }) => {
			await ctx.db
				.update(prReview)
				.set({
					status: input.status,
					...(input.summary !== undefined && { summary: input.summary }),
				})
				.where(
					and(
						eq(prReview.id, input.id),
						eq(prReview.userId, input.userId)
					)
				);
			return { ok: true };
		}),

	updateDiff: publicProcedure
		.input(
			z.object({
				id: z.string().min(1),
				userId: z.string().min(1),
				diffText: z.string(),
			})
		)
		.mutation(async ({ ctx, input }) => {
			await ctx.db
				.update(prReview)
				.set({ diffText: input.diffText || null })
				.where(
					and(
						eq(prReview.id, input.id),
						eq(prReview.userId, input.userId)
					)
				);
			return { ok: true };
		}),

	runAiReview: publicProcedure
		.input(z.object({ id: z.string().min(1), userId: z.string().min(1) }))
		.mutation(async ({ ctx, input }) => {
			const [review] = await ctx.db
				.select()
				.from(prReview)
				.where(
					and(
						eq(prReview.id, input.id),
						eq(prReview.userId, input.userId)
					)
				)
				.limit(1);
			if (!review) throw new Error("Review not found");

			await ctx.db
				.update(prReview)
				.set({ status: "in_progress" })
				.where(
					and(
						eq(prReview.id, input.id),
						eq(prReview.userId, input.userId)
					)
				);

			const aiReviewText = await runAiReview({
				prTitle: review.prTitle,
				prNumber: review.prNumber,
				diffText: review.diffText,
			});

			await ctx.db
				.update(prReview)
				.set({
					status: "completed",
					aiReview: aiReviewText,
					summary: aiReviewText.slice(0, 500),
				})
				.where(
					and(
						eq(prReview.id, input.id),
						eq(prReview.userId, input.userId)
					)
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

			return { ok: true, aiReview: aiReviewText };
		}),
});
