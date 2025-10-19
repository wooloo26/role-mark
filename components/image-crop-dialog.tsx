"use client"

import { useRef, useState } from "react"
import ReactCrop, {
	type Crop,
	centerCrop,
	makeAspectCrop,
	type PixelCrop,
} from "react-image-crop"
import "react-image-crop/dist/ReactCrop.css"
import { Button } from "@/components/ui/button"
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog"

interface ImageCropDialogProps {
	open: boolean
	onOpenChange: (open: boolean) => void
	imageSrc: string
	onCropComplete: (croppedImageBlob: Blob) => void
	aspectRatio?: number
	cropShape?: "rect" | "round"
	title?: string
	description?: string
}

/**
 * Creates a cropped image from the given image and crop area
 */
async function getCroppedImg(
	image: HTMLImageElement,
	crop: PixelCrop,
	circularCrop = false,
): Promise<Blob> {
	const canvas = document.createElement("canvas")
	const ctx = canvas.getContext("2d")

	if (!ctx) {
		throw new Error("Could not get canvas context")
	}

	const scaleX = image.naturalWidth / image.width
	const scaleY = image.naturalHeight / image.height

	// Set canvas size to match the crop area
	canvas.width = crop.width * scaleX
	canvas.height = crop.height * scaleY

	// If circular crop, create a circle clipping path
	if (circularCrop) {
		ctx.beginPath()
		ctx.arc(
			canvas.width / 2,
			canvas.height / 2,
			Math.min(canvas.width, canvas.height) / 2,
			0,
			2 * Math.PI,
		)
		ctx.clip()
	}

	// Draw the cropped image
	ctx.drawImage(
		image,
		crop.x * scaleX,
		crop.y * scaleY,
		crop.width * scaleX,
		crop.height * scaleY,
		0,
		0,
		canvas.width,
		canvas.height,
	)

	// Convert canvas to blob
	return new Promise((resolve, reject) => {
		canvas.toBlob((blob) => {
			if (!blob) {
				reject(new Error("Canvas is empty"))
				return
			}
			resolve(blob)
		}, "image/jpeg")
	})
}

/**
 * Helper to create initial centered crop
 */
function centerAspectCrop(
	mediaWidth: number,
	mediaHeight: number,
	aspect: number,
): Crop {
	return centerCrop(
		makeAspectCrop(
			{
				unit: "%",
				width: 90,
			},
			aspect,
			mediaWidth,
			mediaHeight,
		),
		mediaWidth,
		mediaHeight,
	)
}

export function ImageCropDialog({
	open,
	onOpenChange,
	imageSrc,
	onCropComplete,
	aspectRatio = 1,
	cropShape = "rect",
	title = "Crop Image",
	description = "Adjust the crop area to select the desired portion of the image",
}: ImageCropDialogProps) {
	const imgRef = useRef<HTMLImageElement>(null)
	const [crop, setCrop] = useState<Crop>()
	const [completedCrop, setCompletedCrop] = useState<PixelCrop>()
	const [isProcessing, setIsProcessing] = useState(false)

	const onImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
		const { width, height } = e.currentTarget
		setCrop(centerAspectCrop(width, height, aspectRatio))
	}

	const handleCropConfirm = async () => {
		if (!completedCrop || !imgRef.current) return

		try {
			setIsProcessing(true)
			const croppedImageBlob = await getCroppedImg(
				imgRef.current,
				completedCrop,
				cropShape === "round",
			)
			onCropComplete(croppedImageBlob)
			onOpenChange(false)
		} catch (error) {
			console.error("Error cropping image:", error)
		} finally {
			setIsProcessing(false)
		}
	}

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-3xl">
				<DialogHeader>
					<DialogTitle>{title}</DialogTitle>
					<DialogDescription>{description}</DialogDescription>
				</DialogHeader>

				<div className="space-y-4">
					{/* Cropper Container */}
					<div className="relative w-full flex justify-center bg-muted rounded-lg overflow-hidden">
						<ReactCrop
							crop={crop}
							onChange={(c: Crop) => setCrop(c)}
							onComplete={(c: PixelCrop) => setCompletedCrop(c)}
							aspect={aspectRatio}
							circularCrop={cropShape === "round"}
						>
							{/* biome-ignore lint/performance/noImgElement: react-image-crop requires native img element */}
							<img
								ref={imgRef}
								src={imageSrc}
								onLoad={onImageLoad}
								alt="Crop preview"
								style={{ maxHeight: "400px" }}
							/>
						</ReactCrop>
					</div>
				</div>

				<DialogFooter>
					<Button
						type="button"
						variant="outline"
						onClick={() => onOpenChange(false)}
						disabled={isProcessing}
					>
						Cancel
					</Button>
					<Button
						type="button"
						onClick={handleCropConfirm}
						disabled={isProcessing}
					>
						{isProcessing ? "Processing..." : "Crop Image"}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	)
}
