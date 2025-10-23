"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useParams, useRouter } from "next/navigation"
import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { z } from "zod"
import { trpc } from "@/client/trpc/client"
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

const formSchema = z.object({
	title: z.string().min(1, "Title is required").max(255),
	description: z.string().optional(),
	thumbnailUrl: z.string().optional(),
	tagIds: z.array(z.string()),
	characterIds: z.array(z.string()),
})

export function ResourceEditForm() {
	const params = useParams()
	const router = useRouter()
	const id = params.id as string

	const { data: resource, isLoading } = trpc.resource.getById.useQuery({ id })

	const updateMutation = trpc.resource.update.useMutation({
		onSuccess: (data) => {
			toast.success("Resource updated successfully")
			router.push(`/resources/${data.id}`)
		},
		onError: (error) => {
			toast.error(error.message || "Failed to update resource")
		},
	})

	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			title: "",
			description: "",
			thumbnailUrl: "",
			tagIds: [],
			characterIds: [],
		},
	})

	// Update form when resource data is loaded
	useEffect(() => {
		if (resource) {
			form.reset({
				title: resource.title,
				description: resource.description || "",
				thumbnailUrl: resource.thumbnailUrl || "",
				tagIds: resource.tags.map((rt) => rt.tag.id),
				characterIds: resource.characters.map((rc) => rc.character.id),
			})
		}
	}, [resource, form])

	const onSubmit = async (values: z.infer<typeof formSchema>) => {
		await updateMutation.mutateAsync({
			id,
			...values,
		})
	}

	if (isLoading) {
		return (
			<div className="text-center py-12 text-muted-foreground">
				Loading resource...
			</div>
		)
	}

	if (!resource) {
		return (
			<div className="text-center py-12 text-destructive">
				Resource not found
			</div>
		)
	}

	return (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
				{/* Info Note */}
				<div className="p-4 bg-muted rounded-lg text-sm text-muted-foreground">
					<p>
						Note: Resource type, content type, and files cannot be changed. You
						can only update metadata like title, description, and tags.
					</p>
				</div>

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

				{/* Thumbnail URL */}
				<FormField
					control={form.control}
					name="thumbnailUrl"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Thumbnail URL (Optional)</FormLabel>
							<FormControl>
								<Input placeholder="/uploads/..." {...field} />
							</FormControl>
							<FormDescription>
								URL to a thumbnail image for this resource
							</FormDescription>
							<FormMessage />
						</FormItem>
					)}
				/>

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
					<Button type="submit" disabled={updateMutation.isPending}>
						{updateMutation.isPending ? "Saving..." : "Save Changes"}
					</Button>
					<Button type="button" variant="outline" onClick={() => router.back()}>
						Cancel
					</Button>
				</div>
			</form>
		</Form>
	)
}
