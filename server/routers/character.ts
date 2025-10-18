/**
 * Character router - handles all character-related operations
 */
import { z } from "zod";
import { createTRPCRouter, publicProcedure, protectedProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";

// Character input schemas
const createCharacterSchema = z.object({
	name: z.string().min(1).max(255),
	avatarUrl: z.string().url().optional(),
	portraitUrl: z.string().url().optional(),
	info: z.string().optional(),
	staticTags: z
		.object({
			height: z.number().optional(),
			weight: z.number().optional(),
			birthday: z.string().or(z.date()).optional(),
		})
		.optional(),
	dynamicTags: z.array(z.string()).default([]),
});

const updateCharacterSchema = createCharacterSchema.partial().extend({
	id: z.string(),
});

const characterSearchSchema = z.object({
	name: z.string().optional(),
	dynamicTags: z.array(z.string()).optional(),
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
});

const createRelationSchema = z.object({
	fromCharacterId: z.string(),
	toCharacterId: z.string(),
	relationType: z.string().min(1).max(100),
	isBidirectional: z.boolean().default(false),
});

export const characterRouter = createTRPCRouter({
	// Get character by ID
	getById: publicProcedure
		.input(z.object({ id: z.string() }))
		.query(async ({ ctx, input }) => {
			const character = await ctx.prisma.character.findUnique({
				where: { id: input.id },
				include: {
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
						},
					},
				},
			});

			if (!character) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Character not found",
				});
			}

			return character;
		}),

	// Search/list characters
	search: publicProcedure
		.input(characterSearchSchema)
		.query(async ({ ctx, input }) => {
			const where: any = {};

			if (input.name) {
				where.name = {
					contains: input.name,
					mode: "insensitive",
				};
			}

			if (input.dynamicTags && input.dynamicTags.length > 0) {
				where.dynamicTags = {
					hasEvery: input.dynamicTags,
				};
			}

			// Handle static tags filtering
			if (input.staticTags) {
				const staticTagsFilter: any = {};
				if (
					input.staticTags.heightMin !== undefined ||
					input.staticTags.heightMax !== undefined
				) {
					staticTagsFilter.path = ["height"];
					if (input.staticTags.heightMin !== undefined) {
						staticTagsFilter.gte = input.staticTags.heightMin;
					}
					if (input.staticTags.heightMax !== undefined) {
						staticTagsFilter.lte = input.staticTags.heightMax;
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
			]);

			return {
				characters,
				total,
				hasMore: input.offset + input.limit < total,
			};
		}),

	// Create character (protected)
	create: protectedProcedure
		.input(createCharacterSchema)
		.mutation(async ({ ctx, input }) => {
			return await ctx.prisma.character.create({
				data: {
					name: input.name,
					avatarUrl: input.avatarUrl,
					portraitUrl: input.portraitUrl,
					info: input.info,
					staticTags: input.staticTags as any,
					dynamicTags: input.dynamicTags,
				},
			});
		}),

	// Update character (protected)
	update: protectedProcedure
		.input(updateCharacterSchema)
		.mutation(async ({ ctx, input }) => {
			const { id, ...data } = input;

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
						staticTags: data.staticTags as any,
					}),
					...(data.dynamicTags !== undefined && {
						dynamicTags: data.dynamicTags,
					}),
				},
			});
		}),

	// Delete character (protected)
	delete: protectedProcedure
		.input(z.object({ id: z.string() }))
		.mutation(async ({ ctx, input }) => {
			return await ctx.prisma.character.delete({
				where: { id: input.id },
			});
		}),

	// Create character relation
	createRelation: protectedProcedure
		.input(createRelationSchema)
		.mutation(async ({ ctx, input }) => {
			return await ctx.prisma.characterRelation.create({
				data: {
					fromCharacterId: input.fromCharacterId,
					toCharacterId: input.toCharacterId,
					relationType: input.relationType,
					isBidirectional: input.isBidirectional,
				},
			});
		}),

	// Delete character relation
	deleteRelation: protectedProcedure
		.input(z.object({ id: z.string() }))
		.mutation(async ({ ctx, input }) => {
			return await ctx.prisma.characterRelation.delete({
				where: { id: input.id },
			});
		}),
});
