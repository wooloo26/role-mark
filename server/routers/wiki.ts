/**
 * Wiki router - handles all wiki page operations
 */

import { TRPCError } from "@trpc/server"
import { z } from "zod"
import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc"

const createWikiPageSchema = z.object({
	title: z.string().min(1).max(500),
	content: z.string(),
	aiSuggestionEnabled: z.boolean().default(false),
	characterIds: z.array(z.string()).default([]),
})

const updateWikiPageSchema = z.object({
	id: z.string(),
	title: z.string().min(1).max(500).optional(),
	content: z.string().optional(),
	aiSuggestionEnabled: z.boolean().optional(),
	characterIds: z.array(z.string()).optional(),
})

const wikiSearchSchema = z.object({
	title: z.string().optional(),
	content: z.string().optional(),
	characterId: z.string().optional(),
	limit: z.number().min(1).max(100).default(20),
	offset: z.number().min(0).default(0),
})

export const wikiRouter = createTRPCRouter({
	// Get wiki page by ID
	getById: publicProcedure
		.input(z.object({ id: z.string() }))
		.query(async ({ ctx, input }) => {
			const wikiPage = await ctx.prisma.wikiPage.findUnique({
				where: { id: input.id },
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
					versions: {
						orderBy: {
							version: "desc",
						},
						take: 10,
					},
				},
			})

			if (!wikiPage) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Wiki page not found",
				})
			}

			return wikiPage
		}),

	// Search/list wiki pages
	search: publicProcedure
		.input(wikiSearchSchema)
		.query(async ({ ctx, input }) => {
			const where: {
				title?: { contains: string; mode: "insensitive" }
				content?: { contains: string; mode: "insensitive" }
				characters?: { some: { characterId: string } }
			} = {}

			if (input.title) {
				where.title = {
					contains: input.title,
					mode: "insensitive",
				}
			}

			if (input.content) {
				where.content = {
					contains: input.content,
					mode: "insensitive",
				}
			}

			if (input.characterId) {
				where.characters = {
					some: {
						characterId: input.characterId,
					},
				}
			}

			const [wikiPages, total] = await Promise.all([
				ctx.prisma.wikiPage.findMany({
					where,
					take: input.limit,
					skip: input.offset,
					orderBy: {
						updatedAt: "desc",
					},
					include: {
						author: {
							select: {
								id: true,
								name: true,
								image: true,
							},
						},
						_count: {
							select: {
								characters: true,
								versions: true,
							},
						},
					},
				}),
				ctx.prisma.wikiPage.count({ where }),
			])

			return {
				wikiPages,
				total,
				hasMore: input.offset + input.limit < total,
			}
		}),

	// Create wiki page (protected)
	create: protectedProcedure
		.input(createWikiPageSchema)
		.mutation(async ({ ctx, input }) => {
			const { characterIds, ...data } = input

			const wikiPage = await ctx.prisma.wikiPage.create({
				data: {
					...data,
					authorId: ctx.session.user.id,
					characters: {
						create: characterIds.map((characterId) => ({
							characterId,
						})),
					},
					versions: {
						create: {
							title: data.title,
							content: data.content,
							version: 1,
						},
					},
				},
				include: {
					characters: {
						include: {
							character: true,
						},
					},
					versions: true,
				},
			})

			return wikiPage
		}),

	// Update wiki page (protected)
	update: protectedProcedure
		.input(updateWikiPageSchema)
		.mutation(async ({ ctx, input }) => {
			const { id, characterIds, ...data } = input

			// Get current wiki page
			const currentPage = await ctx.prisma.wikiPage.findUnique({
				where: { id },
				select: {
					authorId: true,
					title: true,
					content: true,
					versions: {
						orderBy: { version: "desc" },
						take: 1,
					},
				},
			})

			if (!currentPage) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Wiki page not found",
				})
			}

			// Create new version if content or title changed
			const shouldCreateVersion =
				data.content !== undefined || data.title !== undefined
			const nextVersion = (currentPage.versions[0]?.version || 0) + 1

			return await ctx.prisma.wikiPage.update({
				where: { id },
				data: {
					...(data.title && { title: data.title }),
					...(data.content && { content: data.content }),
					...(data.aiSuggestionEnabled !== undefined && {
						aiSuggestionEnabled: data.aiSuggestionEnabled,
					}),
					...(characterIds && {
						characters: {
							deleteMany: {},
							create: characterIds.map((characterId) => ({
								characterId,
							})),
						},
					}),
					...(shouldCreateVersion && {
						versions: {
							create: {
								title: data.title || currentPage.title,
								content: data.content || currentPage.content,
								version: nextVersion,
							},
						},
					}),
				},
				include: {
					characters: {
						include: {
							character: true,
						},
					},
					versions: {
						orderBy: { version: "desc" },
						take: 10,
					},
				},
			})
		}),

	// Delete wiki page (protected)
	delete: protectedProcedure
		.input(z.object({ id: z.string() }))
		.mutation(async ({ ctx, input }) => {
			// Verify ownership
			const wikiPage = await ctx.prisma.wikiPage.findUnique({
				where: { id: input.id },
				select: { authorId: true },
			})

			if (!wikiPage) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Wiki page not found",
				})
			}

			if (wikiPage.authorId !== ctx.session.user.id) {
				throw new TRPCError({
					code: "FORBIDDEN",
					message: "You can only delete your own wiki pages",
				})
			}

			return await ctx.prisma.wikiPage.delete({
				where: { id: input.id },
			})
		}),

	// Get wiki page version
	getVersion: publicProcedure
		.input(
			z.object({
				wikiPageId: z.string(),
				version: z.number().int().positive(),
			}),
		)
		.query(async ({ ctx, input }) => {
			const version = await ctx.prisma.wikiPageVersion.findUnique({
				where: {
					wikiPageId_version: {
						wikiPageId: input.wikiPageId,
						version: input.version,
					},
				},
			})

			if (!version) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Version not found",
				})
			}

			return version
		}),
})
