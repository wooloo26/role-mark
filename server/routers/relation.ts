/**
 * Relation router - handles character relations and relation types
 */

import { TRPCError } from "@trpc/server"
import { z } from "zod"
import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc"

// Relation Type schemas
const createRelationTypeSchema = z.object({
	name: z.string().min(1).max(100),
	description: z.string().max(500).optional(),
})

const updateRelationTypeSchema = z.object({
	id: z.string(),
	name: z.string().min(1).max(100).optional(),
	description: z.string().max(500).nullable().optional(),
})

// Character Relation schemas
const createCharacterRelationSchema = z.object({
	fromCharacterId: z.string(),
	toCharacterId: z.string(),
	relationTypeId: z.string(),
	isBidirectional: z.boolean().default(false),
})

const updateCharacterRelationSchema = z.object({
	id: z.string(),
	relationTypeId: z.string().optional(),
	isBidirectional: z.boolean().optional(),
})

const getRelationsSchema = z.object({
	characterId: z.string(),
	relationTypeId: z.string().optional(),
	includeIncoming: z.boolean().default(true),
	includeOutgoing: z.boolean().default(true),
})

export const relationRouter = createTRPCRouter({
	// ============================================
	// RELATION TYPE OPERATIONS
	// ============================================

	// Get all relation types
	getAllTypes: publicProcedure.query(async ({ ctx }) => {
		return await ctx.prisma.relationType.findMany({
			orderBy: { name: "asc" },
			include: {
				_count: {
					select: {
						relations: true,
					},
				},
			},
		})
	}),

	// Get relation type by ID
	getTypeById: publicProcedure
		.input(z.object({ id: z.string() }))
		.query(async ({ ctx, input }) => {
			const relationType = await ctx.prisma.relationType.findUnique({
				where: { id: input.id },
				include: {
					_count: {
						select: {
							relations: true,
						},
					},
				},
			})

			if (!relationType) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Relation type not found",
				})
			}

			return relationType
		}),

	// Get relation type by name
	getTypeByName: publicProcedure
		.input(z.object({ name: z.string() }))
		.query(async ({ ctx, input }) => {
			const relationType = await ctx.prisma.relationType.findUnique({
				where: { name: input.name },
				include: {
					_count: {
						select: {
							relations: true,
						},
					},
				},
			})

			if (!relationType) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Relation type not found",
				})
			}

			return relationType
		}),

	// Create relation type (protected)
	createType: protectedProcedure
		.input(createRelationTypeSchema)
		.mutation(async ({ ctx, input }) => {
			// Check if relation type with this name already exists
			const existing = await ctx.prisma.relationType.findUnique({
				where: { name: input.name },
			})

			if (existing) {
				throw new TRPCError({
					code: "CONFLICT",
					message: "A relation type with this name already exists",
				})
			}

			return await ctx.prisma.relationType.create({
				data: input,
			})
		}),

	// Update relation type (protected)
	updateType: protectedProcedure
		.input(updateRelationTypeSchema)
		.mutation(async ({ ctx, input }) => {
			const { id, ...data } = input

			// Check if relation type exists
			const existing = await ctx.prisma.relationType.findUnique({
				where: { id },
			})

			if (!existing) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Relation type not found",
				})
			}

			// If updating name, check for conflicts
			if (data.name && data.name !== existing.name) {
				const nameConflict = await ctx.prisma.relationType.findUnique({
					where: { name: data.name },
				})

				if (nameConflict) {
					throw new TRPCError({
						code: "CONFLICT",
						message: "A relation type with this name already exists",
					})
				}
			}

			return await ctx.prisma.relationType.update({
				where: { id },
				data,
			})
		}),

	// Delete relation type (protected)
	deleteType: protectedProcedure
		.input(z.object({ id: z.string() }))
		.mutation(async ({ ctx, input }) => {
			// Check if relation type exists
			const existing = await ctx.prisma.relationType.findUnique({
				where: { id: input.id },
				include: {
					_count: {
						select: {
							relations: true,
						},
					},
				},
			})

			if (!existing) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Relation type not found",
				})
			}

			// Check if relation type is being used
			if (existing._count.relations > 0) {
				throw new TRPCError({
					code: "PRECONDITION_FAILED",
					message: `Cannot delete relation type that is being used by ${existing._count.relations} relation(s)`,
				})
			}

			return await ctx.prisma.relationType.delete({
				where: { id: input.id },
			})
		}),

	// ============================================
	// CHARACTER RELATION OPERATIONS
	// ============================================

	// Get character relation by ID
	getById: publicProcedure
		.input(z.object({ id: z.string() }))
		.query(async ({ ctx, input }) => {
			const relation = await ctx.prisma.characterRelation.findUnique({
				where: { id: input.id },
				include: {
					fromCharacter: {
						select: {
							id: true,
							name: true,
							avatarUrl: true,
						},
					},
					toCharacter: {
						select: {
							id: true,
							name: true,
							avatarUrl: true,
						},
					},
					relationType: true,
				},
			})

			if (!relation) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Character relation not found",
				})
			}

			return relation
		}),

	// Get all relations for a character
	getRelations: publicProcedure
		.input(getRelationsSchema)
		.query(async ({ ctx, input }) => {
			const { characterId, relationTypeId, includeIncoming, includeOutgoing } =
				input

			// Verify character exists
			const character = await ctx.prisma.character.findUnique({
				where: { id: characterId },
			})

			if (!character) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Character not found",
				})
			}

			const where = relationTypeId ? { relationTypeId } : {}

			// Fetch outgoing relations (from this character)
			const outgoingRelations = includeOutgoing
				? await ctx.prisma.characterRelation.findMany({
						where: {
							fromCharacterId: characterId,
							...where,
						},
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
						orderBy: {
							createdAt: "desc",
						},
					})
				: []

			// Fetch incoming relations (to this character)
			const incomingRelations = includeIncoming
				? await ctx.prisma.characterRelation.findMany({
						where: {
							toCharacterId: characterId,
							...where,
						},
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
						orderBy: {
							createdAt: "desc",
						},
					})
				: []

			return {
				outgoing: outgoingRelations,
				incoming: incomingRelations,
			}
		}),

	// Create character relation (protected)
	create: protectedProcedure
		.input(createCharacterRelationSchema)
		.mutation(async ({ ctx, input }) => {
			// Validate that characters exist
			const [fromCharacter, toCharacter] = await Promise.all([
				ctx.prisma.character.findUnique({
					where: { id: input.fromCharacterId },
				}),
				ctx.prisma.character.findUnique({
					where: { id: input.toCharacterId },
				}),
			])

			if (!fromCharacter) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Source character not found",
				})
			}

			if (!toCharacter) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Target character not found",
				})
			}

			// Prevent self-relations
			if (input.fromCharacterId === input.toCharacterId) {
				throw new TRPCError({
					code: "BAD_REQUEST",
					message: "Cannot create a relation from a character to itself",
				})
			}

			// Validate relation type exists
			const relationType = await ctx.prisma.relationType.findUnique({
				where: { id: input.relationTypeId },
			})

			if (!relationType) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Relation type not found",
				})
			}

			// Check for duplicate relation
			const existing = await ctx.prisma.characterRelation.findFirst({
				where: {
					fromCharacterId: input.fromCharacterId,
					toCharacterId: input.toCharacterId,
					relationTypeId: input.relationTypeId,
				},
			})

			if (existing) {
				throw new TRPCError({
					code: "CONFLICT",
					message: "This relation already exists",
				})
			}

			return await ctx.prisma.characterRelation.create({
				data: input,
				include: {
					fromCharacter: {
						select: {
							id: true,
							name: true,
							avatarUrl: true,
						},
					},
					toCharacter: {
						select: {
							id: true,
							name: true,
							avatarUrl: true,
						},
					},
					relationType: true,
				},
			})
		}),

	// Update character relation (protected)
	update: protectedProcedure
		.input(updateCharacterRelationSchema)
		.mutation(async ({ ctx, input }) => {
			const { id, ...data } = input

			// Check if relation exists
			const existing = await ctx.prisma.characterRelation.findUnique({
				where: { id },
			})

			if (!existing) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Character relation not found",
				})
			}

			// If updating relation type, validate it exists
			if (data.relationTypeId) {
				const relationType = await ctx.prisma.relationType.findUnique({
					where: { id: data.relationTypeId },
				})

				if (!relationType) {
					throw new TRPCError({
						code: "NOT_FOUND",
						message: "Relation type not found",
					})
				}
			}

			return await ctx.prisma.characterRelation.update({
				where: { id },
				data,
				include: {
					fromCharacter: {
						select: {
							id: true,
							name: true,
							avatarUrl: true,
						},
					},
					toCharacter: {
						select: {
							id: true,
							name: true,
							avatarUrl: true,
						},
					},
					relationType: true,
				},
			})
		}),

	// Delete character relation (protected)
	delete: protectedProcedure
		.input(z.object({ id: z.string() }))
		.mutation(async ({ ctx, input }) => {
			// Check if relation exists
			const existing = await ctx.prisma.characterRelation.findUnique({
				where: { id: input.id },
			})

			if (!existing) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Character relation not found",
				})
			}

			return await ctx.prisma.characterRelation.delete({
				where: { id: input.id },
			})
		}),

	// Bulk delete relations for a character
	deleteByCharacter: protectedProcedure
		.input(
			z.object({
				characterId: z.string(),
				direction: z.enum(["outgoing", "incoming", "both"]).default("both"),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			const { characterId, direction } = input

			// Verify character exists
			const character = await ctx.prisma.character.findUnique({
				where: { id: characterId },
			})

			if (!character) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Character not found",
				})
			}

			const whereConditions = []

			if (direction === "outgoing" || direction === "both") {
				whereConditions.push({ fromCharacterId: characterId })
			}

			if (direction === "incoming" || direction === "both") {
				whereConditions.push({ toCharacterId: characterId })
			}

			const result = await ctx.prisma.characterRelation.deleteMany({
				where: {
					OR: whereConditions,
				},
			})

			return { count: result.count }
		}),
})
