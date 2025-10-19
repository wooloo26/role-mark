import { ContentType, ResourceType } from "@prisma/client"
import { z } from "zod"

// File input schema for the form
export const resourceFileInputSchema = z.object({
	fileName: z.string().min(1, "File name is required"),
	fileUrl: z.string().url("Invalid file URL"),
	mimeType: z.string().min(1, "MIME type is required"),
	fileSize: z.number().int().positive().optional(),
	order: z.number().int().min(0),
	metadata: z.record(z.string(), z.any()).optional(),
})

// Main resource form schema
export const resourceFormSchema = z
	.object({
		title: z.string().min(1, "Title is required").max(255, "Title is too long"),
		description: z.string().optional(),
		type: z.nativeEnum(ResourceType, {
			message: "Resource type is required",
		}),
		contentType: z.nativeEnum(ContentType).nullable().optional(),
		thumbnailUrl: z
			.string()
			.url("Invalid thumbnail URL")
			.optional()
			.or(z.literal("")),
		files: z
			.array(resourceFileInputSchema)
			.min(1, "At least one file is required"),
		tagIds: z.array(z.string()),
		characterIds: z.array(z.string()),
	})
	.refine(
		(data) => {
			// FOLDER type must have contentType as null
			if (
				data.type === ResourceType.FOLDER &&
				data.contentType !== null &&
				data.contentType !== undefined
			) {
				return false
			}
			return true
		},
		{
			message: "FOLDER type cannot have a content type",
			path: ["contentType"],
		},
	)
	.refine(
		(data) => {
			// SINGLE_FILE and FILE_ARRAY should have a contentType
			if (
				(data.type === ResourceType.SINGLE_FILE ||
					data.type === ResourceType.FILE_ARRAY) &&
				!data.contentType
			) {
				return false
			}
			return true
		},
		{
			message: "Content type is required for SINGLE_FILE and FILE_ARRAY",
			path: ["contentType"],
		},
	)
	.refine(
		(data) => {
			// SINGLE_FILE must have exactly one file
			if (data.type === ResourceType.SINGLE_FILE && data.files.length !== 1) {
				return false
			}
			return true
		},
		{
			message: "SINGLE_FILE must have exactly one file",
			path: ["files"],
		},
	)

// Update resource schema (doesn't include type, contentType, or files)
export const updateResourceFormSchema = z.object({
	title: z.string().min(1, "Title is required").max(255, "Title is too long"),
	description: z.string().optional(),
	thumbnailUrl: z
		.string()
		.url("Invalid thumbnail URL")
		.optional()
		.or(z.literal("")),
	tagIds: z.array(z.string()),
	characterIds: z.array(z.string()),
})

export type ResourceFormValues = z.infer<typeof resourceFormSchema>
export type ResourceFileInputValues = z.infer<typeof resourceFileInputSchema>
export type UpdateResourceFormValues = z.infer<typeof updateResourceFormSchema>
