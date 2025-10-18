/**
 * Root tRPC router combining all feature routers
 */
import { createTRPCRouter } from "../trpc";
import { characterRouter } from "./character";
import { resourceRouter } from "./resource";
import { wikiRouter } from "./wiki";
import { commentRouter } from "./comment";
import { userRouter } from "./user";

export const appRouter = createTRPCRouter({
	character: characterRouter,
	resource: resourceRouter,
	wiki: wikiRouter,
	comment: commentRouter,
	user: userRouter,
});

// Export type definition of API
export type AppRouter = typeof appRouter;

// Create server-side caller
export const createCaller = appRouter.createCaller;
