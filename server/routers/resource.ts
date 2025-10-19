/**
 * Resource router - handles all resource-related operations
 */

import { TRPCError } from "@trpc/server"
import { z } from "zod"
import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc"

const createResourceSchema = z.object({
	title: z.string().min(1).max(255),
	fileUrl: z.url(),
	mimeType: z.string(),
	tagIds: z.array(z.string()).default([]),
	characterIds: z.array(z.string()).default([]),
})

const updateResourceSchema = z.object({
	id: z.string(),
	title: z.string().min(1).max(255).optional(),
	tagIds: z.array(z.string()).optional(),
	characterIds: z.array(z.string()).optional(),
})

const resourceSearchSchema = z.object({
	title: z.string().optional(),
	tagIds: z.array(z.string()).optional(),
	mimeType: z.string().optional(),
	characterId: z.string().optional(),
	limit: z.number().min(1).max(100).default(20),
	offset: z.number().min(0).default(0),
})

export const resourceRouter = createTRPCRouter({
	// Get resource by ID
	getById: publicProcedure
		.input(z.object({ id: z.string() }))
		.query(async ({ ctx, input }) => {
			const resource = await ctx.prisma.resource.findUnique({
				where: { id: input.id },
				include: {
					uploader: {
						select: {
							id: true,
							name: true,
							image: true,
						},
					},
					tags: {
						include: {
							tag: {
								include: {
									group: true,
								},
							},
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

			if (!resource) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Resource not found",
				})
			}

			return resource
		}),

	// Search/list resources
	search: publicProcedure
		.input(resourceSearchSchema)
		.query(async ({ ctx, input }) => {
			const where: {
				title?: { contains: string; mode: "insensitive" }
				tags?: {
					some: {
						tagId: {
							in: string[]
						}
					}
				}
				mimeType?: { contains: string }
				characters?: { some: { characterId: string } }
			} = {}

			if (input.title) {
				where.title = {
					contains: input.title,
					mode: "insensitive",
				}
			}

			if (input.tagIds && input.tagIds.length > 0) {
				where.tags = {
					some: {
						tagId: {
							in: input.tagIds,
						},
					},
				}
			}

			if (input.mimeType) {
				where.mimeType = {
					contains: input.mimeType,
				}
			}

			if (input.characterId) {
				where.characters = {
					some: {
						characterId: input.characterId,
					},
				}
			}

			const [resources, total] = await Promise.all([
				ctx.prisma.resource.findMany({
					where,
					take: input.limit,
					skip: input.offset,
					orderBy: {
						createdAt: "desc",
					},
					include: {
						uploader: {
							select: {
								id: true,
								name: true,
								image: true,
							},
						},
						tags: {
							include: {
								tag: {
									include: {
										group: true,
									},
								},
							},
						},
						_count: {
							select: {
								characters: true,
							},
						},
					},
				}),
				ctx.prisma.resource.count({ where }),
			])

			return {
				resources,
				total,
				hasMore: input.offset + input.limit < total,
			}
		}),

	// Create resource (protected)
	create: protectedProcedure
		.input(createResourceSchema)
		.mutation(async ({ ctx, input }) => {
			const { characterIds, tagIds, ...data } = input

			return await ctx.prisma.resource.create({
				data: {
					...data,
					uploaderId: ctx.session.user.id,
					tags: {
						create: tagIds.map((tagId) => ({
							tagId,
						})),
					},
					characters: {
						create: characterIds.map((characterId) => ({
							characterId,
						})),
					},
				},
				include: {
					tags: {
						include: {
							tag: {
								include: {
									group: true,
								},
							},
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

	// Update resource (protected)
	update: protectedProcedure
		.input(updateResourceSchema)
		.mutation(async ({ ctx, input }) => {
			const { id, characterIds, tagIds, ...data } = input

			// Verify ownership or admin rights
			const resource = await ctx.prisma.resource.findUnique({
				where: { id },
				select: { uploaderId: true },
			})

			if (!resource) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Resource not found",
				})
			}

			if (resource.uploaderId !== ctx.session.user.id) {
				throw new TRPCError({
					code: "FORBIDDEN",
					message: "You can only update your own resources",
				})
			}

			return await ctx.prisma.resource.update({
				where: { id },
				data: {
					...(data.title && { title: data.title }),
					...(tagIds !== undefined && {
						tags: {
							deleteMany: {},
							create: tagIds.map((tagId) => ({
								tagId,
							})),
						},
					}),
					...(characterIds && {
						characters: {
							deleteMany: {},
							create: characterIds.map((characterId) => ({
								characterId,
							})),
						},
					}),
				},
				include: {
					tags: {
						include: {
							tag: {
								include: {
									group: true,
								},
							},
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

	// Delete resource (protected)
	delete: protectedProcedure
		.input(z.object({ id: z.string() }))
		.mutation(async ({ ctx, input }) => {
			// Verify ownership
			const resource = await ctx.prisma.resource.findUnique({
				where: { id: input.id },
				select: { uploaderId: true },
			})

			if (!resource) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Resource not found",
				})
			}

			if (resource.uploaderId !== ctx.session.user.id) {
				throw new TRPCError({
					code: "FORBIDDEN",
					message: "You can only delete your own resources",
				})
			}

			return await ctx.prisma.resource.delete({
				where: { id: input.id },
			})
		}),
})
