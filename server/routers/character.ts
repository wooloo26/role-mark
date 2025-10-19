/**
 * Character router - handles all character-related operations
 */

import { TRPCError } from "@trpc/server"
import { z } from "zod"
import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc"

// Character input schemas
const createCharacterSchema = z.object({
	name: z.string().min(1).max(255),
	avatarUrl: z.url().optional().or(z.literal("")),
	portraitUrl: z.url().optional().or(z.literal("")),
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
					staticTags: {
						include: {
							tagDefinition: true,
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
				staticTags?: {
					some: {
						OR?: Array<{
							AND?: Array<{
								tagDefinition: { name: string }
								value?: { gte?: string; lte?: string }
							}>
						}>
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

			// Handle static tags filtering with proper relational queries
			if (input.staticTags) {
				const staticTagConditions: Array<{
					AND: Array<{
						tagDefinition: { name: string }
						value?: { gte?: string; lte?: string }
					}>
				}> = []

				// Height filtering
				if (
					input.staticTags.heightMin !== undefined ||
					input.staticTags.heightMax !== undefined
				) {
					const heightCondition: {
						tagDefinition: { name: string }
						value?: { gte?: string; lte?: string }
					} = {
						tagDefinition: { name: "height" },
					}

					if (
						input.staticTags.heightMin !== undefined ||
						input.staticTags.heightMax !== undefined
					) {
						heightCondition.value = {}
						if (input.staticTags.heightMin !== undefined) {
							heightCondition.value.gte = input.staticTags.heightMin.toString()
						}
						if (input.staticTags.heightMax !== undefined) {
							heightCondition.value.lte = input.staticTags.heightMax.toString()
						}
					}

					staticTagConditions.push({ AND: [heightCondition] })
				}

				// Weight filtering
				if (
					input.staticTags.weightMin !== undefined ||
					input.staticTags.weightMax !== undefined
				) {
					const weightCondition: {
						tagDefinition: { name: string }
						value?: { gte?: string; lte?: string }
					} = {
						tagDefinition: { name: "weight" },
					}

					if (
						input.staticTags.weightMin !== undefined ||
						input.staticTags.weightMax !== undefined
					) {
						weightCondition.value = {}
						if (input.staticTags.weightMin !== undefined) {
							weightCondition.value.gte = input.staticTags.weightMin.toString()
						}
						if (input.staticTags.weightMax !== undefined) {
							weightCondition.value.lte = input.staticTags.weightMax.toString()
						}
					}

					staticTagConditions.push({ AND: [weightCondition] })
				}

				if (staticTagConditions.length > 0) {
					where.staticTags = {
						some: {
							OR: staticTagConditions,
						},
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
						staticTags: {
							include: {
								tagDefinition: true,
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
			const { tagIds, staticTags, ...data } = input

			// Prepare static tags for creation
			const staticTagsData: Array<{
				tagDefId: string
				value: string
			}> = []

			if (staticTags) {
				// Get static tag definitions to map names to IDs
				const tagDefinitions = await ctx.prisma.staticTagDefinition.findMany({
					where: {
						name: {
							in: Object.keys(staticTags),
						},
					},
				})

				const tagDefMap = new Map(
					tagDefinitions.map((def) => [def.name, def.id]),
				)

				// Convert staticTags object to create format
				for (const [key, value] of Object.entries(staticTags)) {
					if (value !== undefined && value !== null) {
						const tagDefId = tagDefMap.get(key)
						if (tagDefId) {
							staticTagsData.push({
								tagDefId,
								value:
									typeof value === "object"
										? value.toISOString()
										: String(value),
							})
						}
					}
				}
			}

			return await ctx.prisma.character.create({
				data: {
					...data,
					staticTags:
						staticTagsData.length > 0
							? {
									create: staticTagsData,
								}
							: undefined,
					tags: {
						create: tagIds.map((tagId) => ({
							tagId,
						})),
					},
				},
				include: {
					staticTags: {
						include: {
							tagDefinition: true,
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
				},
			})
		}),

	// Update character (protected)
	update: protectedProcedure
		.input(updateCharacterSchema)
		.mutation(async ({ ctx, input }) => {
			const { id, tagIds, staticTags, ...data } = input

			// Prepare static tags for update
			let staticTagsUpdate:
				| {
						deleteMany?: Record<string, never>
						create?: Array<{
							tagDefId: string
							value: string
						}>
				  }
				| undefined

			if (staticTags !== undefined) {
				staticTagsUpdate = { deleteMany: {} }

				if (staticTags !== null) {
					// Get static tag definitions to map names to IDs
					const tagDefinitions = await ctx.prisma.staticTagDefinition.findMany({
						where: {
							name: {
								in: Object.keys(staticTags),
							},
						},
					})

					const tagDefMap = new Map(
						tagDefinitions.map((def) => [def.name, def.id]),
					)

					// Convert staticTags object to create format
					const staticTagsData: Array<{
						tagDefId: string
						value: string
					}> = []

					for (const [key, value] of Object.entries(staticTags)) {
						if (value !== undefined && value !== null) {
							const tagDefId = tagDefMap.get(key)
							if (tagDefId) {
								staticTagsData.push({
									tagDefId,
									value:
										typeof value === "object"
											? value.toISOString()
											: String(value),
								})
							}
						}
					}

					if (staticTagsData.length > 0) {
						staticTagsUpdate.create = staticTagsData
					}
				}
			}

			return await ctx.prisma.character.update({
				where: { id },
				data: {
					...(data.name && { name: data.name }),
					...(data.avatarUrl !== undefined && {
						avatarUrl: data.avatarUrl || null,
					}),
					...(data.portraitUrl !== undefined && {
						portraitUrl: data.portraitUrl || null,
					}),
					...(data.info !== undefined && { info: data.info }),
					...(staticTagsUpdate && { staticTags: staticTagsUpdate }),
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
					staticTags: {
						include: {
							tagDefinition: true,
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
