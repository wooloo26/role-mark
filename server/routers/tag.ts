/**
 * Tag router - handles tag and tag group management
 */

import { TagScope } from "@prisma/client"
import { TRPCError } from "@trpc/server"
import { z } from "zod"
import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc"

// Tag schemas
const createTagSchema = z.object({
	name: z.string().min(1).max(100),
	slug: z
		.string()
		.min(1)
		.max(100)
		.regex(
			/^[a-z0-9-]+$/,
			"Slug must contain only lowercase letters, numbers, and hyphens",
		),
	scope: z.nativeEnum(TagScope),
	groupId: z.string().optional(),
})

const updateTagSchema = z.object({
	id: z.string(),
	name: z.string().min(1).max(100).optional(),
	slug: z
		.string()
		.min(1)
		.max(100)
		.regex(
			/^[a-z0-9-]+$/,
			"Slug must contain only lowercase letters, numbers, and hyphens",
		)
		.optional(),
	groupId: z.string().nullable().optional(),
})

const tagSearchSchema = z.object({
	name: z.string().optional(),
	scope: z.nativeEnum(TagScope).optional(),
	groupId: z.string().optional(),
	limit: z.number().min(1).max(100).default(50),
	offset: z.number().min(0).default(0),
})

// TagGroup schemas
const createTagGroupSchema = z.object({
	name: z.string().min(1).max(100),
	scope: z.nativeEnum(TagScope),
})

const updateTagGroupSchema = z.object({
	id: z.string(),
	name: z.string().min(1).max(100).optional(),
})

export const tagRouter = createTRPCRouter({
	// ============================================
	// TAG OPERATIONS
	// ============================================

	// Get tag by ID
	getById: publicProcedure
		.input(z.object({ id: z.string() }))
		.query(async ({ ctx, input }) => {
			const tag = await ctx.prisma.tag.findUnique({
				where: { id: input.id },
				include: {
					group: true,
					_count: {
						select: {
							characterTags: true,
							resourceTags: true,
						},
					},
				},
			})

			if (!tag) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Tag not found",
				})
			}

			return tag
		}),

	// Get tag by slug
	getBySlug: publicProcedure
		.input(z.object({ slug: z.string() }))
		.query(async ({ ctx, input }) => {
			const tag = await ctx.prisma.tag.findUnique({
				where: { slug: input.slug },
				include: {
					group: true,
					_count: {
						select: {
							characterTags: true,
							resourceTags: true,
						},
					},
				},
			})

			if (!tag) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Tag not found",
				})
			}

			return tag
		}),

	// Search/list tags
	search: publicProcedure
		.input(tagSearchSchema)
		.query(async ({ ctx, input }) => {
			const where: {
				name?: { contains: string; mode: "insensitive" }
				scope?: TagScope
				groupId?: string | null
			} = {}

			if (input.name) {
				where.name = {
					contains: input.name,
					mode: "insensitive",
				}
			}

			if (input.scope) {
				where.scope = input.scope
			}

			if (input.groupId !== undefined) {
				where.groupId = input.groupId || null
			}

			const [tags, total] = await Promise.all([
				ctx.prisma.tag.findMany({
					where,
					take: input.limit,
					skip: input.offset,
					orderBy: {
						name: "asc",
					},
					include: {
						group: true,
						_count: {
							select: {
								characterTags: true,
								resourceTags: true,
							},
						},
					},
				}),
				ctx.prisma.tag.count({ where }),
			])

			return {
				tags,
				total,
				hasMore: input.offset + input.limit < total,
			}
		}),

	// Get all tags for a specific scope (useful for tag selection UI)
	getByScope: publicProcedure
		.input(z.object({ scope: z.nativeEnum(TagScope) }))
		.query(async ({ ctx, input }) => {
			return await ctx.prisma.tag.findMany({
				where: { scope: input.scope },
				orderBy: {
					name: "asc",
				},
				include: {
					group: true,
					_count: {
						select: {
							characterTags: true,
							resourceTags: true,
						},
					},
				},
			})
		}),

	// Create tag (protected)
	create: protectedProcedure
		.input(createTagSchema)
		.mutation(async ({ ctx, input }) => {
			// Check if slug already exists
			const existingTag = await ctx.prisma.tag.findUnique({
				where: { slug: input.slug },
			})

			if (existingTag) {
				throw new TRPCError({
					code: "CONFLICT",
					message: "A tag with this slug already exists",
				})
			}

			// Verify groupId if provided
			if (input.groupId) {
				const group = await ctx.prisma.tagGroup.findUnique({
					where: { id: input.groupId },
				})

				if (!group) {
					throw new TRPCError({
						code: "NOT_FOUND",
						message: "Tag group not found",
					})
				}

				if (group.scope !== input.scope) {
					throw new TRPCError({
						code: "BAD_REQUEST",
						message: "Tag scope must match group scope",
					})
				}
			}

			return await ctx.prisma.tag.create({
				data: input,
				include: {
					group: true,
				},
			})
		}),

	// Update tag (protected)
	update: protectedProcedure
		.input(updateTagSchema)
		.mutation(async ({ ctx, input }) => {
			const { id, ...data } = input

			// Check if new slug conflicts
			if (data.slug) {
				const existingTag = await ctx.prisma.tag.findUnique({
					where: { slug: data.slug },
				})

				if (existingTag && existingTag.id !== id) {
					throw new TRPCError({
						code: "CONFLICT",
						message: "A tag with this slug already exists",
					})
				}
			}

			// Verify groupId if provided
			if (data.groupId !== undefined && data.groupId !== null) {
				const group = await ctx.prisma.tagGroup.findUnique({
					where: { id: data.groupId },
				})

				if (!group) {
					throw new TRPCError({
						code: "NOT_FOUND",
						message: "Tag group not found",
					})
				}

				const tag = await ctx.prisma.tag.findUnique({
					where: { id },
				})

				if (tag && group.scope !== tag.scope) {
					throw new TRPCError({
						code: "BAD_REQUEST",
						message: "Tag scope must match group scope",
					})
				}
			}

			return await ctx.prisma.tag.update({
				where: { id },
				data,
				include: {
					group: true,
				},
			})
		}),

	// Delete tag (protected)
	delete: protectedProcedure
		.input(z.object({ id: z.string() }))
		.mutation(async ({ ctx, input }) => {
			return await ctx.prisma.tag.delete({
				where: { id: input.id },
			})
		}),

	// ============================================
	// TAG GROUP OPERATIONS
	// ============================================

	// Get tag group by ID
	getGroupById: publicProcedure
		.input(z.object({ id: z.string() }))
		.query(async ({ ctx, input }) => {
			const group = await ctx.prisma.tagGroup.findUnique({
				where: { id: input.id },
				include: {
					tags: {
						orderBy: {
							name: "asc",
						},
					},
				},
			})

			if (!group) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Tag group not found",
				})
			}

			return group
		}),

	// List all tag groups for a scope
	listGroups: publicProcedure
		.input(z.object({ scope: z.nativeEnum(TagScope).optional() }))
		.query(async ({ ctx, input }) => {
			return await ctx.prisma.tagGroup.findMany({
				where: input.scope ? { scope: input.scope } : undefined,
				orderBy: {
					name: "asc",
				},
				include: {
					tags: {
						orderBy: {
							name: "asc",
						},
					},
				},
			})
		}),

	// Create tag group (protected)
	createGroup: protectedProcedure
		.input(createTagGroupSchema)
		.mutation(async ({ ctx, input }) => {
			return await ctx.prisma.tagGroup.create({
				data: input,
				include: {
					tags: true,
				},
			})
		}),

	// Update tag group (protected)
	updateGroup: protectedProcedure
		.input(updateTagGroupSchema)
		.mutation(async ({ ctx, input }) => {
			const { id, ...data } = input

			return await ctx.prisma.tagGroup.update({
				where: { id },
				data,
				include: {
					tags: true,
				},
			})
		}),

	// Delete tag group (protected)
	deleteGroup: protectedProcedure
		.input(z.object({ id: z.string() }))
		.mutation(async ({ ctx, input }) => {
			return await ctx.prisma.tagGroup.delete({
				where: { id: input.id },
			})
		}),

	// ============================================
	// UTILITY OPERATIONS
	// ============================================

	// Get grouped tags (useful for UI dropdowns/selectors)
	getGroupedTags: publicProcedure
		.input(z.object({ scope: z.nativeEnum(TagScope) }))
		.query(async ({ ctx, input }) => {
			const [groupedTags, ungroupedTags] = await Promise.all([
				ctx.prisma.tagGroup.findMany({
					where: { scope: input.scope },
					orderBy: { name: "asc" },
					include: {
						tags: {
							orderBy: { name: "asc" },
							include: {
								_count: {
									select: {
										characterTags: true,
										resourceTags: true,
									},
								},
							},
						},
					},
				}),
				ctx.prisma.tag.findMany({
					where: {
						scope: input.scope,
						groupId: null,
					},
					orderBy: { name: "asc" },
					include: {
						_count: {
							select: {
								characterTags: true,
								resourceTags: true,
							},
						},
					},
				}),
			])

			return {
				grouped: groupedTags,
				ungrouped: ungroupedTags,
			}
		}),
})
