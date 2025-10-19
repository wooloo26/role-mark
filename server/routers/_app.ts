/**
 * Root tRPC router combining all feature routers
 */
import { createTRPCRouter } from "../trpc"
import { characterRouter } from "./character"
import { commentRouter } from "./comment"
import { resourceRouter } from "./resource"
import { staticTagRouter } from "./static-tag"
import { tagRouter } from "./tag"
import { userRouter } from "./user"
import { wikiRouter } from "./wiki"

export const appRouter = createTRPCRouter({
	character: characterRouter,
	resource: resourceRouter,
	wiki: wikiRouter,
	comment: commentRouter,
	user: userRouter,
	tag: tagRouter,
	staticTag: staticTagRouter,
})

// Export type definition of API
export type AppRouter = typeof appRouter

// Create server-side caller
export const createCaller = appRouter.createCaller
