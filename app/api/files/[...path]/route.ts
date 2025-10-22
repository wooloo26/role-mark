/**
 * File serving API endpoint
 * Serves uploaded files with proper headers and access control
 */

import { existsSync } from "node:fs"
import { readFile, stat } from "node:fs/promises"
import path from "node:path"
import type { NextRequest } from "next/server"
import { NextResponse } from "next/server"
import { logError, logSecurityEvent } from "@/server/logger"

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads")

// MIME type mapping
const MIME_TYPES: Record<string, string> = {
	".jpg": "image/jpeg",
	".jpeg": "image/jpeg",
	".png": "image/png",
	".gif": "image/gif",
	".webp": "image/webp",
	".svg": "image/svg+xml",
	".mp4": "video/mp4",
	".webm": "video/webm",
	".ogg": "video/ogg",
	".pdf": "application/pdf",
	".zip": "application/zip",
	".txt": "text/plain",
	".json": "application/json",
}

function getMimeType(filename: string): string {
	const ext = path.extname(filename).toLowerCase()
	return MIME_TYPES[ext] || "application/octet-stream"
}

export async function GET(
	_request: NextRequest,
	{ params }: { params: Promise<{ path: string[] }> },
) {
	try {
		const { path: pathSegments } = await params
		const filename = pathSegments.join("/")

		// Security: prevent path traversal
		if (filename.includes("..") || filename.includes("\\")) {
			logSecurityEvent("file_access_path_traversal_attempt", { filename })
			return NextResponse.json({ error: "Invalid file path" }, { status: 400 })
		}

		const filepath = path.join(UPLOAD_DIR, filename)

		// Check if file exists
		if (!existsSync(filepath)) {
			return NextResponse.json({ error: "File not found" }, { status: 404 })
		}

		// Get file stats
		const fileStats = await stat(filepath)

		// Read file
		const fileBuffer = await readFile(filepath)

		// Determine MIME type
		const mimeType = getMimeType(filename)

		// Create response with proper headers
		const response = new NextResponse(fileBuffer as unknown as BodyInit, {
			status: 200,
			headers: {
				"Content-Type": mimeType,
				"Content-Length": fileStats.size.toString(),
				"Cache-Control": "public, max-age=31536000, immutable",
				"Content-Disposition": `inline; filename="${path.basename(filename)}"`,
			},
		})

		return response
	} catch (error) {
		logError(error, { operation: "file_serving" })
		return NextResponse.json({ error: "Failed to serve file" }, { status: 500 })
	}
}

export async function HEAD(
	_request: NextRequest,
	{ params }: { params: Promise<{ path: string[] }> },
) {
	try {
		const { path: pathSegments } = await params
		const filename = pathSegments.join("/")

		// Security: prevent path traversal
		if (filename.includes("..") || filename.includes("\\")) {
			logSecurityEvent("file_head_path_traversal_attempt", { filename })
			return new NextResponse(null, { status: 400 })
		}

		const filepath = path.join(UPLOAD_DIR, filename)

		// Check if file exists
		if (!existsSync(filepath)) {
			return new NextResponse(null, { status: 404 })
		}

		// Get file stats
		const fileStats = await stat(filepath)
		const mimeType = getMimeType(filename)

		// Return headers only
		return new NextResponse(null, {
			status: 200,
			headers: {
				"Content-Type": mimeType,
				"Content-Length": fileStats.size.toString(),
				"Cache-Control": "public, max-age=31536000, immutable",
			},
		})
	} catch (error) {
		logError(error, { operation: "file_head" })
		return new NextResponse(null, { status: 500 })
	}
}
