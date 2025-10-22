/**
 * tRPC HTTP handler for Next.js App Router
 */
import { fetchRequestHandler } from "@trpc/server/adapters/fetch"
import type { NextRequest } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
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
						console.error(`❌ tRPC failed on ${path ?? "<no-path>"}`, {
							path,
							error: error.message,
						})
					}
				: undefined,
	})

export { handler as GET, handler as POST }
