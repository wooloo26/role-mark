import { Prisma } from "@prisma/client";
import { prisma } from "./prisma";
import type {
	CharacterSearchFilters,
	CreateCharacterInput,
	CreateCharacterRelationInput,
	CreateCommentInput,
	CreateResourceInput,
	CreateWikiPageInput,
	ResourceSearchFilters,
	UpdateCharacterInput,
	WikiPageSearchFilters,
} from "./types/prisma";

// ============================================
// Character Operations
// ============================================

export async function getCharacterById(id: string) {
	return prisma.character.findUnique({
		where: { id },
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
			relationsFrom: {
				include: {
					toCharacter: true,
				},
			},
			relationsTo: {
				include: {
					fromCharacter: true,
				},
			},
		},
	});
}

export async function searchCharacters(filters: CharacterSearchFilters) {
	const where: Prisma.CharacterWhereInput = {};

	if (filters.name) {
		where.name = {
			contains: filters.name,
			mode: "insensitive",
		};
	}

	if (filters.dynamicTags && filters.dynamicTags.length > 0) {
		where.dynamicTags = {
			hasSome: filters.dynamicTags,
		};
	}

	// For static tags filtering, we'll need to use raw queries or complex JSON filtering
	// This is a simplified version
	if (filters.staticTags) {
		// You may want to implement more sophisticated JSON filtering
		where.staticTags = {
			path: [],
			not: Prisma.DbNull,
		};
	}

	return prisma.character.findMany({
		where,
		orderBy: {
			createdAt: "desc",
		},
	});
}

export async function createCharacter(data: CreateCharacterInput) {
	return prisma.character.create({
		data: data as Prisma.CharacterCreateInput,
	});
}

export async function updateCharacter(id: string, data: UpdateCharacterInput) {
	return prisma.character.update({
		where: { id },
		data: data as Prisma.CharacterUpdateInput,
	});
}

export async function deleteCharacter(id: string) {
	return prisma.character.delete({
		where: { id },
	});
}

// ============================================
// Character Relationship Operations
// ============================================

export async function createCharacterRelation(
	data: CreateCharacterRelationInput,
) {
	return prisma.characterRelation.create({
		data,
	});
}

export async function getCharacterRelations(characterId: string) {
	const relationsFrom = await prisma.characterRelation.findMany({
		where: { fromCharacterId: characterId },
		include: { toCharacter: true },
	});

	const relationsTo = await prisma.characterRelation.findMany({
		where: { toCharacterId: characterId },
		include: { fromCharacter: true },
	});

	return { relationsFrom, relationsTo };
}

// ============================================
// Resource Operations
// ============================================

export async function getResourceById(id: string) {
	return prisma.resource.findUnique({
		where: { id },
		include: {
			characters: {
				include: {
					character: true,
				},
			},
			uploader: true,
		},
	});
}

export async function searchResources(filters: ResourceSearchFilters) {
	const where: Prisma.ResourceWhereInput = {};

	if (filters.title) {
		where.title = {
			contains: filters.title,
			mode: "insensitive",
		};
	}

	if (filters.mimeType) {
		where.mimeType = {
			startsWith: filters.mimeType,
		};
	}

	if (filters.dynamicTags && filters.dynamicTags.length > 0) {
		where.dynamicTags = {
			hasSome: filters.dynamicTags,
		};
	}

	if (filters.characterId) {
		where.characters = {
			some: {
				characterId: filters.characterId,
			},
		};
	}

	return prisma.resource.findMany({
		where,
		orderBy: {
			createdAt: "desc",
		},
	});
}

export async function createResource(data: CreateResourceInput) {
	const { characterIds, ...resourceData } = data;

	return prisma.resource.create({
		data: {
			...resourceData,
			characters: characterIds
				? {
						create: characterIds.map((characterId) => ({ characterId })),
					}
				: undefined,
		},
	});
}

export async function deleteResource(id: string) {
	return prisma.resource.delete({
		where: { id },
	});
}

// ============================================
// Wiki Page Operations
// ============================================

export async function getWikiPageById(id: string) {
	return prisma.wikiPage.findUnique({
		where: { id },
		include: {
			author: true,
			characters: {
				include: {
					character: true,
				},
			},
			versions: {
				orderBy: {
					version: "desc",
				},
			},
		},
	});
}

export async function searchWikiPages(filters: WikiPageSearchFilters) {
	const where: Prisma.WikiPageWhereInput = {};

	if (filters.title) {
		where.title = {
			contains: filters.title,
			mode: "insensitive",
		};
	}

	if (filters.content) {
		where.content = {
			contains: filters.content,
			mode: "insensitive",
		};
	}

	if (filters.characterId) {
		where.characters = {
			some: {
				characterId: filters.characterId,
			},
		};
	}

	if (filters.authorId) {
		where.authorId = filters.authorId;
	}

	return prisma.wikiPage.findMany({
		where,
		orderBy: {
			updatedAt: "desc",
		},
	});
}

export async function createWikiPage(data: CreateWikiPageInput) {
	const { characterIds, ...wikiPageData } = data;

	return prisma.wikiPage.create({
		data: {
			...wikiPageData,
			characters: characterIds
				? {
						create: characterIds.map((characterId) => ({ characterId })),
					}
				: undefined,
			versions: {
				create: {
					title: wikiPageData.title,
					content: wikiPageData.content,
					version: 1,
				},
			},
		},
	});
}

export async function updateWikiPage(
	id: string,
	data: { title?: string; content?: string; aiSuggestionEnabled?: boolean },
) {
	// Get the current page to create a new version
	const currentPage = await prisma.wikiPage.findUnique({
		where: { id },
		include: {
			versions: {
				orderBy: {
					version: "desc",
				},
				take: 1,
			},
		},
	});

	if (!currentPage) {
		throw new Error("Wiki page not found");
	}

	const latestVersion = currentPage.versions[0]?.version ?? 0;

	return prisma.wikiPage.update({
		where: { id },
		data: {
			...data,
			versions: {
				create: {
					title: data.title ?? currentPage.title,
					content: data.content ?? currentPage.content,
					version: latestVersion + 1,
				},
			},
		},
	});
}

export async function deleteWikiPage(id: string) {
	return prisma.wikiPage.delete({
		where: { id },
	});
}

// ============================================
// Comment Operations
// ============================================

export async function createComment(data: CreateCommentInput) {
	const { characterIds, ...commentData } = data;

	return prisma.comment.create({
		data: {
			...commentData,
			characters: {
				create: characterIds.map((characterId) => ({ characterId })),
			},
		},
	});
}

export async function getCommentsByCharacter(characterId: string) {
	return prisma.comment.findMany({
		where: {
			characters: {
				some: {
					characterId,
				},
			},
		},
		include: {
			author: true,
		},
		orderBy: {
			createdAt: "desc",
		},
	});
}

export async function deleteComment(id: string, userId: string) {
	// Ensure the user owns the comment
	const comment = await prisma.comment.findUnique({
		where: { id },
	});

	if (!comment || comment.authorId !== userId) {
		throw new Error("Unauthorized to delete this comment");
	}

	return prisma.comment.delete({
		where: { id },
	});
}

// ============================================
// User Operations
// ============================================

export async function getUserByEmail(email: string) {
	return prisma.user.findUnique({
		where: { email },
	});
}

export async function getUserById(id: string) {
	return prisma.user.findUnique({
		where: { id },
	});
}

export async function updateUserSettings(
	userId: string,
	settings: Prisma.InputJsonValue,
) {
	return prisma.user.update({
		where: { id: userId },
		data: { settings },
	});
}
