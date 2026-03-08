import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { repository } from "~/server/db/schema";
import { eq, and } from "drizzle-orm";

const idSchema = z.string().min(1);

export const repositoryRouter = createTRPCRouter({
	list: publicProcedure
		.input(z.object({ userId: z.string().min(1) }))
		.query(async ({ ctx, input }) => {
			return ctx.db.query.repository.findMany({
				where: eq(repository.userId, input.userId),
				orderBy: (repo, { desc }) => [desc(repo.createdAt)],
			});
		}),

	add: publicProcedure
		.input(
			z.object({
				userId: z.string().min(1),
				fullName: z.string().min(1),
				owner: z.string().min(1),
				name: z.string().min(1),
				githubRepoId: z.string().optional(),
				defaultBranch: z.string().optional(),
			})
		)
		.mutation(async ({ ctx, input }) => {
			const id = crypto.randomUUID();
			await ctx.db.insert(repository).values({
				id,
				userId: input.userId,
				fullName: input.fullName,
				owner: input.owner,
				name: input.name,
				githubRepoId: input.githubRepoId ?? null,
				defaultBranch: input.defaultBranch ?? null,
			});
			return { id };
		}),

	remove: publicProcedure
		.input(z.object({ id: idSchema, userId: z.string().min(1) }))
		.mutation(async ({ ctx, input }) => {
			await ctx.db
				.delete(repository)
				.where(
					and(eq(repository.id, input.id), eq(repository.userId, input.userId))
				);
			return { ok: true };
		}),
});
