/**
 * tRPC server-side caller for use in Server Components and Server Actions
 */
import "server-only"
import { getServerSession } from "next-auth"
import { cache } from "react"
import { authOptions } from "@/lib/auth"
import { createCaller } from "@/server/routers/_app"
import { createTRPCContext } from "@/server/trpc"

/**
 * Create a server-side caller
 * Can be used in Server Components and Server Actions
 */
export const createContext = cache(async () => {
	const session = await getServerSession(authOptions)
	return createTRPCContext({
		headers: new Headers(),
		session,
	})
})

export const api = async () => createCaller(await createContext())
