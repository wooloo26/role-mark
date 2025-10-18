/**
 * tRPC initialization and context setup
 */
import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import { ZodError } from "zod";
import type { Session } from "next-auth";
import { prisma } from "@/lib/prisma";

/**
 * 1. CONTEXT
 * This is the context that is passed to all tRPC procedures
 */
export interface CreateContextOptions {
	session: Session | null;
}

export const createInnerTRPCContext = (opts: CreateContextOptions) => {
	return {
		session: opts.session,
		prisma,
	};
};

export const createTRPCContext = async (opts: {
	headers: Headers;
	session: Session | null;
}) => {
	return createInnerTRPCContext({
		session: opts.session,
	});
};

export type Context = Awaited<ReturnType<typeof createTRPCContext>>;

/**
 * 2. INITIALIZATION
 * This is where the tRPC API is initialized
 */
const t = initTRPC.context<Context>().create({
	transformer: superjson,
	errorFormatter({ shape, error }) {
		return {
			...shape,
			data: {
				...shape.data,
				zodError:
					error.cause instanceof ZodError ? error.cause.flatten() : null,
			},
		};
	},
});

/**
 * 3. ROUTER & PROCEDURE HELPERS
 */
export const createTRPCRouter = t.router;
export const publicProcedure = t.procedure;

/**
 * Protected procedure for authenticated users
 */
export const protectedProcedure = t.procedure.use(({ ctx, next }) => {
	if (!ctx.session || !ctx.session.user) {
		throw new TRPCError({ code: "UNAUTHORIZED" });
	}
	return next({
		ctx: {
			// infers the `session` as non-nullable
			session: { ...ctx.session, user: ctx.session.user },
		},
	});
});

/**
 * Middleware to check if user has NSFW content enabled
 */
export const nsfwProcedure = protectedProcedure.use(({ ctx, next }) => {
	const settings = ctx.session.user as any;
	const userSettings = settings?.settings as { showNSFW?: boolean } | undefined;

	if (!userSettings?.showNSFW) {
		throw new TRPCError({
			code: "FORBIDDEN",
			message: "NSFW content is disabled in your settings",
		});
	}

	return next({ ctx });
});
