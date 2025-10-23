import { existsSync } from "node:fs"
import { mkdir, rename, unlink } from "node:fs/promises"
import path from "node:path"
import { ContentType } from "@prisma/client"
import sharp from "sharp"

export const UPLOAD_BASE_DIR = path.join("C:/Space/storage.v2", "uploads")
export const TEMP_UPLOAD_DIR = path.join(UPLOAD_BASE_DIR, "temp")
export const AVATAR_DIR = path.join(UPLOAD_BASE_DIR, "avatars")
export const PORTRAIT_DIR = path.join(UPLOAD_BASE_DIR, "portraits")
export const THUMBNAIL_DIR = path.join(UPLOAD_BASE_DIR, "thumbnails")

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

/**
 * Generate a thumbnail for an image file
 * @param fileUrl - URL of the source image (e.g., /uploads/temp/image.jpg)
 * @param maxWidth - Maximum width of the thumbnail (default: 400)
 * @param maxHeight - Maximum height of the thumbnail (default: 400)
 * @returns Thumbnail URL in thumbnails directory
 */
export async function generateImageThumbnail(
	fileUrl: string,
	maxWidth = 400,
	maxHeight = 400,
): Promise<string> {
	try {
		// Extract path from URL
		const relativePath = fileUrl.replace(/^\/uploads\//, "")
		const sourcePath = path.join(UPLOAD_BASE_DIR, relativePath)

		// Security check
		if (!sourcePath.startsWith(UPLOAD_BASE_DIR)) {
			throw new Error("Invalid file path")
		}

		// Check if source file exists
		if (!existsSync(sourcePath)) {
			throw new Error("Source file not found")
		}

		// Ensure thumbnail directory exists
		await ensureDir(THUMBNAIL_DIR)

		// Generate thumbnail filename
		const ext = path.extname(sourcePath)
		const basename = path.basename(sourcePath, ext)
		const thumbnailFilename = `${basename}_thumb.webp`
		const thumbnailPath = path.join(THUMBNAIL_DIR, thumbnailFilename)

		// Generate thumbnail using sharp
		await sharp(sourcePath)
			.resize(maxWidth, maxHeight, {
				fit: "inside",
				withoutEnlargement: true,
			})
			.webp({ quality: 80 })
			.toFile(thumbnailPath)

		return `/uploads/thumbnails/${thumbnailFilename}`
	} catch (error) {
		console.error(error, { operation: "generateImageThumbnail", fileUrl })
		throw error
	}
}

/**
 * Generate a thumbnail from a video file's first frame
 * Note: This is a placeholder. Full implementation would require ffmpeg or similar.
 * For now, we'll return null to indicate video thumbnails are not yet supported.
 * @param fileUrl - URL of the source video
 * @returns Thumbnail URL or null if not supported
 */
export async function generateVideoThumbnail(
	fileUrl: string,
): Promise<string | null> {
	// TODO: Implement video thumbnail generation using ffmpeg
	// This would require:
	// 1. Install ffmpeg-static package
	// 2. Extract frame from video at specific timestamp
	// 3. Convert frame to image thumbnail using sharp
	console.warn("Video thumbnail generation not yet implemented", { fileUrl })
	return null
}

/**
 * Generate a thumbnail for a resource file based on its MIME type
 * @param fileUrl - URL of the source file
 * @param mimeType - MIME type of the file
 * @returns Thumbnail URL or null if thumbnail cannot be generated
 */
export async function generateThumbnail(
	fileUrl: string,
	mimeType: string,
): Promise<string | null> {
	try {
		if (mimeType.startsWith("image/")) {
			return await generateImageThumbnail(fileUrl)
		}
		if (mimeType.startsWith("video/")) {
			return await generateVideoThumbnail(fileUrl)
		}
		// For other file types, no thumbnail
		return null
	} catch (error) {
		console.error(error, { operation: "generateThumbnail", fileUrl, mimeType })
		return null
	}
}
