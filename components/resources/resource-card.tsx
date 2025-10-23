import { ContentType, ResourceType } from "@prisma/client"
import { FileIcon, FolderIcon, ImageIcon, VideoIcon } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import {
	Card,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card"
import { getFileApiUrl } from "@/lib/path"

interface ResourceCardProps {
	id: string
	title: string
	description?: string | null
	type: ResourceType
	contentType?: ContentType | null
	thumbnailUrl?: string | null
	files?: Array<{
		id: string
		fileName: string
		fileUrl: string
		mimeType: string
	}>
	tags?: Array<{
		tag: {
			id: string
			name: string
			pinned: boolean
			group?: {
				pinned: boolean
			} | null
		}
	}>
	_count?: {
		characters?: number
		files?: number
	}
	uploader?: {
		id: string
		name?: string | null
		image?: string | null
	}
	createdAt?: Date
}

function getResourceIcon(type: ResourceType, contentType?: ContentType | null) {
	if (type === ResourceType.FOLDER) {
		return <FolderIcon className="h-5 w-5" />
	}

	switch (contentType) {
		case ContentType.IMAGE:
			return <ImageIcon className="h-5 w-5" />
		case ContentType.VIDEO:
			return <VideoIcon className="h-5 w-5" />
		default:
			return <FileIcon className="h-5 w-5" />
	}
}

function getTypeLabel(type: ResourceType): string {
	switch (type) {
		case ResourceType.SINGLE_FILE:
			return "Single File"
		case ResourceType.FILE_ARRAY:
			return "File Array"
		case ResourceType.FOLDER:
			return "Folder"
	}
}

export function ResourceCard({
	id,
	title,
	description,
	type,
	contentType,
	thumbnailUrl,
	files,
	tags,
	_count,
	uploader,
	createdAt,
}: ResourceCardProps) {
	const pinnedTags =
		tags?.filter((rt) => rt.tag.pinned || rt.tag.group?.pinned) || []

	// Get preview image
	const previewFile = files?.[0]
	const previewUrl =
		thumbnailUrl ||
		(contentType === ContentType.IMAGE && previewFile
			? getFileApiUrl(previewFile.fileUrl)
			: null)

	return (
		<Link href={`/resources/${id}`}>
			<Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer overflow-hidden h-full">
				<CardHeader className="p-0 h-full flex flex-col">
					{/* Preview Image/Icon */}
					<div className="relative w-full h-48 bg-muted flex items-center justify-center overflow-hidden">
						{previewUrl ? (
							<Image
								src={previewUrl}
								alt={title}
								fill
								className="object-cover group-hover:scale-105 transition-transform duration-300"
							/>
						) : (
							<div className="text-muted-foreground">
								{getResourceIcon(type, contentType)}
							</div>
						)}

						{/* Type Badge */}
						<div className="absolute top-2 left-2">
							<Badge variant="secondary" className="text-xs">
								{getTypeLabel(type)}
							</Badge>
						</div>

						{/* Content Type Badge */}
						{contentType && (
							<div className="absolute top-2 right-2">
								<Badge variant="default" className="text-xs">
									{contentType}
								</Badge>
							</div>
						)}
					</div>

					{/* Content */}
					<div className="p-4 flex-1 flex flex-col">
						<CardTitle className="line-clamp-2 text-lg mb-2">{title}</CardTitle>

						{description && (
							<CardDescription className="line-clamp-2 mb-3">
								{description}
							</CardDescription>
						)}

						{/* Tags */}
						{pinnedTags.length > 0 && (
							<div className="flex flex-wrap gap-1 mb-3">
								{pinnedTags.slice(0, 3).map((rt) => (
									<Badge key={rt.tag.id} variant="outline" className="text-xs">
										{rt.tag.name}
									</Badge>
								))}
								{pinnedTags.length > 3 && (
									<Badge variant="outline" className="text-xs">
										+{pinnedTags.length - 3}
									</Badge>
								)}
							</div>
						)}

						{/* Meta Info */}
						<div className="mt-auto pt-3 border-t text-xs text-muted-foreground space-y-1">
							{_count && (
								<div className="flex items-center justify-between">
									{_count.files !== undefined && (
										<span>
											{_count.files} file{_count.files !== 1 ? "s" : ""}
										</span>
									)}
									{_count.characters !== undefined && _count.characters > 0 && (
										<span>
											{_count.characters} character
											{_count.characters !== 1 ? "s" : ""}
										</span>
									)}
								</div>
							)}
							{uploader && <div>Uploaded by {uploader.name || "Unknown"}</div>}
							{createdAt && (
								<div>{new Date(createdAt).toLocaleDateString()}</div>
							)}
						</div>
					</div>
				</CardHeader>
			</Card>
		</Link>
	)
}
