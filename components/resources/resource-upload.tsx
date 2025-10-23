"use client"

import { ContentType, ResourceType } from "@prisma/client"
import { FileIcon, FolderArchive, Upload, X } from "lucide-react"
import { useRef, useState } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

interface UploadedFile {
	fileName: string
	fileUrl: string
	mimeType: string
	fileSize: number
	order: number
}

interface ResourceUploadProps {
	value: UploadedFile[]
	onChange: (
		files: UploadedFile[],
		type: ResourceType,
		contentType: ContentType | null,
	) => void
	uploadMode: "single" | "file-array" | "folder"
	onUploadModeChange: (mode: "single" | "file-array" | "folder") => void
	className?: string
}

/**
 * Auto-detect content type from MIME type
 */
function detectContentType(mimeType: string): ContentType {
	if (mimeType.startsWith("image/")) return ContentType.IMAGE
	if (mimeType.startsWith("video/")) return ContentType.VIDEO
	return ContentType.OTHER
}

/**
 * Determine if a file is an archive
 */
function isArchiveFile(mimeType: string, fileName: string): boolean {
	const archiveMimes = [
		"application/zip",
		"application/x-zip-compressed",
		"application/x-rar-compressed",
		"application/x-7z-compressed",
		"application/x-tar",
		"application/gzip",
	]
	const archiveExtensions = [".zip", ".rar", ".7z", ".tar", ".gz", ".tgz"]

	return (
		archiveMimes.includes(mimeType) ||
		archiveExtensions.some((ext) => fileName.toLowerCase().endsWith(ext))
	)
}

export function ResourceUpload({
	value,
	onChange,
	uploadMode,
	onUploadModeChange,
	className,
}: ResourceUploadProps) {
	const [isUploading, setIsUploading] = useState(false)
	const fileInputRef = useRef<HTMLInputElement>(null)

	const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const files = e.target.files
		if (!files || files.length === 0) return

		setIsUploading(true)

		try {
			const formData = new FormData()

			// For folder mode, only accept archive files
			if (uploadMode === "folder") {
				const file = files[0]
				if (!isArchiveFile(file.type, file.name)) {
					toast.error(
						"Folder uploads only accept archive files (.zip, .rar, .7z, etc.)",
					)
					setIsUploading(false)
					return
				}
				formData.append("files", file)
			} else {
				// Single-file or file-array mode: accept multiple files
				for (let i = 0; i < files.length; i++) {
					formData.append("files", files[i])
				}
			}

			const response = await fetch("/api/files/upload", {
				method: "POST",
				body: formData,
			})

			if (!response.ok) {
				throw new Error("Upload failed")
			}

			const data = (await response.json()) as {
				success: boolean
				files: Array<{
					fileName: string
					fileUrl: string
					mimeType: string
					fileSize: number
				}>
			}

			if (data.success && data.files) {
				const uploadedFiles: UploadedFile[] = data.files.map(
					(file, index: number) => ({
						fileName: file.fileName,
						fileUrl: file.fileUrl,
						mimeType: file.mimeType,
						fileSize: file.fileSize,
						order: index,
					}),
				)

				// Determine resource type and content type
				let resourceType: ResourceType
				let contentType: ContentType | null = null

				if (uploadMode === "folder") {
					resourceType = ResourceType.FOLDER
					contentType = null // Folders don't have content type
				} else if (uploadMode === "file-array") {
					resourceType = ResourceType.FILE_ARRAY
					// Detect content type from first file (assuming consistent types)
					contentType =
						uploadedFiles.length > 0
							? detectContentType(uploadedFiles[0].mimeType)
							: null
				} else {
					// Single mode
					resourceType = ResourceType.SINGLE_FILE
					contentType =
						uploadedFiles.length > 0
							? detectContentType(uploadedFiles[0].mimeType)
							: null
				}

				onChange(uploadedFiles, resourceType, contentType)
				toast.success(`Uploaded ${uploadedFiles.length} file(s)`)
			}
		} catch (error) {
			console.error("Upload error:", error)
			toast.error("Failed to upload files")
		} finally {
			setIsUploading(false)
			if (fileInputRef.current) {
				fileInputRef.current.value = ""
			}
		}
	}

	const handleRemoveFile = (index: number) => {
		const newFiles = value.filter((_, i) => i !== index)
		// Recalculate type and content type
		let resourceType: ResourceType
		let contentType: ContentType | null = null

		if (newFiles.length === 0) {
			// No files, keep current mode settings
			if (uploadMode === "folder") {
				resourceType = ResourceType.FOLDER
			} else if (uploadMode === "file-array") {
				resourceType = ResourceType.FILE_ARRAY
			} else {
				resourceType = ResourceType.SINGLE_FILE
			}
		} else if (uploadMode === "folder") {
			resourceType = ResourceType.FOLDER
			contentType = null
		} else if (uploadMode === "file-array") {
			resourceType = ResourceType.FILE_ARRAY
			contentType = detectContentType(newFiles[0].mimeType)
		} else {
			resourceType = ResourceType.SINGLE_FILE
			contentType = detectContentType(newFiles[0].mimeType)
		}

		onChange(newFiles, resourceType, contentType)
	}

	const formatFileSize = (bytes: number): string => {
		if (bytes < 1024) return `${bytes} B`
		if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
		if (bytes < 1024 * 1024 * 1024)
			return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
		return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`
	}

	return (
		<div className={cn("space-y-4", className)}>
			{/* Upload Mode Toggle */}
			<div className="flex gap-2">
				<Button
					type="button"
					variant={uploadMode === "single" ? "default" : "outline"}
					onClick={() => onUploadModeChange("single")}
					disabled={value.length > 0}
				>
					<FileIcon className="mr-2 h-4 w-4" />
					Single File
				</Button>
				<Button
					type="button"
					variant={uploadMode === "file-array" ? "default" : "outline"}
					onClick={() => onUploadModeChange("file-array")}
					disabled={value.length > 0}
				>
					<FileIcon className="mr-2 h-4 w-4" />
					File Array
				</Button>
				<Button
					type="button"
					variant={uploadMode === "folder" ? "default" : "outline"}
					onClick={() => onUploadModeChange("folder")}
					disabled={value.length > 0}
				>
					<FolderArchive className="mr-2 h-4 w-4" />
					Folder Archive
				</Button>
			</div>

			{/* Upload Area */}
			<div className="space-y-2">
				<Label>
					{uploadMode === "single"
						? "Upload Files (Multiple files will create separate resources)"
						: uploadMode === "file-array"
							? "Upload Files (All files will be in one resource)"
							: "Upload Folder Archive (.zip, .rar, etc.)"}
				</Label>
				<button
					type="button"
					className={cn(
						"w-full border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors",
						isUploading
							? "border-primary bg-primary/5"
							: "border-muted-foreground/25 hover:border-primary hover:bg-accent",
					)}
					onClick={() => fileInputRef.current?.click()}
					disabled={isUploading}
				>
					<input
						ref={fileInputRef}
						type="file"
						className="hidden"
						onChange={handleFileSelect}
						disabled={isUploading}
						multiple={uploadMode === "single" || uploadMode === "file-array"}
						accept={
							uploadMode === "folder" ? ".zip,.rar,.7z,.tar,.gz,.tgz" : "*"
						}
					/>
					<Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
					<p className="text-sm text-muted-foreground">
						{isUploading
							? "Uploading..."
							: "Click to select files or drag and drop"}
					</p>
					{uploadMode === "folder" && (
						<p className="text-xs text-muted-foreground mt-2">
							Only archive files accepted
						</p>
					)}
				</button>
			</div>

			{/* Uploaded Files List */}
			{value.length > 0 && (
				<div className="space-y-2">
					<Label>Uploaded Files ({value.length})</Label>
					<div className="space-y-2 max-h-60 overflow-y-auto">
						{value.map((file, index) => (
							<div
								key={index}
								className="flex items-center justify-between p-3 bg-muted rounded-lg"
							>
								<div className="flex-1 min-w-0 mr-4">
									<p className="text-sm font-medium truncate">
										{file.fileName}
									</p>
									<p className="text-xs text-muted-foreground">
										{file.mimeType} • {formatFileSize(file.fileSize)}
									</p>
								</div>
								<Button
									type="button"
									variant="ghost"
									size="sm"
									onClick={() => handleRemoveFile(index)}
									disabled={isUploading}
								>
									<X className="h-4 w-4" />
								</Button>
							</div>
						))}
					</div>
				</div>
			)}
		</div>
	)
}
