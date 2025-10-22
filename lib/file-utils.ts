import { existsSync } from "node:fs"
import { unlink } from "node:fs/promises"
import path from "node:path"
import { ContentType } from "@prisma/client"

export const UPLOAD_BASE_DIR = path.join(process.cwd(), "public", "uploads")

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
