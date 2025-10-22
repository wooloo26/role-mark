/**
 * File utility functions
 * Helpers for file handling, validation, and processing
 */

import path from "node:path"
import { ContentType } from "@prisma/client"
import { logError } from "./logger"

// File size limits (in bytes)
export const FILE_SIZE_LIMITS = {
	[ContentType.IMAGE]: 1 * 1024 * 1024 * 1024, // 1GB
	[ContentType.VIDEO]: 10 * 1024 * 1024 * 1024, // 10GB
	[ContentType.OTHER]: 1 * 1024 * 1024 * 1024, // 1GB
}

// Allowed file extensions by content type
export const ALLOWED_EXTENSIONS = {
	[ContentType.IMAGE]: [".jpg", ".jpeg", ".png", ".gif", ".webp", ".svg"],
	[ContentType.VIDEO]: [".mp4", ".webm", ".ogg", ".mov"],
}

// MIME type validation
export const ALLOWED_MIME_TYPES = {
	[ContentType.IMAGE]: [
		"image/jpeg",
		"image/png",
		"image/gif",
		"image/webp",
		"image/svg+xml",
	],
	[ContentType.VIDEO]: [
		"video/mp4",
		"video/webm",
		"video/ogg",
		"video/quicktime",
	],
}

/**
 * Determine content type from MIME type
 */
export function getContentTypeFromMime(mimeType: string): ContentType {
	if (mimeType.startsWith("image/")) return ContentType.IMAGE
	if (mimeType.startsWith("video/")) return ContentType.VIDEO
	return ContentType.OTHER
}

/**
 * Validate file extension
 */
export function isValidFileExtension(
	filename: string,
	contentType: ContentType,
): boolean {
	const ext = path.extname(filename).toLowerCase()
	if (contentType === ContentType.OTHER) {
		return true
	}

	return ALLOWED_EXTENSIONS[contentType].includes(ext)
}

/**
 * Validate MIME type
 */
export function isValidMimeType(
	mimeType: string,
	contentType: ContentType,
): boolean {
	if (contentType === ContentType.OTHER) {
		return true
	}

	return ALLOWED_MIME_TYPES[contentType].includes(mimeType)
}

/**
 * Validate file size
 */
export function isValidFileSize(
	fileSize: number,
	contentType: ContentType,
): boolean {
	return fileSize <= FILE_SIZE_LIMITS[contentType]
}

/**
 * Generate safe filename
 */
export function generateSafeFilename(
	originalFilename: string,
	uuid: string,
): string {
	const ext = path.extname(originalFilename).toLowerCase()
	// Remove extension from original name and sanitize
	const baseName = path.basename(originalFilename, ext)
	const safeName = baseName.replace(/[^a-zA-Z0-9-_]/g, "_").substring(0, 50)
	return `${safeName}_${uuid}${ext}`
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
	if (bytes === 0) return "0 Bytes"

	const k = 1024
	const sizes = ["Bytes", "KB", "MB", "GB"]
	const i = Math.floor(Math.log(bytes) / Math.log(k))

	return `${Number.parseFloat((bytes / k ** i).toFixed(2))} ${sizes[i]}`
}

/**
 * Get image dimensions from buffer (basic check for common formats)
 */
export function getImageDimensions(
	buffer: Buffer,
): { width: number; height: number } | null {
	try {
		// PNG
		if (buffer.toString("hex", 0, 4) === "89504e47") {
			const width = buffer.readUInt32BE(16)
			const height = buffer.readUInt32BE(20)
			return { width, height }
		}

		// JPEG
		if (buffer.toString("hex", 0, 2) === "ffd8") {
			// JPEG parsing is more complex, returning null for now
			// In production, use a proper image library like 'sharp'
			return null
		}

		// GIF
		if (buffer.toString("ascii", 0, 3) === "GIF") {
			const width = buffer.readUInt16LE(6)
			const height = buffer.readUInt16LE(8)
			return { width, height }
		}

		return null
	} catch (error) {
		logError(error, { operation: "getImageDimensions" })
		return null
	}
}

/**
 * Validate and sanitize file path
 */
export function sanitizeFilePath(filepath: string): string | null {
	// Prevent path traversal
	if (filepath.includes("..") || filepath.includes("\\")) {
		return null
	}

	// Remove leading slashes
	const sanitized = filepath.replace(/^\/+/, "")

	// Check if path is valid
	if (!sanitized || sanitized.length === 0) {
		return null
	}

	return sanitized
}
