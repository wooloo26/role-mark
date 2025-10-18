import type { Prisma } from "@prisma/client";

// ============================================
// Type Helpers for Static Tags
// ============================================

export type CharacterStaticTags = {
	height?: number;
	weight?: number;
	birthday?: string;
	[key: string]: unknown; // Allow additional custom fields
};

export type UserSettings = {
	theme?: "light" | "dark" | string;
	showNSFW?: boolean;
	[key: string]: unknown; // Allow additional custom settings
};

// ============================================
// Extended Prisma Types with Relations
// ============================================

export type CharacterWithRelations = Prisma.CharacterGetPayload<{
	include: {
		resources: {
			include: {
				resource: true;
			};
		};
		wikiPages: {
			include: {
				wikiPage: true;
			};
		};
		comments: {
			include: {
				comment: {
					include: {
						author: true;
					};
				};
			};
		};
		relationsFrom: {
			include: {
				toCharacter: true;
			};
		};
		relationsTo: {
			include: {
				fromCharacter: true;
			};
		};
	};
}>;

export type ResourceWithCharacters = Prisma.ResourceGetPayload<{
	include: {
		characters: {
			include: {
				character: true;
			};
		};
		uploader: true;
	};
}>;

export type WikiPageWithDetails = Prisma.WikiPageGetPayload<{
	include: {
		author: true;
		characters: {
			include: {
				character: true;
			};
		};
		versions: {
			orderBy: {
				version: "desc";
			};
			take: 1;
		};
	};
}>;

export type CommentWithDetails = Prisma.CommentGetPayload<{
	include: {
		author: true;
		characters: {
			include: {
				character: true;
			};
		};
	};
}>;

// ============================================
// Input Types for Creating/Updating Entities
// ============================================

export type CreateCharacterInput = {
	name: string;
	avatarUrl?: string;
	portraitUrl?: string;
	info?: string;
	staticTags?: CharacterStaticTags;
	dynamicTags?: string[];
};

export type UpdateCharacterInput = Partial<CreateCharacterInput>;

export type CreateResourceInput = {
	title: string;
	fileUrl: string;
	mimeType: string;
	uploaderId?: string;
	dynamicTags?: string[];
	characterIds?: string[];
};

export type CreateWikiPageInput = {
	title: string;
	content: string;
	authorId?: string;
	aiSuggestionEnabled?: boolean;
	characterIds?: string[];
};

export type CreateCommentInput = {
	content: string;
	authorId: string;
	characterIds: string[];
};

export type CreateCharacterRelationInput = {
	fromCharacterId: string;
	toCharacterId: string;
	relationType: string;
	isBidirectional?: boolean;
};

// ============================================
// Filter/Search Types
// ============================================

export type CharacterSearchFilters = {
	name?: string;
	dynamicTags?: string[];
	staticTags?: {
		heightMin?: number;
		heightMax?: number;
		weightMin?: number;
		weightMax?: number;
	};
};

export type ResourceSearchFilters = {
	title?: string;
	mimeType?: string;
	dynamicTags?: string[];
	characterId?: string;
};

export type WikiPageSearchFilters = {
	title?: string;
	content?: string;
	characterId?: string;
	authorId?: string;
};
