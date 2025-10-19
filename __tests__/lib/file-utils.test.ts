/**
 * Unit tests for file-utils.ts
 * Uses jest-mock-extended for mocking
 */

import { describe, expect, it } from "@jest/globals"
import { ContentType } from "@prisma/client"
import {
	ALLOWED_EXTENSIONS,
	ALLOWED_MIME_TYPES,
	FILE_SIZE_LIMITS,
	formatFileSize,
	generateSafeFilename,
	getContentTypeFromMime,
	getImageDimensions,
	isValidFileExtension,
	isValidFileSize,
	isValidMimeType,
	sanitizeFilePath,
} from "@/lib/file-utils"

describe("file-utils", () => {
	describe("getContentTypeFromMime", () => {
		it("should return IMAGE for image mime types", () => {
			expect(getContentTypeFromMime("image/jpeg")).toBe(ContentType.IMAGE)
			expect(getContentTypeFromMime("image/png")).toBe(ContentType.IMAGE)
			expect(getContentTypeFromMime("image/gif")).toBe(ContentType.IMAGE)
		})

		it("should return VIDEO for video mime types", () => {
			expect(getContentTypeFromMime("video/mp4")).toBe(ContentType.VIDEO)
			expect(getContentTypeFromMime("video/webm")).toBe(ContentType.VIDEO)
		})

		it("should return OTHER for unknown mime types", () => {
			expect(getContentTypeFromMime("application/pdf")).toBe(ContentType.OTHER)
			expect(getContentTypeFromMime("text/plain")).toBe(ContentType.OTHER)
		})
	})

	describe("isValidFileExtension", () => {
		it("should validate image extensions", () => {
			expect(isValidFileExtension("image.jpg", ContentType.IMAGE)).toBe(true)
			expect(isValidFileExtension("image.png", ContentType.IMAGE)).toBe(true)
			expect(isValidFileExtension("image.gif", ContentType.IMAGE)).toBe(true)
		})

		it("should validate video extensions", () => {
			expect(isValidFileExtension("video.mp4", ContentType.VIDEO)).toBe(true)
			expect(isValidFileExtension("video.webm", ContentType.VIDEO)).toBe(true)
		})

		it("should reject invalid extensions", () => {
			expect(isValidFileExtension("file.exe", ContentType.IMAGE)).toBe(false)
			expect(isValidFileExtension("file.txt", ContentType.VIDEO)).toBe(false)
		})

		it("should be case-insensitive", () => {
			expect(isValidFileExtension("image.JPG", ContentType.IMAGE)).toBe(true)
			expect(isValidFileExtension("video.MP4", ContentType.VIDEO)).toBe(true)
		})

		it("should allow any extension for OTHER content type", () => {
			expect(isValidFileExtension("file.pdf", ContentType.OTHER)).toBe(true)
			expect(isValidFileExtension("file.txt", ContentType.OTHER)).toBe(true)
		})
	})

	describe("isValidMimeType", () => {
		it("should validate image mime types", () => {
			expect(isValidMimeType("image/jpeg", ContentType.IMAGE)).toBe(true)
			expect(isValidMimeType("image/png", ContentType.IMAGE)).toBe(true)
		})

		it("should validate video mime types", () => {
			expect(isValidMimeType("video/mp4", ContentType.VIDEO)).toBe(true)
			expect(isValidMimeType("video/webm", ContentType.VIDEO)).toBe(true)
		})

		it("should reject invalid mime types", () => {
			expect(isValidMimeType("application/exe", ContentType.IMAGE)).toBe(false)
			expect(isValidMimeType("text/plain", ContentType.VIDEO)).toBe(false)
		})

		it("should allow any mime type for OTHER content type", () => {
			expect(isValidMimeType("application/pdf", ContentType.OTHER)).toBe(true)
			expect(isValidMimeType("text/plain", ContentType.OTHER)).toBe(true)
		})
	})

	describe("isValidFileSize", () => {
		it("should validate file sizes within limits", () => {
			expect(isValidFileSize(1024, ContentType.IMAGE)).toBe(true)
			expect(
				isValidFileSize(FILE_SIZE_LIMITS[ContentType.IMAGE], ContentType.IMAGE),
			).toBe(true)
		})

		it("should reject files that are too large", () => {
			expect(
				isValidFileSize(
					FILE_SIZE_LIMITS[ContentType.IMAGE] + 1,
					ContentType.IMAGE,
				),
			).toBe(false)
			expect(
				isValidFileSize(
					FILE_SIZE_LIMITS[ContentType.VIDEO] + 1,
					ContentType.VIDEO,
				),
			).toBe(false)
		})
	})

	describe("sanitizeFilePath", () => {
		it("should prevent path traversal", () => {
			expect(sanitizeFilePath("../etc/passwd")).toBeNull()
			expect(sanitizeFilePath("some\\path\\file.txt")).toBeNull()
		})

		it("should remove leading slashes", () => {
			expect(sanitizeFilePath("/uploads/file.jpg")).toBe("uploads/file.jpg")
			expect(sanitizeFilePath("//uploads/file.jpg")).toBe("uploads/file.jpg")
		})

		it("should handle valid paths", () => {
			expect(sanitizeFilePath("uploads/file.jpg")).toBe("uploads/file.jpg")
			expect(sanitizeFilePath("images/avatars/user123.png")).toBe(
				"images/avatars/user123.png",
			)
		})

		it("should reject empty paths", () => {
			expect(sanitizeFilePath("")).toBeNull()
			expect(sanitizeFilePath("/")).toBeNull()
		})
	})

	describe("generateSafeFilename", () => {
		it("should generate safe filename with UUID", () => {
			const result = generateSafeFilename("my file.jpg", "abc123")
			expect(result).toBe("my_file_abc123.jpg")
		})

		it("should remove special characters", () => {
			const result = generateSafeFilename("file<>name!@#.png", "uuid")
			expect(result).toBe("file__name____uuid.png")
		})

		it("should truncate long filenames", () => {
			const longName = `${"a".repeat(100)}.jpg`
			const result = generateSafeFilename(longName, "uuid")
			expect(result.length).toBeLessThanOrEqual(60) // 50 chars + uuid + extension
		})
	})

	describe("formatFileSize", () => {
		it("should format bytes correctly", () => {
			expect(formatFileSize(0)).toBe("0 Bytes")
			expect(formatFileSize(500)).toBe("500 Bytes")
		})

		it("should format KB correctly", () => {
			expect(formatFileSize(1024)).toBe("1 KB")
			expect(formatFileSize(2048)).toBe("2 KB")
		})

		it("should format MB correctly", () => {
			expect(formatFileSize(1024 * 1024)).toBe("1 MB")
			expect(formatFileSize(5 * 1024 * 1024)).toBe("5 MB")
		})

		it("should format GB correctly", () => {
			expect(formatFileSize(1024 * 1024 * 1024)).toBe("1 GB")
			expect(formatFileSize(2.5 * 1024 * 1024 * 1024)).toBe("2.5 GB")
		})
	})

	describe("getImageDimensions", () => {
		it("should parse PNG dimensions", () => {
			// PNG header with 100x100 dimensions
			const pngBuffer = Buffer.from([
				0x89,
				0x50,
				0x4e,
				0x47,
				0x0d,
				0x0a,
				0x1a,
				0x0a,
				0x00,
				0x00,
				0x00,
				0x0d,
				0x49,
				0x48,
				0x44,
				0x52,
				0x00,
				0x00,
				0x00,
				0x64, // width: 100
				0x00,
				0x00,
				0x00,
				0x64, // height: 100
			])
			const result = getImageDimensions(pngBuffer)
			expect(result).toEqual({ width: 100, height: 100 })
		})

		it("should parse GIF dimensions", () => {
			// GIF header with 200x150 dimensions
			const gifBuffer = Buffer.from([
				0x47,
				0x49,
				0x46,
				0x38,
				0x39,
				0x61, // GIF89a
				0xc8,
				0x00, // width: 200 (little-endian)
				0x96,
				0x00, // height: 150 (little-endian)
			])
			const result = getImageDimensions(gifBuffer)
			expect(result).toEqual({ width: 200, height: 150 })
		})

		it("should return null for JPEG (not implemented)", () => {
			const jpegBuffer = Buffer.from([0xff, 0xd8, 0xff])
			const result = getImageDimensions(jpegBuffer)
			expect(result).toBeNull()
		})

		it("should return null for invalid buffers", () => {
			const invalidBuffer = Buffer.from([0x00, 0x00, 0x00])
			const result = getImageDimensions(invalidBuffer)
			expect(result).toBeNull()
		})
	})

	describe("constants", () => {
		it("should have correct file size limits", () => {
			expect(FILE_SIZE_LIMITS[ContentType.IMAGE]).toBe(1 * 1024 * 1024 * 1024) // 1GB
			expect(FILE_SIZE_LIMITS[ContentType.VIDEO]).toBe(10 * 1024 * 1024 * 1024) // 10GB
			expect(FILE_SIZE_LIMITS[ContentType.OTHER]).toBe(1 * 1024 * 1024 * 1024) // 1GB
		})

		it("should have allowed extensions defined", () => {
			expect(ALLOWED_EXTENSIONS[ContentType.IMAGE]).toContain(".jpg")
			expect(ALLOWED_EXTENSIONS[ContentType.VIDEO]).toContain(".mp4")
		})

		it("should have allowed mime types defined", () => {
			expect(ALLOWED_MIME_TYPES[ContentType.IMAGE]).toContain("image/jpeg")
			expect(ALLOWED_MIME_TYPES[ContentType.VIDEO]).toContain("video/mp4")
		})
	})
})
