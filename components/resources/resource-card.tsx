import { ContentType, ResourceType } from "@prisma/client"
import {
	File,
	FileImage,
	FileVideo,
	Folder,
	Image as ImageIcon,
} from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card"

interface ResourceCardProps {
	resource: {
		id: string
		title: string
		description?: string | null
		type: ResourceType
		contentType?: ContentType | null
		thumbnailUrl?: string | null
		createdAt: Date
		_count?: {
			files: number
		}
		uploader?: {
			name: string | null
		} | null
		tags?: Array<{
			tag: {
				id: string
				name: string
			}
		}>
	}
}

const typeIcons = {
	[ResourceType.SINGLE_FILE]: File,
	[ResourceType.FILE_ARRAY]: FileImage,
	[ResourceType.FOLDER]: Folder,
}

const contentTypeIcons = {
	[ContentType.IMAGE]: ImageIcon,
	[ContentType.VIDEO]: FileVideo,
	[ContentType.OTHER]: File,
}

const typeLabels = {
	[ResourceType.SINGLE_FILE]: "Single File",
	[ResourceType.FILE_ARRAY]: "File Array",
	[ResourceType.FOLDER]: "Folder",
}

const contentTypeLabels = {
	[ContentType.IMAGE]: "Image",
	[ContentType.VIDEO]: "Video",
	[ContentType.OTHER]: "Other",
}

export function ResourceCard({ resource }: ResourceCardProps) {
	const TypeIcon = typeIcons[resource.type]
	const ContentIcon = resource.contentType
		? contentTypeIcons[resource.contentType]
		: null

	return (
		<Link href={`/resources/${resource.id}`}>
			<Card className="hover:border-primary/50 transition-all hover:shadow-md h-full">
				{/* Thumbnail */}
				{resource.thumbnailUrl ? (
					<div className="relative h-48 w-full overflow-hidden rounded-t-xl">
						<Image
							src={resource.thumbnailUrl}
							alt={resource.title}
							fill
							className="object-cover"
						/>
					</div>
				) : (
					<div className="relative h-48 w-full bg-muted rounded-t-xl flex items-center justify-center">
						<TypeIcon className="h-16 w-16 text-muted-foreground/50" />
					</div>
				)}

				<CardHeader>
					<div className="flex items-start justify-between gap-2">
						<CardTitle className="line-clamp-1">{resource.title}</CardTitle>
						<div className="flex gap-1 flex-shrink-0">
							<Badge variant="secondary" className="text-xs">
								{typeLabels[resource.type]}
							</Badge>
						</div>
					</div>
					{resource.description && (
						<CardDescription className="line-clamp-2">
							{resource.description}
						</CardDescription>
					)}
				</CardHeader>

				<CardContent className="space-y-2">
					{/* Content Type Badge */}
					{resource.contentType && ContentIcon && (
						<div className="flex items-center gap-2">
							<ContentIcon className="h-4 w-4 text-muted-foreground" />
							<span className="text-sm text-muted-foreground">
								{contentTypeLabels[resource.contentType]}
							</span>
						</div>
					)}

					{/* Tags */}
					{resource.tags && resource.tags.length > 0 && (
						<div className="flex flex-wrap gap-1">
							{resource.tags.slice(0, 3).map((tagRelation) => (
								<Badge
									key={tagRelation.tag.id}
									variant="outline"
									className="text-xs"
								>
									{tagRelation.tag.name}
								</Badge>
							))}
							{resource.tags.length > 3 && (
								<Badge variant="outline" className="text-xs">
									+{resource.tags.length - 3}
								</Badge>
							)}
						</div>
					)}
				</CardContent>

				<CardFooter className="text-xs text-muted-foreground">
					<div className="flex justify-between w-full">
						<span>
							{resource.uploader?.name
								? `By ${resource.uploader.name}`
								: "Unknown uploader"}
						</span>
						{resource._count && <span>{resource._count.files} file(s)</span>}
					</div>
				</CardFooter>
			</Card>
		</Link>
	)
}
