"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { ResourceType } from "@prisma/client"
import { Plus } from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { ResourceBasicInfoForm } from "@/components/resources/resource-basic-info-form"
import { ResourceFilesForm } from "@/components/resources/resource-files-form"
import {
	type ResourceFormValues,
	resourceFormSchema,
} from "@/components/resources/resource-form-schemas"
import { ResourceTagsForm } from "@/components/resources/resource-tags-form"
import { Button } from "@/components/ui/button"
import { Form } from "@/components/ui/form"
import { trpc } from "@/lib/trpc/client"

export function NewResourceForm() {
	const router = useRouter()
	const [selectedTags, setSelectedTags] = useState<string[]>([])
	const [selectedCharacters, setSelectedCharacters] = useState<string[]>([])

	const form = useForm<ResourceFormValues>({
		resolver: zodResolver(resourceFormSchema),
		defaultValues: {
			title: "",
			description: "",
			type: ResourceType.SINGLE_FILE,
			contentType: null,
			thumbnailUrl: "",
			files: [],
			tagIds: [],
			characterIds: [],
		},
	})

	// Watch the resource type and reset contentType to null when FOLDER is selected
	const resourceType = form.watch("type")
	useEffect(() => {
		if (resourceType === ResourceType.FOLDER) {
			form.setValue("contentType", null)
		}
	}, [resourceType, form])

	const createMutation = trpc.resource.create.useMutation({
		onSuccess: (data) => {
			router.push(`/resources/${data.id}`)
		},
	})

	const onSubmit = (values: ResourceFormValues) => {
		createMutation.mutate({
			...values,
			tagIds: selectedTags,
			characterIds: selectedCharacters,
		})
	}

	return (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
				<div className="flex items-center justify-between">
					<h1 className="text-3xl font-bold">Create Resource</h1>
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
							disabled={createMutation.isPending}
							className="gap-2"
						>
							<Plus className="h-4 w-4" />
							{createMutation.isPending ? "Creating..." : "Create Resource"}
						</Button>
					</div>
				</div>

				<div className="grid gap-6">
					<ResourceBasicInfoForm control={form.control} watch={form.watch} />
					<ResourceFilesForm control={form.control} watch={form.watch} />
					<ResourceTagsForm
						selectedTags={selectedTags}
						onTagsChange={setSelectedTags}
						selectedCharacters={selectedCharacters}
						onCharactersChange={setSelectedCharacters}
					/>
				</div>

				{createMutation.error && (
					<div className="text-sm text-destructive">
						Error: {createMutation.error.message}
					</div>
				)}
			</form>
		</Form>
	)
}
