/**
 * Comment router - handles all comment operations
 */

import { TRPCError } from "@trpc/server"
import { z } from "zod"
import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc"

const createCommentSchema = z.object({
	content: z.string().min(1).max(5000),
	characterIds: z.array(z.string()).min(1),
})

const updateCommentSchema = z.object({
	id: z.string(),
	content: z.string().min(1).max(5000),
})

export const commentRouter = createTRPCRouter({
	// Get comments by character ID
	getByCharacterId: publicProcedure
		.input(
			z.object({
				characterId: z.string(),
				limit: z.number().min(1).max(100).default(20),
				offset: z.number().min(0).default(0),
			}),
		)
		.query(async ({ ctx, input }) => {
			const [comments, total] = await Promise.all([
				ctx.prisma.comment.findMany({
					where: {
						characters: {
							some: {
								characterId: input.characterId,
							},
						},
					},
					take: input.limit,
					skip: input.offset,
					orderBy: {
						createdAt: "desc",
					},
					include: {
						author: {
							select: {
								id: true,
								name: true,
								image: true,
							},
						},
						characters: {
							include: {
								character: {
									select: {
										id: true,
										name: true,
										avatarUrl: true,
									},
								},
							},
						},
					},
				}),
				ctx.prisma.comment.count({
					where: {
						characters: {
							some: {
								characterId: input.characterId,
							},
						},
					},
				}),
			])

			return {
				comments,
				total,
				hasMore: input.offset + input.limit < total,
			}
		}),

	// Create comment (protected)
	create: protectedProcedure
		.input(createCommentSchema)
		.mutation(async ({ ctx, input }) => {
			return await ctx.prisma.comment.create({
				data: {
					content: input.content,
					authorId: ctx.session.user.id,
					characters: {
						create: input.characterIds.map((characterId) => ({
							characterId,
						})),
					},
				},
				include: {
					author: {
						select: {
							id: true,
							name: true,
							image: true,
						},
					},
					characters: {
						include: {
							character: {
								select: {
									id: true,
									name: true,
									avatarUrl: true,
								},
							},
						},
					},
				},
			})
		}),

	// Update comment (protected)
	update: protectedProcedure
		.input(updateCommentSchema)
		.mutation(async ({ ctx, input }) => {
			// Verify ownership
			const comment = await ctx.prisma.comment.findUnique({
				where: { id: input.id },
				select: { authorId: true },
			})

			if (!comment) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Comment not found",
				})
			}

			if (comment.authorId !== ctx.session.user.id) {
				throw new TRPCError({
					code: "FORBIDDEN",
					message: "You can only edit your own comments",
				})
			}

			return await ctx.prisma.comment.update({
				where: { id: input.id },
				data: {
					content: input.content,
				},
				include: {
					author: {
						select: {
							id: true,
							name: true,
							image: true,
						},
					},
					characters: {
						include: {
							character: true,
						},
					},
				},
			})
		}),

	// Delete comment (protected)
	delete: protectedProcedure
		.input(z.object({ id: z.string() }))
		.mutation(async ({ ctx, input }) => {
			// Verify ownership
			const comment = await ctx.prisma.comment.findUnique({
				where: { id: input.id },
				select: { authorId: true },
			})

			if (!comment) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Comment not found",
				})
			}

			if (comment.authorId !== ctx.session.user.id) {
				throw new TRPCError({
					code: "FORBIDDEN",
					message: "You can only delete your own comments",
				})
			}

			return await ctx.prisma.comment.delete({
				where: { id: input.id },
			})
		}),
})
