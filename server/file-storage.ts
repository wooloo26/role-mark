/**
 * File storage service
 * Handles file system operations for resource files
 */

import { randomUUID } from "node:crypto"
import { existsSync } from "node:fs"
import { mkdir, readdir, unlink, writeFile } from "node:fs/promises"
import path from "node:path"
import type { ContentType } from "@prisma/client"
import {
	generateSafeFilename,
	getContentTypeFromMime,
	getImageDimensions,
} from "./file-utils"

const UPLOAD_BASE_DIR = path.join(process.cwd(), "public", "uploads")

export interface UploadFileOptions {
	buffer: Buffer
	originalFilename: string
	mimeType: string
	subfolder?: string // e.g., 'images', 'videos', 'documents'
}

export interface UploadedFileInfo {
	fileName: string
	fileUrl: string
	mimeType: string
	fileSize: number
	contentType: ContentType
	metadata?: {
		width?: number
		height?: number
		duration?: number
		[key: string]: unknown
	}
}

/**
 * Ensure upload directory exists
 */
async function ensureUploadDir(subfolder?: string): Promise<string> {
	const uploadDir = subfolder
		? path.join(UPLOAD_BASE_DIR, subfolder)
		: UPLOAD_BASE_DIR

	if (!existsSync(uploadDir)) {
		await mkdir(uploadDir, { recursive: true })
	}

	return uploadDir
}

/**
 * Upload a single file
 */
export async function uploadFile(
	options: UploadFileOptions,
): Promise<UploadedFileInfo> {
	const { buffer, originalFilename, mimeType, subfolder } = options

	// Generate unique filename
	const uuid = randomUUID()
	const safeFilename = generateSafeFilename(originalFilename, uuid)

	// Ensure directory exists
	const uploadDir = await ensureUploadDir(subfolder)

	// Write file
	const filepath = path.join(uploadDir, safeFilename)
	await writeFile(filepath, buffer)

	// Generate URL
	const fileUrl = subfolder
		? `/uploads/${subfolder}/${safeFilename}`
		: `/uploads/${safeFilename}`

	// Determine content type
	const contentType = getContentTypeFromMime(mimeType)

	// Extract metadata if image
	const metadata: UploadedFileInfo["metadata"] = {}
	if (contentType === "IMAGE") {
		const dimensions = getImageDimensions(buffer)
		if (dimensions) {
			metadata.width = dimensions.width
			metadata.height = dimensions.height
		}
	}

	return {
		fileName: originalFilename,
		fileUrl,
		mimeType,
		fileSize: buffer.length,
		contentType,
		metadata: Object.keys(metadata).length > 0 ? metadata : undefined,
	}
}

/**
 * Upload multiple files
 */
export async function uploadFiles(
	files: UploadFileOptions[],
): Promise<UploadedFileInfo[]> {
	const uploadPromises = files.map((file) => uploadFile(file))
	return await Promise.all(uploadPromises)
}

/**
 * Delete a file
 */
export async function deleteFile(fileUrl: string): Promise<boolean> {
	try {
		// Extract path from URL (remove /uploads/ prefix)
		const relativePath = fileUrl.replace(/^\/uploads\//, "")
		const filepath = path.join(UPLOAD_BASE_DIR, relativePath)

		// Security check
		if (!filepath.startsWith(UPLOAD_BASE_DIR)) {
			console.error(
				"Attempt to delete file outside upload directory:",
				filepath,
			)
			return false
		}

		if (existsSync(filepath)) {
			await unlink(filepath)
			return true
		}

		return false
	} catch (error) {
		console.error("Error deleting file:", error)
		return false
	}
}

/**
 * Delete multiple files
 */
export async function deleteFiles(fileUrls: string[]): Promise<number> {
	const deletePromises = fileUrls.map((url) => deleteFile(url))
	const results = await Promise.all(deletePromises)
	return results.filter((success) => success).length
}

/**
 * Get disk usage for uploads
 */
export async function getUploadsDiskUsage(): Promise<{
	totalFiles: number
	totalSize: number
	bySubfolder: Record<string, { files: number; size: number }>
}> {
	const result = {
		totalFiles: 0,
		totalSize: 0,
		bySubfolder: {} as Record<string, { files: number; size: number }>,
	}

	try {
		if (!existsSync(UPLOAD_BASE_DIR)) {
			return result
		}

		const calculateSize = async (
			dir: string,
			subfolder?: string,
		): Promise<void> => {
			const entries = await readdir(dir, { withFileTypes: true })

			for (const entry of entries) {
				const fullPath = path.join(dir, entry.name)

				if (entry.isDirectory()) {
					await calculateSize(fullPath, entry.name)
				} else if (entry.isFile()) {
					const stat = await import("node:fs/promises").then((fs) =>
						fs.stat(fullPath),
					)
					result.totalFiles++
					result.totalSize += stat.size

					if (subfolder) {
						if (!result.bySubfolder[subfolder]) {
							result.bySubfolder[subfolder] = { files: 0, size: 0 }
						}
						result.bySubfolder[subfolder].files++
						result.bySubfolder[subfolder].size += stat.size
					}
				}
			}
		}

		await calculateSize(UPLOAD_BASE_DIR)
	} catch (error) {
		console.error("Error calculating disk usage:", error)
	}

	return result
}

/**
 * Clean up orphaned files (files not referenced in database)
 */
export async function cleanupOrphanedFiles(
	referencedUrls: string[],
): Promise<number> {
	try {
		const allFiles: string[] = []

		const collectFiles = async (dir: string, basePath = ""): Promise<void> => {
			const entries = await readdir(dir, { withFileTypes: true })

			for (const entry of entries) {
				if (entry.isDirectory()) {
					await collectFiles(
						path.join(dir, entry.name),
						path.join(basePath, entry.name),
					)
				} else if (entry.isFile()) {
					const fileUrl = `/uploads/${path.join(basePath, entry.name).replace(/\\/g, "/")}`
					allFiles.push(fileUrl)
				}
			}
		}

		await collectFiles(UPLOAD_BASE_DIR)

		// Find orphaned files
		const referencedSet = new Set(referencedUrls)
		const orphanedFiles = allFiles.filter((url) => !referencedSet.has(url))

		// Delete orphaned files
		const deletedCount = await deleteFiles(orphanedFiles)

		return deletedCount
	} catch (error) {
		console.error("Error cleaning up orphaned files:", error)
		return 0
	}
}
