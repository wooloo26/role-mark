/**
 * Character router - handles all character-related operations
 */

import { TRPCError } from "@trpc/server"
import { z } from "zod"
import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc"

// Character input schemas
const createCharacterSchema = z.object({
	name: z.string().min(1).max(255),
	avatarUrl: z.url().optional(),
	portraitUrl: z.url().optional(),
	info: z.string().optional(),
	staticTags: z
		.object({
			height: z.number().optional(),
			weight: z.number().optional(),
			birthday: z.string().or(z.date()).optional(),
		})
		.optional(),
	tagIds: z.array(z.string()).default([]),
})

const updateCharacterSchema = createCharacterSchema.partial().extend({
	id: z.string(),
})

const characterSearchSchema = z.object({
	name: z.string().optional(),
	tagIds: z.array(z.string()).optional(),
	staticTags: z
		.object({
			heightMin: z.number().optional(),
			heightMax: z.number().optional(),
			weightMin: z.number().optional(),
			weightMax: z.number().optional(),
		})
		.optional(),
	limit: z.number().min(1).max(100).default(20),
	offset: z.number().min(0).default(0),
})

const createRelationSchema = z.object({
	fromCharacterId: z.string(),
	toCharacterId: z.string(),
	relationTypeId: z.string(),
	isBidirectional: z.boolean().default(false),
})

export const characterRouter = createTRPCRouter({
	// Get character by ID
	getById: publicProcedure
		.input(z.object({ id: z.string() }))
		.query(async ({ ctx, input }) => {
			const character = await ctx.prisma.character.findUnique({
				where: { id: input.id },
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
					resources: {
						include: {
							resource: true,
						},
					},
					wikiPages: {
						include: {
							wikiPage: true,
						},
					},
					comments: {
						include: {
							comment: {
								include: {
									author: {
										select: {
											id: true,
											name: true,
											image: true,
										},
									},
								},
							},
						},
					},
					relationsFrom: {
						include: {
							toCharacter: {
								select: {
									id: true,
									name: true,
									avatarUrl: true,
								},
							},
							relationType: true,
						},
					},
					relationsTo: {
						include: {
							fromCharacter: {
								select: {
									id: true,
									name: true,
									avatarUrl: true,
								},
							},
							relationType: true,
						},
					},
				},
			})

			if (!character) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Character not found",
				})
			}

			return character
		}),

	// Search/list characters
	search: publicProcedure
		.input(characterSearchSchema)
		.query(async ({ ctx, input }) => {
			const where: {
				name?: {
					contains: string
					mode: "insensitive"
				}
				tags?: {
					some: {
						tagId: {
							in: string[]
						}
					}
				}
			} = {}

			if (input.name) {
				where.name = {
					contains: input.name,
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

			// Handle static tags filtering
			if (input.staticTags) {
				const staticTagsFilter: {
					path?: string[]
					gte?: number
					lte?: number
				} = {}
				if (
					input.staticTags.heightMin !== undefined ||
					input.staticTags.heightMax !== undefined
				) {
					staticTagsFilter.path = ["height"]
					if (input.staticTags.heightMin !== undefined) {
						staticTagsFilter.gte = input.staticTags.heightMin
					}
					if (input.staticTags.heightMax !== undefined) {
						staticTagsFilter.lte = input.staticTags.heightMax
					}
				}
			}

			const [characters, total] = await Promise.all([
				ctx.prisma.character.findMany({
					where,
					take: input.limit,
					skip: input.offset,
					orderBy: {
						createdAt: "desc",
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
						_count: {
							select: {
								resources: true,
								wikiPages: true,
								comments: true,
							},
						},
					},
				}),
				ctx.prisma.character.count({ where }),
			])

			return {
				characters,
				total,
				hasMore: input.offset + input.limit < total,
			}
		}),

	// Create character (protected)
	create: protectedProcedure
		.input(createCharacterSchema)
		.mutation(async ({ ctx, input }) => {
			const { tagIds, ...data } = input

			return await ctx.prisma.character.create({
				data: {
					...data,
					tags: {
						create: tagIds.map((tagId) => ({
							tagId,
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
				},
			})
		}),

	// Update character (protected)
	update: protectedProcedure
		.input(updateCharacterSchema)
		.mutation(async ({ ctx, input }) => {
			const { id, tagIds, ...data } = input

			return await ctx.prisma.character.update({
				where: { id },
				data: {
					...(data.name && { name: data.name }),
					...(data.avatarUrl !== undefined && { avatarUrl: data.avatarUrl }),
					...(data.portraitUrl !== undefined && {
						portraitUrl: data.portraitUrl,
					}),
					...(data.info !== undefined && { info: data.info }),
					...(data.staticTags !== undefined && {
						staticTags: data.staticTags,
					}),
					...(tagIds !== undefined && {
						tags: {
							deleteMany: {},
							create: tagIds.map((tagId) => ({
								tagId,
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
				},
			})
		}),

	// Delete character (protected)
	delete: protectedProcedure
		.input(z.object({ id: z.string() }))
		.mutation(async ({ ctx, input }) => {
			return await ctx.prisma.character.delete({
				where: { id: input.id },
			})
		}),

	// Create character relation
	createRelation: protectedProcedure
		.input(createRelationSchema)
		.mutation(async ({ ctx, input }) => {
			return await ctx.prisma.characterRelation.create({
				data: {
					fromCharacterId: input.fromCharacterId,
					toCharacterId: input.toCharacterId,
					relationTypeId: input.relationTypeId,
					isBidirectional: input.isBidirectional,
				},
			})
		}),

	// Delete character relation
	deleteRelation: protectedProcedure
		.input(z.object({ id: z.string() }))
		.mutation(async ({ ctx, input }) => {
			return await ctx.prisma.characterRelation.delete({
				where: { id: input.id },
			})
		}),
})
