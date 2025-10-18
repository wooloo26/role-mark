/**
 * User router - handles user settings and profile operations
 */
import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";

const updateSettingsSchema = z.object({
	showNSFW: z.boolean().optional(),
	theme: z
		.object({
			colorScheme: z.enum(["light", "dark", "custom"]).optional(),
			customColors: z.record(z.string(), z.string()).optional(),
			borderRadius: z.number().min(0).max(20).optional(),
			fontSize: z.number().min(12).max(24).optional(),
		})
		.optional(),
});

const updateProfileSchema = z.object({
	name: z.string().min(1).max(255).optional(),
	image: z.string().url().optional(),
});

export const userRouter = createTRPCRouter({
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
		});
	}),

	// Update user settings
	updateSettings: protectedProcedure
		.input(updateSettingsSchema)
		.mutation(async ({ ctx, input }) => {
			const currentUser = await ctx.prisma.user.findUnique({
				where: { id: ctx.session.user.id },
				select: { settings: true },
			});

			const currentSettings = (currentUser?.settings as any) || {};
			const mergedSettings = {
				...currentSettings,
				...(input.showNSFW !== undefined && { showNSFW: input.showNSFW }),
				...(input.theme && {
					theme: {
						...(currentSettings.theme || {}),
						...input.theme,
					},
				}),
			};

			return await ctx.prisma.user.update({
				where: { id: ctx.session.user.id },
				data: {
					settings: mergedSettings,
				},
				select: {
					id: true,
					settings: true,
				},
			});
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
			});
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
		]);

		return {
			commentCount,
			resourceCount,
			wikiPageCount,
		};
	}),
});
