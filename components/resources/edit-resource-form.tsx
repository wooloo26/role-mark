"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { Save } from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import {
	type UpdateResourceFormValues,
	updateResourceFormSchema,
} from "@/components/resources/resource-form-schemas"
import { ResourceTagsForm } from "@/components/resources/resource-tags-form"
import { Button } from "@/components/ui/button"
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card"
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
import { trpc } from "@/lib/trpc/client"

interface EditResourceFormProps {
	resourceId: string
}

export function EditResourceForm({ resourceId }: EditResourceFormProps) {
	const router = useRouter()
	const [selectedTags, setSelectedTags] = useState<string[]>([])
	const [selectedCharacters, setSelectedCharacters] = useState<string[]>([])

	const { data: resource, isLoading } = trpc.resource.getById.useQuery({
		id: resourceId,
	})

	const form = useForm<UpdateResourceFormValues>({
		resolver: zodResolver(updateResourceFormSchema),
		defaultValues: {
			title: "",
			description: "",
			thumbnailUrl: "",
			tagIds: [],
			characterIds: [],
		},
	})

	// Update form when resource data loads
	useEffect(() => {
		if (resource) {
			form.reset({
				title: resource.title,
				description: resource.description || "",
				thumbnailUrl: resource.thumbnailUrl || "",
				tagIds: [],
				characterIds: [],
			})
			setSelectedTags(resource.tags.map((t) => t.tag.id))
			setSelectedCharacters(resource.characters.map((c) => c.character.id))
		}
	}, [resource, form])

	const updateMutation = trpc.resource.update.useMutation({
		onSuccess: () => {
			router.push(`/resources/${resourceId}`)
		},
	})

	const onSubmit = (values: UpdateResourceFormValues) => {
		updateMutation.mutate({
			id: resourceId,
			title: values.title,
			description: values.description,
			thumbnailUrl: values.thumbnailUrl || undefined,
			tagIds: selectedTags,
			characterIds: selectedCharacters,
		})
	}

	if (isLoading) {
		return (
			<div className="container mx-auto px-4 py-8">
				<div className="text-center">Loading...</div>
			</div>
		)
	}

	if (!resource) {
		return (
			<div className="container mx-auto px-4 py-8">
				<div className="text-center">Resource not found</div>
			</div>
		)
	}

	return (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
				<div className="flex items-center justify-between">
					<h1 className="text-3xl font-bold">Edit Resource</h1>
					<div className="flex gap-2">
						<Button
							type="button"
							variant="outline"
							onClick={() => router.back()}
						>
							Cancel
						</Button>
						<Button
							type="submit"
							disabled={updateMutation.isPending}
							className="gap-2"
						>
							<Save className="h-4 w-4" />
							{updateMutation.isPending ? "Saving..." : "Save Changes"}
						</Button>
					</div>
				</div>

				<div className="grid gap-6">
					<Card>
						<CardHeader>
							<CardTitle>Basic Information</CardTitle>
							<CardDescription>Edit resource details</CardDescription>
						</CardHeader>
						<CardContent className="space-y-4">
							<FormField
								control={form.control}
								name="title"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Title</FormLabel>
										<FormControl>
											<Input placeholder="Resource title" {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="description"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Description</FormLabel>
										<FormControl>
											<Textarea
												placeholder="Describe this resource..."
												{...field}
											/>
										</FormControl>
										<FormDescription>
											Optional description of the resource
										</FormDescription>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="thumbnailUrl"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Thumbnail URL</FormLabel>
										<FormControl>
											<Input
												placeholder="https://example.com/thumbnail.jpg"
												{...field}
											/>
										</FormControl>
										<FormDescription>
											Optional thumbnail image URL
										</FormDescription>
										<FormMessage />
									</FormItem>
								)}
							/>
						</CardContent>
					</Card>

					<div className="bg-muted/50 border rounded-lg p-4">
						<p className="text-sm text-muted-foreground">
							Note: Resource type, content type, and files cannot be modified
							after creation to maintain data integrity.
						</p>
					</div>

					<ResourceTagsForm
						selectedTags={selectedTags}
						onTagsChange={setSelectedTags}
						selectedCharacters={selectedCharacters}
						onCharactersChange={setSelectedCharacters}
					/>
				</div>

				{updateMutation.error && (
					<div className="text-sm text-destructive">
						Error: {updateMutation.error.message}
					</div>
				)}
			</form>
		</Form>
	)
}
