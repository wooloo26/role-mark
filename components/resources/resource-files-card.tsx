import { ContentType, ResourceType } from "@prisma/client"
import { File, FileImage, Folder } from "lucide-react"
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card"

interface ResourceFilesCardProps {
	type: ResourceType
	contentType?: ContentType | null
	files: Array<{
		id: string
		fileName: string
		fileUrl: string
		mimeType: string
		fileSize?: number | null
		order: number
	}>
}

const typeIcons = {
	[ResourceType.SINGLE_FILE]: File,
	[ResourceType.FILE_ARRAY]: FileImage,
	[ResourceType.FOLDER]: Folder,
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

function formatFileSize(bytes?: number | null): string {
	if (!bytes) return "Unknown size"
	if (bytes < 1024) return `${bytes} B`
	if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`
	if (bytes < 1024 * 1024 * 1024)
		return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
	return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`
}

export function ResourceFilesCard({
	type,
	contentType,
	files,
}: ResourceFilesCardProps) {
	const TypeIcon = typeIcons[type]

	return (
		<Card>
			<CardHeader>
				<div className="flex items-center gap-2">
					<TypeIcon className="h-5 w-5" />
					<CardTitle>Files</CardTitle>
				</div>
				<CardDescription>
					{typeLabels[type]}
					{contentType && ` • ${contentTypeLabels[contentType]}`}
				</CardDescription>
			</CardHeader>
			<CardContent>
				<div className="space-y-2">
					{files.map((file) => (
						<div
							key={file.id}
							className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
						>
							<div className="flex-1 min-w-0">
								<p className="text-sm font-medium truncate">{file.fileName}</p>
								<p className="text-xs text-muted-foreground">
									{file.mimeType} • {formatFileSize(file.fileSize)}
								</p>
							</div>
							<a
								href={file.fileUrl}
								target="_blank"
								rel="noopener noreferrer"
								className="text-sm text-primary hover:underline ml-4"
							>
								View
							</a>
						</div>
					))}
				</div>
			</CardContent>
		</Card>
	)
}
