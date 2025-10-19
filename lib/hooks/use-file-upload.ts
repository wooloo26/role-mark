/**
 * File upload hook
 * React hook for uploading files to the file server
 */

import type { ContentType } from "@prisma/client"
import { useCallback, useState } from "react"

export interface UploadedFile {
	fileName: string
	fileUrl: string
	mimeType: string
	fileSize: number
	contentType: ContentType
}

export interface UploadProgress {
	file: File
	progress: number
	status: "pending" | "uploading" | "success" | "error"
	error?: string
}

export interface UseFileUploadOptions {
	onSuccess?: (files: UploadedFile[]) => void
	onError?: (error: Error) => void
	maxFileSize?: number
	allowedTypes?: string[]
}

export interface UseFileUploadReturn {
	upload: (files: File[]) => Promise<UploadedFile[] | null>
	uploadWithProgress: (files: File[]) => Promise<UploadedFile[] | null>
	uploading: boolean
	progress: UploadProgress[]
	error: Error | null
	reset: () => void
}

export function useFileUpload(
	options: UseFileUploadOptions = {},
): UseFileUploadReturn {
	const [uploading, setUploading] = useState(false)
	const [progress, setProgress] = useState<UploadProgress[]>([])
	const [error, setError] = useState<Error | null>(null)

	const reset = useCallback(() => {
		setUploading(false)
		setProgress([])
		setError(null)
	}, [])

	const validateFile = useCallback(
		(file: File): string | null => {
			// Check file size
			if (options.maxFileSize && file.size > options.maxFileSize) {
				return `File ${file.name} exceeds maximum size of ${options.maxFileSize / 1024 / 1024}MB`
			}

			// Check file type
			if (options.allowedTypes && !options.allowedTypes.includes(file.type)) {
				return `File type ${file.type} is not allowed`
			}

			return null
		},
		[options.maxFileSize, options.allowedTypes],
	)

	const upload = useCallback(
		async (files: File[]): Promise<UploadedFile[] | null> => {
			try {
				setUploading(true)
				setError(null)

				// Validate all files first
				for (const file of files) {
					const validationError = validateFile(file)
					if (validationError) {
						throw new Error(validationError)
					}
				}

				// Create form data
				const formData = new FormData()
				for (const file of files) {
					formData.append("files", file)
				}

				// Upload
				const response = await fetch("/api/files/upload", {
					method: "POST",
					body: formData,
				})

				if (!response.ok) {
					const errorData = await response.json()
					throw new Error(errorData.error || "Upload failed")
				}

				const result = await response.json()

				if (result.success && result.files) {
					options.onSuccess?.(result.files)
					return result.files
				}

				throw new Error("Upload failed")
			} catch (err) {
				const error = err instanceof Error ? err : new Error("Upload failed")
				setError(error)
				options.onError?.(error)
				return null
			} finally {
				setUploading(false)
			}
		},
		[validateFile, options],
	)

	const uploadWithProgress = useCallback(
		async (files: File[]): Promise<UploadedFile[] | null> => {
			try {
				setUploading(true)
				setError(null)

				// Initialize progress tracking
				const initialProgress: UploadProgress[] = files.map((file) => ({
					file,
					progress: 0,
					status: "pending",
				}))
				setProgress(initialProgress)

				// Validate all files first
				for (let i = 0; i < files.length; i++) {
					const file = files[i]
					const validationError = validateFile(file)
					if (validationError) {
						setProgress((prev) =>
							prev.map((p, idx) =>
								idx === i
									? { ...p, status: "error", error: validationError }
									: p,
							),
						)
						throw new Error(validationError)
					}
				}

				// Create form data
				const formData = new FormData()
				for (const file of files) {
					formData.append("files", file)
				}

				// Update all to uploading
				setProgress((prev) =>
					prev.map((p) => ({ ...p, status: "uploading", progress: 50 })),
				)

				// Upload
				const response = await fetch("/api/files/upload", {
					method: "POST",
					body: formData,
				})

				if (!response.ok) {
					const errorData = await response.json()
					throw new Error(errorData.error || "Upload failed")
				}

				const result = await response.json()

				if (result.success && result.files) {
					// Update all to success
					setProgress((prev) =>
						prev.map((p) => ({ ...p, status: "success", progress: 100 })),
					)

					options.onSuccess?.(result.files)
					return result.files
				}

				throw new Error("Upload failed")
			} catch (err) {
				const error = err instanceof Error ? err : new Error("Upload failed")
				setError(error)
				setProgress((prev) =>
					prev.map((p) =>
						p.status !== "error" ? { ...p, status: "error" } : p,
					),
				)
				options.onError?.(error)
				return null
			} finally {
				setUploading(false)
			}
		},
		[validateFile, options],
	)

	return {
		upload,
		uploadWithProgress,
		uploading,
		progress,
		error,
		reset,
	}
}
