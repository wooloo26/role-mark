import { z } from "zod";

// ============================================
// Validation Schemas
// ============================================

// User Settings Schema
export const userSettingsSchema = z.object({
	theme: z.enum(["light", "dark"]).or(z.string()).optional(),
	showNSFW: z.boolean().optional(),
});

// Character Static Tags Schema
export const characterStaticTagsSchema = z.object({
	height: z.number().positive().optional(),
	weight: z.number().positive().optional(),
	birthday: z.string().optional(), // ISO date string
});

// Character Schemas
export const createCharacterSchema = z.object({
	name: z.string().min(1).max(100),
	avatarUrl: z.url().optional(),
	portraitUrl: z.url().optional(),
	info: z.string().max(5000).optional(),
	staticTags: characterStaticTagsSchema.optional(),
	dynamicTags: z.array(z.string().min(1).max(50)).max(50).optional(),
});

export const updateCharacterSchema = createCharacterSchema.partial();

export const characterSearchSchema = z.object({
	name: z.string().optional(),
	dynamicTags: z.array(z.string()).optional(),
	staticTags: z
		.object({
			heightMin: z.number().positive().optional(),
			heightMax: z.number().positive().optional(),
			weightMin: z.number().positive().optional(),
			weightMax: z.number().positive().optional(),
		})
		.optional(),
});

// Character Relation Schema
export const createCharacterRelationSchema = z.object({
	fromCharacterId: z.cuid(),
	toCharacterId: z.cuid(),
	relationType: z.string().min(1).max(50),
	isBidirectional: z.boolean().optional(),
});

// Resource Schemas
export const createResourceSchema = z.object({
	title: z.string().min(1).max(200),
	fileUrl: z.url(),
	mimeType: z.string().min(1),
	uploaderId: z.cuid().optional(),
	dynamicTags: z.array(z.string().min(1).max(50)).max(50).optional(),
	characterIds: z.array(z.cuid()).optional(),
});

export const resourceSearchSchema = z.object({
	title: z.string().optional(),
	mimeType: z.string().optional(),
	dynamicTags: z.array(z.string()).optional(),
	characterId: z.cuid().optional(),
});

// Wiki Page Schemas
export const createWikiPageSchema = z.object({
	title: z.string().min(1).max(200),
	content: z.string().min(1),
	authorId: z.cuid().optional(),
	aiSuggestionEnabled: z.boolean().optional(),
	characterIds: z.array(z.cuid()).optional(),
});

export const updateWikiPageSchema = z.object({
	title: z.string().min(1).max(200).optional(),
	content: z.string().min(1).optional(),
	aiSuggestionEnabled: z.boolean().optional(),
});

export const wikiPageSearchSchema = z.object({
	title: z.string().optional(),
	content: z.string().optional(),
	characterId: z.cuid().optional(),
	authorId: z.cuid().optional(),
});

// Comment Schemas
export const createCommentSchema = z.object({
	content: z.string().min(1).max(2000),
	authorId: z.cuid(),
	characterIds: z.array(z.cuid()).min(1),
});

// User Schemas
export const updateUserSettingsSchema = userSettingsSchema;

// ============================================
// Validation Helpers
// ============================================

export function validateCharacterStaticTags(tags: unknown): boolean {
	const result = characterStaticTagsSchema.safeParse(tags);
	return result.success;
}

export function validateUserSettings(settings: unknown): boolean {
	const result = userSettingsSchema.safeParse(settings);
	return result.success;
}

// ============================================
// Type Exports (inferred from schemas)
// ============================================

export type ValidatedCharacterCreate = z.infer<typeof createCharacterSchema>;
export type ValidatedCharacterUpdate = z.infer<typeof updateCharacterSchema>;
export type ValidatedCharacterSearch = z.infer<typeof characterSearchSchema>;
export type ValidatedCharacterRelationCreate = z.infer<
	typeof createCharacterRelationSchema
>;
export type ValidatedResourceCreate = z.infer<typeof createResourceSchema>;
export type ValidatedResourceSearch = z.infer<typeof resourceSearchSchema>;
export type ValidatedWikiPageCreate = z.infer<typeof createWikiPageSchema>;
export type ValidatedWikiPageUpdate = z.infer<typeof updateWikiPageSchema>;
export type ValidatedWikiPageSearch = z.infer<typeof wikiPageSearchSchema>;
export type ValidatedCommentCreate = z.infer<typeof createCommentSchema>;
export type ValidatedUserSettings = z.infer<typeof userSettingsSchema>;
export type ValidatedCharacterStaticTags = z.infer<
	typeof characterStaticTagsSchema
>;
