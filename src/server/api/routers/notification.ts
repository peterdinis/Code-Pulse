import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { notification } from "~/server/db/schema";
import { eq, and, isNull } from "drizzle-orm";

export const notificationRouter = createTRPCRouter({
	list: publicProcedure
		.input(z.object({ userId: z.string().min(1), unreadOnly: z.boolean().optional() }))
		.query(async ({ ctx, input }) => {
			return ctx.db.query.notification.findMany({
				where: input.unreadOnly
					? and(eq(notification.userId, input.userId), isNull(notification.readAt))
					: eq(notification.userId, input.userId),
				orderBy: (n, { desc }) => [desc(n.createdAt)],
			});
		}),

	unreadCount: publicProcedure
		.input(z.object({ userId: z.string().min(1) }))
		.query(async ({ ctx, input }) => {
			const list = await ctx.db.query.notification.findMany({
				where: and(
					eq(notification.userId, input.userId),
					isNull(notification.readAt)
				),
				columns: { id: true },
			});
			return list.length;
		}),

	markRead: publicProcedure
		.input(z.object({ id: z.string().min(1), userId: z.string().min(1) }))
		.mutation(async ({ ctx, input }) => {
			await ctx.db
				.update(notification)
				.set({ readAt: new Date() })
				.where(
					and(
						eq(notification.id, input.id),
						eq(notification.userId, input.userId)
					)
				);
			return { ok: true };
		}),

	markAllRead: publicProcedure
		.input(z.object({ userId: z.string().min(1) }))
		.mutation(async ({ ctx, input }) => {
			await ctx.db
				.update(notification)
				.set({ readAt: new Date() })
				.where(eq(notification.userId, input.userId));
			return { ok: true };
		}),
});
