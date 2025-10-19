/**
 * Static Tag router - handles static tag definition management
 * Static tags are character attributes like height, weight, birthday, etc.
 */

import { StaticTagDataType } from "@prisma/client"
import { TRPCError } from "@trpc/server"
import { z } from "zod"
import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc"

// Static Tag Definition schemas
const createStaticTagSchema = z.object({
	name: z
		.string()
		.min(1)
		.max(100)
		.regex(
			/^[a-z0-9_]+$/,
			"Name must contain only lowercase letters, numbers, and underscores",
		),
	displayName: z.string().min(1).max(100),
	dataType: z.enum(StaticTagDataType),
	unit: z.string().max(20).optional(),
	description: z.string().max(500).optional(),
	isRequired: z.boolean().default(false),
})

const updateStaticTagSchema = z.object({
	id: z.string(),
	name: z
		.string()
		.min(1)
		.max(100)
		.regex(
			/^[a-z0-9_]+$/,
			"Name must contain only lowercase letters, numbers, and underscores",
		)
		.optional(),
	displayName: z.string().min(1).max(100).optional(),
	dataType: z.enum(StaticTagDataType).optional(),
	unit: z.string().max(20).nullable().optional(),
	description: z.string().max(500).nullable().optional(),
	isRequired: z.boolean().optional(),
})

const staticTagSearchSchema = z.object({
	name: z.string().optional(),
	dataType: z.enum(StaticTagDataType).optional(),
	isRequired: z.boolean().optional(),
	limit: z.number().min(1).max(100).default(50),
	offset: z.number().min(0).default(0),
})

export const staticTagRouter = createTRPCRouter({
	// ============================================
	// STATIC TAG DEFINITION OPERATIONS
	// ============================================

	// Get static tag definition by ID
	getById: publicProcedure
		.input(z.object({ id: z.string() }))
		.query(async ({ ctx, input }) => {
			const staticTag = await ctx.prisma.staticTagDefinition.findUnique({
				where: { id: input.id },
				include: {
					_count: {
						select: {
							characterStaticTags: true,
						},
					},
				},
			})

			if (!staticTag) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Static tag definition not found",
				})
			}

			return staticTag
		}),

	// Get static tag definition by name
	getByName: publicProcedure
		.input(z.object({ name: z.string() }))
		.query(async ({ ctx, input }) => {
			const staticTag = await ctx.prisma.staticTagDefinition.findUnique({
				where: { name: input.name },
				include: {
					_count: {
						select: {
							characterStaticTags: true,
						},
					},
				},
			})

			if (!staticTag) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Static tag definition not found",
				})
			}

			return staticTag
		}),

	// List all static tag definitions
	list: publicProcedure.query(async ({ ctx }) => {
		return await ctx.prisma.staticTagDefinition.findMany({
			orderBy: [{ isRequired: "desc" }, { displayName: "asc" }],
			include: {
				_count: {
					select: {
						characterStaticTags: true,
					},
				},
			},
		})
	}),

	// Search static tag definitions with filtering
	search: publicProcedure
		.input(staticTagSearchSchema)
		.query(async ({ ctx, input }) => {
			const { name, dataType, isRequired, limit, offset } = input

			const where: {
				name?: { contains: string; mode: "insensitive" }
				dataType?: StaticTagDataType
				isRequired?: boolean
			} = {}

			if (name) {
				where.name = { contains: name, mode: "insensitive" }
			}

			if (dataType) {
				where.dataType = dataType
			}

			if (isRequired !== undefined) {
				where.isRequired = isRequired
			}

			const [staticTags, total] = await Promise.all([
				ctx.prisma.staticTagDefinition.findMany({
					where,
					orderBy: [{ isRequired: "desc" }, { displayName: "asc" }],
					take: limit,
					skip: offset,
					include: {
						_count: {
							select: {
								characterStaticTags: true,
							},
						},
					},
				}),
				ctx.prisma.staticTagDefinition.count({ where }),
			])

			return {
				staticTags,
				total,
				hasMore: offset + limit < total,
			}
		}),

	// Get static tags grouped by data type
	getGroupedByDataType: publicProcedure.query(async ({ ctx }) => {
		const staticTags = await ctx.prisma.staticTagDefinition.findMany({
			orderBy: [{ isRequired: "desc" }, { displayName: "asc" }],
			include: {
				_count: {
					select: {
						characterStaticTags: true,
					},
				},
			},
		})

		// Group by data type
		const grouped = staticTags.reduce(
			(acc, tag) => {
				if (!acc[tag.dataType]) {
					acc[tag.dataType] = []
				}
				acc[tag.dataType].push(tag)
				return acc
			},
			{} as Record<StaticTagDataType, Array<(typeof staticTags)[0]>>,
		)

		return grouped
	}),

	// Create static tag definition (protected)
	create: protectedProcedure
		.input(createStaticTagSchema)
		.mutation(async ({ ctx, input }) => {
			// Check if name already exists
			const existingTag = await ctx.prisma.staticTagDefinition.findUnique({
				where: { name: input.name },
			})

			if (existingTag) {
				throw new TRPCError({
					code: "CONFLICT",
					message: "A static tag definition with this name already exists",
				})
			}

			return await ctx.prisma.staticTagDefinition.create({
				data: input,
				include: {
					_count: {
						select: {
							characterStaticTags: true,
						},
					},
				},
			})
		}),

	// Update static tag definition (protected)
	update: protectedProcedure
		.input(updateStaticTagSchema)
		.mutation(async ({ ctx, input }) => {
			const { id, name, ...data } = input

			// Check if the static tag definition exists
			const existingTag = await ctx.prisma.staticTagDefinition.findUnique({
				where: { id },
			})

			if (!existingTag) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Static tag definition not found",
				})
			}

			// If updating name, check for conflicts
			if (name && name !== existingTag.name) {
				const nameConflict = await ctx.prisma.staticTagDefinition.findUnique({
					where: { name },
				})

				if (nameConflict) {
					throw new TRPCError({
						code: "CONFLICT",
						message: "A static tag definition with this name already exists",
					})
				}
			}

			return await ctx.prisma.staticTagDefinition.update({
				where: { id },
				data: {
					...(name && { name }),
					...data,
				},
				include: {
					_count: {
						select: {
							characterStaticTags: true,
						},
					},
				},
			})
		}),

	// Delete static tag definition (protected)
	// Note: This will cascade delete all character static tags using this definition
	delete: protectedProcedure
		.input(z.object({ id: z.string() }))
		.mutation(async ({ ctx, input }) => {
			// Check if the static tag definition exists
			const existingTag = await ctx.prisma.staticTagDefinition.findUnique({
				where: { id: input.id },
				include: {
					_count: {
						select: {
							characterStaticTags: true,
						},
					},
				},
			})

			if (!existingTag) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Static tag definition not found",
				})
			}

			// Warn if there are existing character static tags using this definition
			// The cascade delete will handle removal, but we return the count for UI feedback
			const usageCount = existingTag._count.characterStaticTags

			await ctx.prisma.staticTagDefinition.delete({
				where: { id: input.id },
			})

			return {
				success: true,
				deletedUsages: usageCount,
			}
		}),

	// Get statistics about static tag definitions
	getStats: publicProcedure.query(async ({ ctx }) => {
		const [total, required, byDataType, mostUsed] = await Promise.all([
			// Total count
			ctx.prisma.staticTagDefinition.count(),

			// Required count
			ctx.prisma.staticTagDefinition.count({
				where: { isRequired: true },
			}),

			// Count by data type
			ctx.prisma.staticTagDefinition.groupBy({
				by: ["dataType"],
				_count: true,
			}),

			// Most used static tags
			ctx.prisma.staticTagDefinition.findMany({
				take: 10,
				orderBy: {
					characterStaticTags: {
						_count: "desc",
					},
				},
				include: {
					_count: {
						select: {
							characterStaticTags: true,
						},
					},
				},
			}),
		])

		return {
			total,
			required,
			byDataType: byDataType.reduce(
				(acc, item) => {
					acc[item.dataType] = item._count
					return acc
				},
				{} as Record<StaticTagDataType, number>,
			),
			mostUsed: mostUsed.map((tag) => ({
				id: tag.id,
				name: tag.name,
				displayName: tag.displayName,
				dataType: tag.dataType,
				usageCount: tag._count.characterStaticTags,
			})),
		}
	}),
})
