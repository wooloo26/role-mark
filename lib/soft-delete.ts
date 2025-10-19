/**
 * Soft delete utility functions
 * Provides reusable helpers for soft delete operations across models
 */

import { prisma } from "./prisma"

type SoftDeleteModel =
	| "user"
	| "comment"
	| "character"
	| "resource"
	| "resourceFile"
	| "wikiPage"
type WhereClause = Record<string, unknown>

interface ModelDelegate {
	update: (args: {
		where: { id: string }
		data: { deletedAt: Date | null }
	}) => Promise<unknown>
	updateMany: (args: {
		where: WhereClause
		data: { deletedAt: Date | null }
	}) => Promise<unknown>
	deleteMany: (args: { where: WhereClause }) => Promise<unknown>
	findMany: (args: { where: WhereClause }) => Promise<unknown[]>
	findFirst: (args: {
		where: { id: string }
		select: { deletedAt: true }
	}) => Promise<{ deletedAt: Date | null } | null>
	count: (args: { where: WhereClause }) => Promise<number>
}

/**
 * Soft delete a record by setting deletedAt timestamp
 */
export async function softDelete(model: SoftDeleteModel, id: string) {
	const modelClient = prisma[model] as unknown as ModelDelegate
	return await modelClient.update({
		where: { id },
		data: { deletedAt: new Date() },
	})
}

/**
 * Soft delete multiple records
 */
export async function softDeleteMany(
	model: SoftDeleteModel,
	where: WhereClause,
) {
	const modelClient = prisma[model] as unknown as ModelDelegate
	return await modelClient.updateMany({
		where,
		data: { deletedAt: new Date() },
	})
}

/**
 * Restore a soft deleted record
 */
export async function restore(model: SoftDeleteModel, id: string) {
	const modelClient = prisma[model] as unknown as ModelDelegate
	return await modelClient.update({
		where: { id },
		data: { deletedAt: null },
	})
}

/**
 * Restore multiple soft deleted records
 */
export async function restoreMany(model: SoftDeleteModel, where: WhereClause) {
	const modelClient = prisma[model] as unknown as ModelDelegate
	return await modelClient.updateMany({
		where,
		data: { deletedAt: null },
	})
}

/**
 * Permanently delete a record (hard delete)
 */
export async function hardDelete(model: SoftDeleteModel, id: string) {
	const modelClient = prisma[model] as unknown as ModelDelegate
	// First remove the middleware effect by using deleteMany with specific condition
	return await modelClient.deleteMany({
		where: { id, deletedAt: { not: null } },
	})
}

/**
 * Find soft deleted records
 */
export async function findDeleted(model: SoftDeleteModel, where?: WhereClause) {
	const modelClient = prisma[model] as unknown as ModelDelegate
	return await modelClient.findMany({
		where: {
			...where,
			deletedAt: { not: null },
		},
	})
}

/**
 * Check if a record is soft deleted
 */
export async function isDeleted(
	model: SoftDeleteModel,
	id: string,
): Promise<boolean> {
	const modelClient = prisma[model] as unknown as ModelDelegate
	const record = await modelClient.findFirst({
		where: { id },
		select: { deletedAt: true },
	})
	return record?.deletedAt !== null && record?.deletedAt !== undefined
}

/**
 * Get count of soft deleted records
 */
export async function countDeleted(
	model: SoftDeleteModel,
	where?: WhereClause,
): Promise<number> {
	const modelClient = prisma[model] as unknown as ModelDelegate
	return await modelClient.count({
		where: {
			...where,
			deletedAt: { not: null },
		},
	})
}

/**
 * Permanently delete old soft deleted records (cleanup utility)
 * @param model - The model to clean up
 * @param daysOld - Delete records soft deleted more than this many days ago
 */
export async function cleanupOldDeleted(
	model: SoftDeleteModel,
	daysOld: number = 30,
) {
	const cutoffDate = new Date()
	cutoffDate.setDate(cutoffDate.getDate() - daysOld)

	const modelClient = prisma[model] as unknown as ModelDelegate
	return await modelClient.deleteMany({
		where: {
			deletedAt: {
				not: null,
				lt: cutoffDate,
			},
		},
	})
}
