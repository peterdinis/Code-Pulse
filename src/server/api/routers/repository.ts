import { and, count, eq, like } from "drizzle-orm";
import { revalidateTag, unstable_cache } from "next/cache";
import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { repository } from "~/server/db/schema";

const idSchema = z.string().min(1);

const PAGE_SIZE_DEFAULT = 8;
const PAGE_SIZE_MAX = 50;

export const repositoryRouter = createTRPCRouter({
	list: publicProcedure
		.input(
			z.object({
				userId: z.string().min(1),
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
				"repository-list",
				input.userId,
				input.search ?? "",
				String(input.page),
				String(input.pageSize),
			];

			return unstable_cache(
				async () => {
					const conditions = [eq(repository.userId, input.userId)];
					if (input.search?.trim()) {
						const term = `%${input.search.trim()}%`;
						conditions.push(like(repository.fullName, term));
					}
					const whereClause =
						conditions.length > 1 ? and(...conditions) : conditions[0];

					const [totalResult] = await ctx.db
						.select({ count: count() })
						.from(repository)
						.where(whereClause);

					const total = totalResult?.count ?? 0;
					const page = Math.max(1, input.page);
					const pageSize = Math.min(PAGE_SIZE_MAX, Math.max(1, input.pageSize));
					const totalPages = Math.max(1, Math.ceil(total / pageSize));
					const offset = (page - 1) * pageSize;

					const items = await ctx.db.query.repository.findMany({
						where: whereClause,
						orderBy: (repo, { desc }) => [desc(repo.createdAt)],
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
				{ revalidate: 60, tags: ["repository-list"] },
			)();
		}),

	add: publicProcedure
		.input(
			z.object({
				userId: z.string().min(1),
				fullName: z.string().min(1),
				owner: z.string().min(1),
				name: z.string().min(1),
				url: z.string().url().optional().or(z.literal("")),
				githubRepoId: z.string().optional(),
				defaultBranch: z.string().optional(),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			revalidateTag("repository-list");
			const id = crypto.randomUUID();
			await ctx.db.insert(repository).values({
				id,
				userId: input.userId,
				fullName: input.fullName,
				owner: input.owner,
				name: input.name,
				url: (input.url && input.url.length > 0 ? input.url : null) ?? null,
				githubRepoId: input.githubRepoId ?? null,
				defaultBranch: input.defaultBranch ?? null,
			});
			return { id };
		}),

	remove: publicProcedure
		.input(z.object({ id: idSchema, userId: z.string().min(1) }))
		.mutation(async ({ ctx, input }) => {
			revalidateTag("repository-list");
			await ctx.db
				.delete(repository)
				.where(
					and(eq(repository.id, input.id), eq(repository.userId, input.userId)),
				);
			return { ok: true };
		}),
});
