"use client"

import { ContentType, ResourceType } from "@prisma/client"
import {
	Download,
	Edit,
	FileIcon,
	FolderIcon,
	ImageIcon,
	Trash2,
	VideoIcon,
} from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { toast } from "sonner"
import { trpc } from "@/client/trpc/client"
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card"
import { getFileApiUrl } from "@/lib/path"

function getResourceIcon(type: ResourceType, contentType?: ContentType | null) {
	if (type === ResourceType.FOLDER) {
		return <FolderIcon className="h-6 w-6" />
	}

	switch (contentType) {
		case ContentType.IMAGE:
			return <ImageIcon className="h-6 w-6" />
		case ContentType.VIDEO:
			return <VideoIcon className="h-6 w-6" />
		default:
			return <FileIcon className="h-6 w-6" />
	}
}

function formatFileSize(bytes?: number | null): string {
	if (!bytes) return "Unknown"
	if (bytes < 1024) return `${bytes} B`
	if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
	if (bytes < 1024 * 1024 * 1024)
		return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
	return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`
}

export function ResourceDetail() {
	const params = useParams()
	const router = useRouter()
	const { data: session } = useSession()
	const id = params.id as string

	const {
		data: resource,
		isLoading,
		error,
	} = trpc.resource.getById.useQuery({ id })

	const deleteMutation = trpc.resource.delete.useMutation({
		onSuccess: () => {
			toast.success("Resource deleted successfully")
			router.push("/resources")
		},
		onError: (error) => {
			toast.error(error.message || "Failed to delete resource")
		},
	})

	const handleDelete = () => {
		deleteMutation.mutate({ id })
	}

	if (isLoading) {
		return (
			<div className="container max-w-6xl py-8 mx-auto">
				<div className="text-center py-12 text-muted-foreground">
					Loading resource...
				</div>
			</div>
		)
	}

	if (error || !resource) {
		return (
			<div className="container max-w-6xl py-8 mx-auto">
				<div className="text-center py-12">
					<p className="text-destructive mb-4">
						{error?.message || "Resource not found"}
					</p>
					<Button asChild variant="outline">
						<Link href="/resources">Back to Resources</Link>
					</Button>
				</div>
			</div>
		)
	}

	const isOwner = session?.user?.id === resource.uploaderId

	return (
		<div className="container max-w-6xl py-8 space-y-6 mx-auto">
			{/* Header */}
			<div className="flex items-start justify-between">
				<div className="space-y-2 flex-1">
					<div className="flex items-center gap-3">
						{getResourceIcon(resource.type, resource.contentType)}
						<h1 className="text-3xl font-bold tracking-tight">
							{resource.title}
						</h1>
					</div>
					{resource.description && (
						<p className="text-muted-foreground text-lg">
							{resource.description}
						</p>
					)}
				</div>

				{/* Actions */}
				{isOwner && (
					<div className="flex gap-2">
						<Button asChild variant="outline">
							<Link href={`/resources/${id}/edit`}>
								<Edit className="mr-2 h-4 w-4" />
								Edit
							</Link>
						</Button>
						<AlertDialog>
							<AlertDialogTrigger asChild>
								<Button variant="destructive">
									<Trash2 className="mr-2 h-4 w-4" />
									Delete
								</Button>
							</AlertDialogTrigger>
							<AlertDialogContent>
								<AlertDialogHeader>
									<AlertDialogTitle>Are you sure?</AlertDialogTitle>
									<AlertDialogDescription>
										This will permanently delete this resource and all its
										files. This action cannot be undone.
									</AlertDialogDescription>
								</AlertDialogHeader>
								<AlertDialogFooter>
									<AlertDialogCancel>Cancel</AlertDialogCancel>
									<AlertDialogAction
										onClick={handleDelete}
										className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
									>
										Delete
									</AlertDialogAction>
								</AlertDialogFooter>
							</AlertDialogContent>
						</AlertDialog>
					</div>
				)}
			</div>

			{/* Metadata */}
			<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
				<Card>
					<CardHeader className="pb-3">
						<CardTitle className="text-sm font-medium">Type</CardTitle>
					</CardHeader>
					<CardContent>
						<Badge variant="secondary">{resource.type.replace("_", " ")}</Badge>
					</CardContent>
				</Card>

				{resource.contentType && (
					<Card>
						<CardHeader className="pb-3">
							<CardTitle className="text-sm font-medium">
								Content Type
							</CardTitle>
						</CardHeader>
						<CardContent>
							<Badge variant="default">{resource.contentType}</Badge>
						</CardContent>
					</Card>
				)}

				<Card>
					<CardHeader className="pb-3">
						<CardTitle className="text-sm font-medium">Files</CardTitle>
					</CardHeader>
					<CardContent>
						<p className="text-2xl font-bold">{resource.files.length}</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="pb-3">
						<CardTitle className="text-sm font-medium">Uploaded</CardTitle>
					</CardHeader>
					<CardContent>
						<p className="text-sm">
							{new Date(resource.createdAt).toLocaleDateString()}
						</p>
						{resource.uploader && (
							<p className="text-xs text-muted-foreground mt-1">
								by {resource.uploader.name}
							</p>
						)}
					</CardContent>
				</Card>
			</div>

			{/* Tags */}
			{resource.tags.length > 0 && (
				<Card>
					<CardHeader>
						<CardTitle>Tags</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="flex flex-wrap gap-2">
							{resource.tags.map((rt) => (
								<Badge
									key={rt.tag.id}
									variant={
										rt.tag.pinned || rt.tag.group?.pinned
											? "default"
											: "outline"
									}
								>
									{rt.tag.group?.name && (
										<span className="text-muted-foreground mr-1">
											{rt.tag.group.name} /
										</span>
									)}
									{rt.tag.name}
								</Badge>
							))}
						</div>
					</CardContent>
				</Card>
			)}

			{/* Characters */}
			{resource.characters.length > 0 && (
				<Card>
					<CardHeader>
						<CardTitle>Characters</CardTitle>
						<CardDescription>
							Characters associated with this resource
						</CardDescription>
					</CardHeader>
					<CardContent>
						<div className="flex flex-wrap gap-3">
							{resource.characters.map((rc) => (
								<Link
									key={rc.character.id}
									href={`/characters/${rc.character.id}`}
									className="flex items-center gap-2 p-2 rounded-lg border hover:bg-accent transition-colors"
								>
									{rc.character.avatarUrl && (
										<div className="relative w-10 h-10 rounded-full overflow-hidden">
											<Image
												src={getFileApiUrl(rc.character.avatarUrl)}
												alt={rc.character.name}
												fill
												className="object-cover"
											/>
										</div>
									)}
									<span className="font-medium">{rc.character.name}</span>
								</Link>
							))}
						</div>
					</CardContent>
				</Card>
			)}

			{/* Files */}
			<Card>
				<CardHeader>
					<CardTitle>Files</CardTitle>
					<CardDescription>
						{resource.files.length} file{resource.files.length !== 1 ? "s" : ""}{" "}
						in this resource
					</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="space-y-3">
						{resource.files.map((file) => (
							<div
								key={file.id}
								className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent transition-colors"
							>
								<div className="flex items-center gap-4 flex-1 min-w-0">
									{/* File Preview */}
									{file.mimeType.startsWith("image/") ? (
										<div className="relative w-16 h-16 rounded overflow-hidden flex-shrink-0">
											<Image
												src={getFileApiUrl(file.fileUrl)}
												alt={file.fileName}
												fill
												className="object-cover"
											/>
										</div>
									) : file.mimeType.startsWith("video/") ? (
										<div className="w-16 h-16 rounded bg-muted flex items-center justify-center flex-shrink-0">
											<VideoIcon className="h-6 w-6 text-muted-foreground" />
										</div>
									) : (
										<div className="w-16 h-16 rounded bg-muted flex items-center justify-center flex-shrink-0">
											<FileIcon className="h-6 w-6 text-muted-foreground" />
										</div>
									)}

									{/* File Info */}
									<div className="flex-1 min-w-0">
										<p className="font-medium truncate">{file.fileName}</p>
										<p className="text-sm text-muted-foreground">
											{file.mimeType} • {formatFileSize(file.fileSize)}
										</p>
									</div>
								</div>

								{/* Download Button */}
								<Button asChild variant="outline" size="sm">
									<a
										href={getFileApiUrl(file.fileUrl)}
										download={file.fileName}
										target="_blank"
										rel="noopener noreferrer"
									>
										<Download className="h-4 w-4" />
									</a>
								</Button>
							</div>
						))}
					</div>
				</CardContent>
			</Card>
		</div>
	)
}
