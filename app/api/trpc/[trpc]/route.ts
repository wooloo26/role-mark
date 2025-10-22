/**
 * tRPC HTTP handler for Next.js App Router
 */
import { fetchRequestHandler } from "@trpc/server/adapters/fetch"
import type { NextRequest } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/server/auth"
import { logger } from "@/server/logger"
import { appRouter } from "@/server/routers/_app"
import { createTRPCContext } from "@/server/trpc"

const handler = (req: NextRequest) =>
	fetchRequestHandler({
		endpoint: "/api/trpc",
		req,
		router: appRouter,
		createContext: async () => {
			const session = await getServerSession(authOptions)
			return createTRPCContext({
				headers: req.headers,
				session,
			})
		},
		onError:
			process.env.NODE_ENV === "development"
				? ({ path, error }) => {
						logger.error(
							{ path, error: error.message },
							`❌ tRPC failed on ${path ?? "<no-path>"}`,
						)
					}
				: undefined,
	})

export { handler as GET, handler as POST }
