/**
 * File upload API endpoint
 * Handles file uploads for resources
 */

import { randomUUID } from "node:crypto"
import { existsSync } from "node:fs"
import { mkdir, writeFile } from "node:fs/promises"
import path from "node:path"
import type { NextRequest } from "next/server"
import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { getContentTypeFromMime } from "@/lib/file-utils"

// Configure max file size (50MB)
export const config = {
	api: {
		bodyParser: false,
	},
}

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads")
const MAX_FILE_SIZE = 50 * 1024 * 1024 // 50MB

// Ensure upload directory exists
async function ensureUploadDir() {
	if (!existsSync(UPLOAD_DIR)) {
		await mkdir(UPLOAD_DIR, { recursive: true })
	}
}

// Get file extension and validate
function getFileExtension(filename: string): string {
	const ext = path.extname(filename).toLowerCase()
	return ext
}

export async function POST(request: NextRequest) {
	try {
		// Check authentication
		const session = await getServerSession(authOptions)
		if (!session?.user) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
		}

		// Get form data
		const formData = await request.formData()
		const files = formData.getAll("files") as File[]

		if (!files || files.length === 0) {
			return NextResponse.json({ error: "No files provided" }, { status: 400 })
		}

		// Ensure upload directory exists
		await ensureUploadDir()

		// Process each file
		const uploadedFiles = []

		for (const file of files) {
			// Validate file size
			if (file.size > MAX_FILE_SIZE) {
				return NextResponse.json(
					{
						error: `File ${file.name} exceeds maximum size of ${MAX_FILE_SIZE / 1024 / 1024}MB`,
					},
					{ status: 400 },
				)
			}

			// Generate unique filename
			const ext = getFileExtension(file.name)
			const uniqueFilename = `${randomUUID()}${ext}`
			const filepath = path.join(UPLOAD_DIR, uniqueFilename)

			// Convert file to buffer and write to disk
			const bytes = await file.arrayBuffer()
			const buffer = Buffer.from(bytes)
			await writeFile(filepath, buffer)

			// Prepare file info
			const fileUrl = `/uploads/${uniqueFilename}`
			const contentType = getContentTypeFromMime(file.type)

			uploadedFiles.push({
				fileName: file.name,
				fileUrl: fileUrl,
				mimeType: file.type,
				fileSize: file.size,
				contentType: contentType,
			})
		}

		return NextResponse.json({
			success: true,
			files: uploadedFiles,
		})
	} catch (error) {
		console.error("Upload error:", error)
		return NextResponse.json(
			{ error: "Failed to upload files" },
			{ status: 500 },
		)
	}
}
