/**
 * Resource router - handles all resource-related operations
 *
 * Resources are atomic entities presented to end users.
 * Three types: SINGLE_FILE, FILE_ARRAY, FOLDER
 * Content types: IMAGE, VIDEO, OTHER (only for SINGLE_FILE and FILE_ARRAY)
 */

import { ContentType, ResourceType } from "@prisma/client"
import { TRPCError } from "@trpc/server"
import { z } from "zod"
import { deleteFiles } from "@/lib/file-storage"
import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc"

// File schema for creating resource files
const resourceFileSchema = z.object({
	fileName: z.string().min(1),
	fileUrl: z.url(),
	mimeType: z.string(),
	fileSize: z.number().int().positive().optional(),
	order: z.number().int().min(0).default(0),
	metadata: z.record(z.string(), z.any()).optional(),
})

const createResourceSchema = z
	.object({
		title: z.string().min(1).max(255),
		description: z.string().optional(),
		type: z.enum(ResourceType),
		contentType: z.enum(ContentType).nullable().optional(),
		thumbnailUrl: z.url().optional(),
		files: z.array(resourceFileSchema).min(1),
		tagIds: z.array(z.string()).default([]),
		characterIds: z.array(z.string()).default([]),
	})
	.refine(
		(data) => {
			// FOLDER type must have contentType as null
			if (
				data.type === ResourceType.FOLDER &&
				data.contentType !== null &&
				data.contentType !== undefined
			) {
				return false
			}
			// SINGLE_FILE and FILE_ARRAY should have a contentType
			if (
				(data.type === ResourceType.SINGLE_FILE ||
					data.type === ResourceType.FILE_ARRAY) &&
				!data.contentType
			) {
				return false
			}
			// SINGLE_FILE must have exactly one file
			if (data.type === ResourceType.SINGLE_FILE && data.files.length !== 1) {
				return false
			}
			return true
		},
		{
			message: "Invalid combination of type, contentType, and files",
		},
	)

const updateResourceSchema = z.object({
	id: z.string(),
	title: z.string().min(1).max(255).optional(),
	description: z.string().optional(),
	thumbnailUrl: z.url().optional(),
	tagIds: z.array(z.string()).optional(),
	characterIds: z.array(z.string()).optional(),
	// Note: type, contentType, and files cannot be updated to maintain data integrity
})

const resourceSearchSchema = z.object({
	title: z.string().optional(),
	type: z.enum(ResourceType).optional(),
	contentType: z.enum(ContentType).optional(),
	tagIds: z.array(z.string()).optional(),
	characterId: z.string().optional(),
	uploaderId: z.string().optional(),
	limit: z.number().min(1).max(100).default(20),
	offset: z.number().min(0).default(0),
	sortBy: z.enum(["createdAt", "updatedAt", "title"]).default("createdAt"),
	sortOrder: z.enum(["asc", "desc"]).default("desc"),
})

export const resourceRouter = createTRPCRouter({
	// Get resource by ID with all files
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
					files: {
						orderBy: {
							order: "asc",
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

	// Search/list resources with filtering
	search: publicProcedure
		.input(resourceSearchSchema)
		.query(async ({ ctx, input }) => {
			// biome-ignore lint/suspicious/noExplicitAny: Dynamic where clause construction
			const where: any = {}

			if (input.title) {
				where.title = {
					contains: input.title,
					mode: "insensitive",
				}
			}

			if (input.type) {
				where.type = input.type
			}

			if (input.contentType) {
				where.contentType = input.contentType
			}

			if (input.uploaderId) {
				where.uploaderId = input.uploaderId
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
						[input.sortBy]: input.sortOrder,
					},
					include: {
						uploader: {
							select: {
								id: true,
								name: true,
								image: true,
							},
						},
						files: {
							orderBy: {
								order: "asc",
							},
							take: 1, // For list view, just get first file for preview
						},
						tags: {
							include: {
								tag: {
									include: {
										group: true,
									},
								},
							},
							orderBy: {
								tag: {
									pinned: "desc",
								},
							},
						},
						_count: {
							select: {
								characters: true,
								files: true,
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

	// Get resources by character ID
	getByCharacterId: publicProcedure
		.input(
			z.object({
				characterId: z.string(),
				limit: z.number().min(1).max(100).default(20),
				offset: z.number().min(0).default(0),
			}),
		)
		.query(async ({ ctx, input }) => {
			const [resources, total] = await Promise.all([
				ctx.prisma.resource.findMany({
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
						files: {
							orderBy: {
								order: "asc",
							},
						},
						tags: {
							include: {
								tag: true,
							},
							orderBy: {
								tag: {
									pinned: "desc",
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
				ctx.prisma.resource.count({
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
				resources,
				total,
				hasMore: input.offset + input.limit < total,
			}
		}),

	// Create resource with files (protected)
	create: protectedProcedure
		.input(createResourceSchema)
		.mutation(async ({ ctx, input }) => {
			const { characterIds, tagIds, files, ...resourceData } = input

			return await ctx.prisma.resource.create({
				data: {
					...resourceData,
					uploaderId: ctx.session.user.id,
					files: {
						create: files.map((file) => ({
							fileName: file.fileName,
							fileUrl: file.fileUrl,
							mimeType: file.mimeType,
							fileSize: file.fileSize,
							order: file.order,
							metadata: file.metadata,
						})),
					},
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
					files: {
						orderBy: {
							order: "asc",
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
							character: true,
						},
					},
				},
			})
		}),

	// Update resource metadata (protected)
	// Note: Files cannot be updated, type and contentType are immutable
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
					...(data.title !== undefined && { title: data.title }),
					...(data.description !== undefined && {
						description: data.description,
					}),
					...(data.thumbnailUrl !== undefined && {
						thumbnailUrl: data.thumbnailUrl,
					}),
					...(tagIds !== undefined && {
						tags: {
							deleteMany: {},
							create: tagIds.map((tagId) => ({
								tagId,
							})),
						},
					}),
					...(characterIds !== undefined && {
						characters: {
							deleteMany: {},
							create: characterIds.map((characterId) => ({
								characterId,
							})),
						},
					}),
				},
				include: {
					files: {
						orderBy: {
							order: "asc",
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
							character: true,
						},
					},
				},
			})
		}),

	// Delete resource and all associated files (protected)
	delete: protectedProcedure
		.input(z.object({ id: z.string() }))
		.mutation(async ({ ctx, input }) => {
			// Verify ownership
			const resource = await ctx.prisma.resource.findUnique({
				where: { id: input.id },
				select: {
					uploaderId: true,
					files: {
						select: {
							fileUrl: true,
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

			if (resource.uploaderId !== ctx.session.user.id) {
				throw new TRPCError({
					code: "FORBIDDEN",
					message: "You can only delete your own resources",
				})
			}

			// Delete resource from database (files will be automatically deleted due to onDelete: Cascade)
			await ctx.prisma.resource.delete({
				where: { id: input.id },
			})

			// Delete physical files from storage
			const fileUrls = resource.files.map((f) => f.fileUrl)
			await deleteFiles(fileUrls)

			return { success: true }
		}),

	// Get file by ID
	getFileById: publicProcedure
		.input(z.object({ id: z.string() }))
		.query(async ({ ctx, input }) => {
			const file = await ctx.prisma.resourceFile.findUnique({
				where: { id: input.id },
				include: {
					resource: {
						select: {
							id: true,
							title: true,
							type: true,
							contentType: true,
						},
					},
				},
			})

			if (!file) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "File not found",
				})
			}

			return file
		}),

	// Get statistics
	getStats: publicProcedure.query(async ({ ctx }) => {
		const [totalResources, byType, byContentType, recentUploads] =
			await Promise.all([
				ctx.prisma.resource.count(),
				ctx.prisma.resource.groupBy({
					by: ["type"],
					_count: true,
				}),
				ctx.prisma.resource.groupBy({
					by: ["contentType"],
					_count: true,
					where: {
						contentType: {
							not: null,
						},
					},
				}),
				ctx.prisma.resource.findMany({
					take: 10,
					orderBy: {
						createdAt: "desc",
					},
					select: {
						id: true,
						title: true,
						type: true,
						contentType: true,
						thumbnailUrl: true,
						createdAt: true,
						uploader: {
							select: {
								name: true,
								image: true,
							},
						},
					},
				}),
			])

		return {
			total: totalResources,
			byType,
			byContentType,
			recentUploads,
		}
	}),
})
