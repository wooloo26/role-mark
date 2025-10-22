"use client"

import { Upload, X } from "lucide-react"
import Image from "next/image"
import { useRef, useState } from "react"
import { ImageCropDialog } from "@/components/image-crop-dialog"
import { Button } from "@/components/ui/button"

interface ImageUploadWithCropProps {
	value?: string
	onChange: (value: string) => void
	aspectRatio?: number
	previewClassName?: string
	label?: string
}

export function ImageUploadWithCrop({
	value,
	onChange,
	aspectRatio,
	previewClassName = "w-32 h-32",
	label = "Upload Image",
}: ImageUploadWithCropProps) {
	const [imageToCrop, setImageToCrop] = useState<string | null>(null)
	const [cropDialogOpen, setCropDialogOpen] = useState(false)
	const [isUploading, setIsUploading] = useState(false)
	const fileInputRef = useRef<HTMLInputElement>(null)

	const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0]
		if (file) {
			// Check if file is an image
			if (!file.type.startsWith("image/")) {
				alert("Please select an image file")
				return
			}

			// Create a URL for the selected file
			const reader = new FileReader()
			reader.onload = () => {
				setImageToCrop(reader.result as string)
				setCropDialogOpen(true)
			}
			reader.readAsDataURL(file)
		}
		// Reset input to allow selecting the same file again
		e.target.value = ""
	}

	const handleCropComplete = async (croppedImageBlob: Blob) => {
		setIsUploading(true)
		try {
			// Create FormData and upload to server
			const formData = new FormData()
			formData.append("files", croppedImageBlob, "cropped-image.png")

			const response = await fetch("/api/files/upload", {
				method: "POST",
				body: formData,
			})

			if (!response.ok) {
				throw new Error("Upload failed")
			}

			const data = await response.json()
			if (data.success && data.files && data.files.length > 0) {
				// Use the fileUrl from the server response
				onChange(data.files[0].fileUrl)
			}
		} catch (error) {
			console.error("Failed to upload image:", error)
			alert("Failed to upload image. Please try again.")
		} finally {
			setIsUploading(false)
		}
	}

	const handleUploadClick = () => {
		fileInputRef.current?.click()
	}

	const handleClear = () => {
		onChange("")
	}

	return (
		<div className="space-y-4">
			<div className="flex gap-2">
				<Button
					type="button"
					variant="outline"
					onClick={handleUploadClick}
					className="flex-1"
					disabled={isUploading}
				>
					<Upload className="h-4 w-4 mr-2" />
					{isUploading ? "Uploading..." : value ? "Change Image" : label}
				</Button>
				{value && (
					<Button
						type="button"
						variant="outline"
						size="icon"
						onClick={handleClear}
						title="Clear image"
						disabled={isUploading}
					>
						<X className="h-4 w-4" />
					</Button>
				)}
			</div>

			{/* Image Preview */}
			{value && (
				<div className="flex items-center gap-2">
					<div
						className={`relative overflow-hidden border rounded-lg ${previewClassName}`}
					>
						<Image
							src={value}
							alt="Preview"
							fill
							className="object-cover"
							sizes="128px"
						/>
					</div>
					<p className="text-sm text-muted-foreground">Current image</p>
				</div>
			)}

			{/* Hidden file input */}
			<input
				ref={fileInputRef}
				type="file"
				accept="image/*"
				onChange={handleFileSelect}
				className="hidden"
			/>

			{/* Crop Dialog */}
			{imageToCrop && (
				<ImageCropDialog
					open={cropDialogOpen}
					onOpenChange={setCropDialogOpen}
					imageSrc={imageToCrop}
					onCropComplete={handleCropComplete}
					aspectRatio={aspectRatio}
				/>
			)}
		</div>
	)
}
