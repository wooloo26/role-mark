"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { ContentType, ResourceType } from "@prisma/client"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { z } from "zod"
import { trpc } from "@/client/trpc/client"
import { ImageUploadWithCrop } from "@/components/image-upload-with-crop"
import { ResourceUpload } from "@/components/resources/resource-upload"
import { TagSelector } from "@/components/tag-selector"
import { Button } from "@/components/ui/button"
import {
	Form,
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

interface UploadedFile {
	fileName: string
	fileUrl: string
	mimeType: string
	fileSize: number
	order: number
}

const formSchema = z.object({
	title: z.string().min(1, "Title is required").max(255),
	description: z.string().optional(),
	thumbnailUrl: z.string().optional(),
	files: z.array(z.any()).min(1, "At least one file is required"),
	tagIds: z.array(z.string()),
	characterIds: z.array(z.string()),
	type: z.nativeEnum(ResourceType),
	contentType: z.nativeEnum(ContentType).nullable().optional(),
})

export function ResourceCreateForm() {
	const router = useRouter()
	const [uploadMode, setUploadMode] = useState<
		"single" | "file-array" | "folder"
	>("single")
	const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])
	const [resourceType, setResourceType] = useState<ResourceType>(
		ResourceType.SINGLE_FILE,
	)
	const [contentType, setContentType] = useState<ContentType | null>(null)

	const createMutation = trpc.resource.create.useMutation({
		onSuccess: (data) => {
			toast.success("Resource created successfully")
			router.push(`/resources/${data.id}`)
		},
		onError: (error) => {
			toast.error(error.message || "Failed to create resource")
		},
	})

	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			title: "",
			description: "",
			thumbnailUrl: "",
			files: [],
			tagIds: [],
			characterIds: [],
			type: ResourceType.SINGLE_FILE,
			contentType: null,
		},
	})

	const handleFilesChange = (
		files: UploadedFile[],
		type: ResourceType,
		cType: ContentType | null,
	) => {
		setUploadedFiles(files)
		setResourceType(type)
		setContentType(cType)
		form.setValue("files", files)
		form.setValue("type", type)
		form.setValue("contentType", cType)
	}

	const onSubmit = async (values: z.infer<typeof formSchema>) => {
		try {
			// For single-file mode with multiple files, create separate resources
			if (uploadMode === "single" && uploadedFiles.length > 1) {
				const promises = uploadedFiles.map(async (file, index) => {
					const singleFileType = ResourceType.SINGLE_FILE
					const singleContentType = file.mimeType.startsWith("image/")
						? ContentType.IMAGE
						: file.mimeType.startsWith("video/")
							? ContentType.VIDEO
							: ContentType.OTHER

					return createMutation.mutateAsync({
						title: `${values.title}${uploadedFiles.length > 1 ? ` (${index + 1})` : ""}`,
						description: values.description,
						thumbnailUrl: values.thumbnailUrl,
						type: singleFileType,
						contentType: singleContentType,
						files: [file],
						tagIds: values.tagIds,
						characterIds: values.characterIds,
					})
				})

				await Promise.all(promises)
				toast.success(`Created ${uploadedFiles.length} resources`)
				router.push("/resources")
			} else {
				// Single resource creation (single file, file-array, or folder archive)
				await createMutation.mutateAsync({
					title: values.title,
					description: values.description,
					thumbnailUrl: values.thumbnailUrl,
					type: resourceType,
					contentType: contentType,
					files: uploadedFiles,
					tagIds: values.tagIds,
					characterIds: values.characterIds,
				})
			}
		} catch (error) {
			// Error is handled by mutation
			console.error("Submit error:", error)
		}
	}

	return (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
				{/* File Upload */}
				<FormField
					control={form.control}
					name="files"
					render={() => (
						<FormItem>
							<FormLabel>Files</FormLabel>
							<FormControl>
								<ResourceUpload
									value={uploadedFiles}
									onChange={handleFilesChange}
									uploadMode={uploadMode}
									onUploadModeChange={setUploadMode}
								/>
							</FormControl>
							<FormDescription>
								Upload your resource files. Single-file mode supports multiple
								files (each creates a separate resource). File-array mode
								creates one resource with multiple files. Folder mode only
								accepts archives.
							</FormDescription>
							<FormMessage />
						</FormItem>
					)}
				/>
				{/* Auto-detected Type and Content Type Display */}
				{uploadedFiles.length > 0 && (
					<div className="p-4 bg-muted rounded-lg space-y-2">
						<div className="text-sm">
							<span className="font-medium">Resource Type: </span>
							<span className="text-muted-foreground">{resourceType}</span>
						</div>
						{contentType && (
							<div className="text-sm">
								<span className="font-medium">Content Type: </span>
								<span className="text-muted-foreground">{contentType}</span>
							</div>
						)}
						{uploadMode === "single" && uploadedFiles.length > 1 && (
							<div className="text-sm text-amber-600 dark:text-amber-500">
								Note: {uploadedFiles.length} separate resources will be created
							</div>
						)}
					</div>
				)}
				{/* Title */}
				<FormField
					control={form.control}
					name="title"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Title</FormLabel>
							<FormControl>
								<Input placeholder="Resource title" {...field} />
							</FormControl>
							<FormDescription>
								A descriptive title for your resource
								{uploadMode === "single" &&
									uploadedFiles.length > 1 &&
									" (will be numbered for multiple files)"}
							</FormDescription>
							<FormMessage />
						</FormItem>
					)}
				/>
				{/* Description */}
				<FormField
					control={form.control}
					name="description"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Description</FormLabel>
							<FormControl>
								<Textarea
									placeholder="Optional description..."
									className="min-h-[100px]"
									{...field}
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
				{/* Thumbnail */}
				<FormField
					control={form.control}
					name="thumbnailUrl"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Custom Thumbnail (Optional)</FormLabel>
							<FormControl>
								<ImageUploadWithCrop
									value={field.value}
									onChange={field.onChange}
									aspectRatio={16 / 9}
									label="Upload Thumbnail"
								/>
							</FormControl>
							<FormDescription>
								{uploadedFiles.length > 0 &&
								(uploadedFiles[0].mimeType.startsWith("image/") ||
									uploadedFiles[0].mimeType.startsWith("video/"))
									? "Leave empty to auto-generate from first file"
									: "Upload a custom thumbnail image for this resource"}
							</FormDescription>
							<FormMessage />
						</FormItem>
					)}
				/>{" "}
				{/* Tags */}
				<FormField
					control={form.control}
					name="tagIds"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Tags</FormLabel>
							<FormControl>
								<TagSelector
									scope="RESOURCE"
									selectedTags={field.value}
									onTagsChange={field.onChange}
								/>
							</FormControl>
							<FormDescription>
								Add tags to categorize this resource
							</FormDescription>
							<FormMessage />
						</FormItem>
					)}
				/>
				{/* Submit Button */}
				<div className="flex gap-4">
					<Button
						type="submit"
						disabled={createMutation.isPending || uploadedFiles.length === 0}
					>
						{createMutation.isPending ? "Creating..." : "Create Resource"}
					</Button>
					<Button type="button" variant="outline" onClick={() => router.back()}>
						Cancel
					</Button>
				</div>
			</form>
		</Form>
	)
}
