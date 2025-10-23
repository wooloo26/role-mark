/**
 * File upload API endpoint
 * Handles file uploads for resources using Formidable
 */

import { randomUUID } from "node:crypto"
import { existsSync } from "node:fs"
import { mkdir, rename } from "node:fs/promises"
import path from "node:path"
import { Readable } from "node:stream"
import type { File as FormidableFile } from "formidable"
import formidable from "formidable"
import type { NextRequest } from "next/server"
import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

// Temporary upload directory
const TEMP_UPLOAD_DIR = path.join("C:/Space/storage.v2", "uploads", "temp")

// Configure max file size (50MB)
export const config = {
	api: {
		bodyParser: false,
	},
}

const MAX_FILE_SIZE = 1024 * 1024 * 1024 // 1GB

export async function POST(request: NextRequest) {
	try {
		// Check authentication
		const session = await getServerSession(authOptions)
		if (!session?.user) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
		}

		// Parse form data using formidable
		const { files } = await parseForm(request)

		// Extract files array (formidable returns files as an object)
		const fileList = files.files as
			| FormidableFile[]
			| FormidableFile
			| undefined

		if (!fileList || (Array.isArray(fileList) && fileList.length === 0)) {
			return NextResponse.json({ error: "No files provided" }, { status: 400 })
		}

		// Normalize to array
		const filesArray = Array.isArray(fileList) ? fileList : [fileList]

		// Process each file
		const uploadedFiles: {
			fileName: string
			fileUrl: string
			mimeType: string
			fileSize: number
		}[] = []

		for (const file of filesArray) {
			// Get original filename and extension
			const ext = getFileExtension(file.originalFilename || "")
			const uniqueFilename = `${path.basename(file.filepath)}${ext}`
			const newFilepath = path.join(TEMP_UPLOAD_DIR, uniqueFilename)

			// Rename file to include extension
			await rename(file.filepath, newFilepath)

			uploadedFiles.push({
				fileName: file.originalFilename || uniqueFilename,
				fileUrl: `/uploads/temp/${uniqueFilename}`,
				mimeType: file.mimetype || "application/octet-stream",
				fileSize: file.size,
			})
		}

		return NextResponse.json({
			success: true,
			files: uploadedFiles,
		})
	} catch (error) {
		console.error(error, { operation: "file_upload" })
		return NextResponse.json(
			{ error: "Failed to upload files" },
			{ status: 500 },
		)
	}
}

// Parse form data using Formidable
async function parseForm(request: NextRequest): Promise<{
	fields: formidable.Fields
	files: formidable.Files
}> {
	// Ensure upload directory exists
	await ensureUploadDir()

	// Create formidable instance
	const form = formidable({
		uploadDir: TEMP_UPLOAD_DIR,
		keepExtensions: false,
		maxFileSize: MAX_FILE_SIZE,
		multiples: true,
		filename: () => {
			// Generate unique filename (extension will be added later)
			return randomUUID()
		},
	})

	// Convert NextRequest to Node.js IncomingMessage-like object
	const arrayBuffer = await request.arrayBuffer()
	const buffer = Buffer.from(arrayBuffer)

	// Create a readable stream from the buffer
	const stream = new Readable()
	stream.push(buffer)
	stream.push(null)

	// Add required properties for formidable
	const nodeRequest = Object.assign(stream, {
		headers: Object.fromEntries(request.headers.entries()),
		method: request.method,
	})

	// Parse the form
	return new Promise((resolve, reject) => {
		form.parse(nodeRequest as never, (err, fields, files) => {
			if (err) reject(err)
			else resolve({ fields, files })
		})
	})
}

// Ensure upload directory exists
async function ensureUploadDir() {
	if (!existsSync(TEMP_UPLOAD_DIR)) {
		await mkdir(TEMP_UPLOAD_DIR, { recursive: true })
	}
}

// Get file extension and validate
function getFileExtension(filename: string): string {
	const ext = path.extname(filename).toLowerCase()
	return ext
}
