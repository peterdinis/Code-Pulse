import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { prReview } from "~/server/db/schema";
import { eq, and } from "drizzle-orm";

const statusEnum = z.enum(["pending", "in_progress", "completed", "failed"]);

export const prReviewRouter = createTRPCRouter({
	list: publicProcedure
		.input(z.object({ userId: z.string().min(1) }))
		.query(async ({ ctx, input }) => {
			return ctx.db.query.prReview.findMany({
				where: eq(prReview.userId, input.userId),
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
});
