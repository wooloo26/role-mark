import { existsSync } from "node:fs"
import { mkdir, rename, unlink } from "node:fs/promises"
import path from "node:path"
import { ContentType } from "@prisma/client"

export const UPLOAD_BASE_DIR = path.join("C:/Space/storage.v2", "uploads")
export const TEMP_UPLOAD_DIR = path.join(UPLOAD_BASE_DIR, "temp")
export const AVATAR_DIR = path.join(UPLOAD_BASE_DIR, "avatars")
export const PORTRAIT_DIR = path.join(UPLOAD_BASE_DIR, "portraits")

/**
 * Determine content type from MIME type
 */
export function getContentTypeFromMime(mimeType: string): ContentType {
	if (mimeType.startsWith("image/")) return ContentType.IMAGE
	if (mimeType.startsWith("video/")) return ContentType.VIDEO
	return ContentType.OTHER
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
			console.error("file_delete_attempt_outside_upload_dir", {
				filepath,
				fileUrl,
			})
			return false
		}

		if (existsSync(filepath)) {
			await unlink(filepath)
			return true
		}

		return false
	} catch (error) {
		console.error(error, { operation: "deleteFile", fileUrl })
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
 * Ensure a directory exists
 */
async function ensureDir(dir: string): Promise<void> {
	if (!existsSync(dir)) {
		await mkdir(dir, { recursive: true })
	}
}

/**
 * Move a temporary file to the avatar directory
 * @param tempFileUrl - Temporary file URL (e.g., /uploads/temp/filename.jpg)
 * @returns New file URL in avatars directory
 */
export async function moveFileToAvatarDir(
	tempFileUrl: string,
): Promise<string> {
	try {
		// Extract filename from temp URL
		const filename = path.basename(tempFileUrl)
		const tempPath = path.join(TEMP_UPLOAD_DIR, filename)

		// Security check
		if (!tempPath.startsWith(TEMP_UPLOAD_DIR)) {
			throw new Error("Invalid temp file path")
		}

		// Check if temp file exists
		if (!existsSync(tempPath)) {
			throw new Error("Temporary file not found")
		}

		// Ensure avatar directory exists
		await ensureDir(AVATAR_DIR)

		// Move file to avatar directory
		const newPath = path.join(AVATAR_DIR, filename)
		await rename(tempPath, newPath)

		return `/uploads/avatars/${filename}`
	} catch (error) {
		console.error(error, { operation: "moveFileToAvatarDir", tempFileUrl })
		throw error
	}
}

/**
 * Move a temporary file to the portrait directory
 * @param tempFileUrl - Temporary file URL (e.g., /uploads/temp/filename.jpg)
 * @returns New file URL in portraits directory
 */
export async function moveFileToPortraitDir(
	tempFileUrl: string,
): Promise<string> {
	try {
		// Extract filename from temp URL
		const filename = path.basename(tempFileUrl)
		const tempPath = path.join(TEMP_UPLOAD_DIR, filename)

		// Security check
		if (!tempPath.startsWith(TEMP_UPLOAD_DIR)) {
			throw new Error("Invalid temp file path")
		}

		// Check if temp file exists
		if (!existsSync(tempPath)) {
			throw new Error("Temporary file not found")
		}

		// Ensure portrait directory exists
		await ensureDir(PORTRAIT_DIR)

		// Move file to portrait directory
		const newPath = path.join(PORTRAIT_DIR, filename)
		await rename(tempPath, newPath)

		return `/uploads/portraits/${filename}`
	} catch (error) {
		console.error(error, { operation: "moveFileToPortraitDir", tempFileUrl })
		throw error
	}
}
