/**
 * User router - handles user settings and profile operations
 */

import { TRPCError } from "@trpc/server"
import { hash } from "bcryptjs"
import { z } from "zod"
import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc"

const registerSchema = z.object({
	name: z.string().min(1).max(255),
	email: z.email(),
	password: z.string().min(6),
})

const updateSettingsSchema = z.object({
	showNSFW: z.boolean().optional(),
	theme: z
		.object({
			colorTheme: z.enum(["light", "dark", "system"]).optional(),
			componentTheme: z
				.object({
					radius: z.enum(["none", "sm", "md", "lg", "xl"]).optional(),
					fontSize: z.enum(["xs", "sm", "base", "lg", "xl"]).optional(),
					cardStyle: z.enum(["flat", "bordered", "elevated"]).optional(),
					reducedMotion: z.boolean().optional(),
				})
				.optional(),
		})
		.optional(),
})

const updateProfileSchema = z.object({
	name: z.string().min(1).max(255).optional(),
	image: z.string().optional(),
})

export const userRouter = createTRPCRouter({
	// Register new user
	register: publicProcedure
		.input(registerSchema)
		.mutation(async ({ ctx, input }) => {
			// Check if user already exists
			const existingUser = await ctx.prisma.user.findUnique({
				where: { email: input.email },
			})

			if (existingUser) {
				throw new TRPCError({
					code: "CONFLICT",
					message: "User with this email already exists",
				})
			}

			// Hash password
			const hashedPassword = await hash(input.password, 10)

			// Create user
			const user = await ctx.prisma.user.create({
				data: {
					name: input.name,
					email: input.email,
					password: hashedPassword,
				},
				select: {
					id: true,
					name: true,
					email: true,
				},
			})

			return user
		}),

	// Get current user profile
	getProfile: protectedProcedure.query(async ({ ctx }) => {
		return await ctx.prisma.user.findUnique({
			where: { id: ctx.session.user.id },
			select: {
				id: true,
				name: true,
				email: true,
				image: true,
				settings: true,
				createdAt: true,
				_count: {
					select: {
						comments: true,
						resources: true,
						wikiPages: true,
					},
				},
			},
		})
	}),

	// Update user settings
	updateSettings: protectedProcedure
		.input(updateSettingsSchema)
		.mutation(async ({ ctx, input }) => {
			const currentUser = await ctx.prisma.user.findUnique({
				where: { id: ctx.session.user.id },
				select: { settings: true },
			})

			const currentSettings = (currentUser?.settings as typeof input) || {}
			const mergedSettings = {
				...currentSettings,
				...(input.showNSFW !== undefined && { showNSFW: input.showNSFW }),
				...(input.theme && {
					theme: {
						...(currentSettings.theme || {}),
						...input.theme,
					},
				}),
			}
			return await ctx.prisma.user.update({
				where: { id: ctx.session.user.id },
				data: {
					settings: mergedSettings,
				},
				select: {
					id: true,
					settings: true,
				},
			})
		}),

	// Update user profile
	updateProfile: protectedProcedure
		.input(updateProfileSchema)
		.mutation(async ({ ctx, input }) => {
			return await ctx.prisma.user.update({
				where: { id: ctx.session.user.id },
				data: {
					...(input.name && { name: input.name }),
					...(input.image && { image: input.image }),
				},
				select: {
					id: true,
					name: true,
					email: true,
					image: true,
				},
			})
		}),

	// Get user statistics
	getStats: protectedProcedure.query(async ({ ctx }) => {
		const [commentCount, resourceCount, wikiPageCount] = await Promise.all([
			ctx.prisma.comment.count({
				where: { authorId: ctx.session.user.id },
			}),
			ctx.prisma.resource.count({
				where: { uploaderId: ctx.session.user.id },
			}),
			ctx.prisma.wikiPage.count({
				where: { authorId: ctx.session.user.id },
			}),
		])

		return {
			commentCount,
			resourceCount,
			wikiPageCount,
		}
	}),

	// Soft delete user account
	softDelete: protectedProcedure.mutation(async ({ ctx }) => {
		// Soft delete the user by setting deletedAt timestamp
		const deletedUser = await ctx.prisma.user.update({
			where: { id: ctx.session.user.id },
			data: { deletedAt: new Date() },
			select: {
				id: true,
				email: true,
				deletedAt: true,
			},
		})

		return {
			success: true,
			message: "Account successfully soft deleted",
			user: deletedUser,
		}
	}),

	// Restore soft deleted user account (admin only or self-restore within grace period)
	restore: protectedProcedure
		.input(z.object({ userId: z.string().optional() }))
		.mutation(async ({ ctx, input }) => {
			const userId = input.userId || ctx.session.user.id

			// Check if user exists and is soft deleted
			const user = await ctx.prisma.user.findFirst({
				where: {
					id: userId,
					deletedAt: { not: null },
				},
			})

			if (!user) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "User not found or not deleted",
				})
			}

			// Restore the user by setting deletedAt to null
			const restoredUser = await ctx.prisma.user.update({
				where: { id: userId },
				data: { deletedAt: null },
				select: {
					id: true,
					email: true,
					name: true,
					deletedAt: true,
				},
			})

			return {
				success: true,
				message: "Account successfully restored",
				user: restoredUser,
			}
		}),

	// Permanently delete user account (hard delete)
	hardDelete: protectedProcedure
		.input(z.object({ confirmEmail: z.string().email() }))
		.mutation(async ({ ctx, input }) => {
			// Get current user
			const currentUser = await ctx.prisma.user.findUnique({
				where: { id: ctx.session.user.id },
				select: { email: true, deletedAt: true },
			})

			if (!currentUser) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "User not found",
				})
			}

			// Verify email confirmation
			if (currentUser.email !== input.confirmEmail) {
				throw new TRPCError({
					code: "BAD_REQUEST",
					message: "Email confirmation does not match",
				})
			}

			// Optionally require the account to be soft deleted first
			if (!currentUser.deletedAt) {
				throw new TRPCError({
					code: "PRECONDITION_FAILED",
					message: "Account must be soft deleted before permanent deletion",
				})
			}

			// Permanently delete the user
			await ctx.prisma.user.delete({
				where: { id: ctx.session.user.id },
			})

			return {
				success: true,
				message: "Account permanently deleted",
			}
		}),
})
