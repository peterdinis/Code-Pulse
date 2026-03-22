import { notificationRouter } from "~/server/api/routers/notification";
import { postRouter } from "~/server/api/routers/post";
import { prReviewRouter } from "~/server/api/routers/prReview";
import { repositoryRouter } from "~/server/api/routers/repository";
import { createCallerFactory, createTRPCRouter } from "~/server/api/trpc";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
	repository: repositoryRouter,
	prReview: prReviewRouter,
	notification: notificationRouter,
	post: postRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;

/**
 * Create a server-side caller for the tRPC API.
 * @example
 * const trpc = createCaller(createContext);
 * const res = await trpc.post.all();
 *       ^? Post[]
 */
export const createCaller = createCallerFactory(appRouter);
