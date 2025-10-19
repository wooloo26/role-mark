"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { ArrowLeft, Save } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { use, useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { CharacterAttributesForm } from "@/components/characters/character-attributes-form"
import { CharacterBasicInfoForm } from "@/components/characters/character-basic-info-form"
import { CharacterFormActions } from "@/components/characters/character-form-actions"
import { CharacterFormHeader } from "@/components/characters/character-form-header"
import { CharacterMediaForm } from "@/components/characters/character-media-form"
import { CharacterTagsForm } from "@/components/characters/character-tags-form"
import {
	type CharacterFormValues,
	characterFormSchema,
} from "@/components/characters/form-schemas"
import { Button } from "@/components/ui/button"
import { Form } from "@/components/ui/form"
import { trpc } from "@/lib/trpc/client"

interface CharacterEditPageProps {
	params: Promise<{ id: string }>
}

export default function CharacterEditPage({ params }: CharacterEditPageProps) {
	const { id } = use(params)
	const router = useRouter()
	const [selectedTags, setSelectedTags] = useState<string[]>([])
	const utils = trpc.useUtils()

	const { data: character, isLoading } = trpc.character.getById.useQuery({ id })

	const form = useForm<CharacterFormValues>({
		resolver: zodResolver(characterFormSchema),
		defaultValues: {
			name: "",
			avatarUrl: "",
			portraitUrl: "",
			info: "",
			height: "",
			weight: "",
			birthday: "",
		},
	})

	// Populate form when data loads
	useEffect(() => {
		if (character) {
			const staticTagsMap = new Map(
				character.staticTags?.map((st) => [st.tagDefinition.name, st.value]) ||
					[],
			)

			form.reset({
				name: character.name,
				avatarUrl: character.avatarUrl || "",
				portraitUrl: character.portraitUrl || "",
				info: character.info || "",
				height: staticTagsMap.get("height") || "",
				weight: staticTagsMap.get("weight") || "",
				birthday: staticTagsMap.get("birthday")
					? new Date(staticTagsMap.get("birthday")!).toISOString().split("T")[0]
					: "",
			})

			setSelectedTags(character.tags?.map((ct) => ct.tag.id) || [])
		}
	}, [character, form])

	const updateMutation = trpc.character.update.useMutation({
		onSuccess: async (data) => {
			// Invalidate and refetch character data
			await utils.character.getById.invalidate({ id })
			router.push(`/characters/${data.id}`)
		},
	})

	const onSubmit = (values: CharacterFormValues) => {
		const staticTags: {
			height?: number
			weight?: number
			birthday?: string | Date
		} = {}

		if (values.height) {
			staticTags.height = Number.parseFloat(values.height)
		}
		if (values.weight) {
			staticTags.weight = Number.parseFloat(values.weight)
		}
		if (values.birthday) {
			staticTags.birthday = values.birthday
		}

		updateMutation.mutate({
			id,
			name: values.name,
			avatarUrl: values.avatarUrl || undefined,
			portraitUrl: values.portraitUrl || undefined,
			info: values.info || undefined,
			staticTags: Object.keys(staticTags).length > 0 ? staticTags : undefined,
			tagIds: selectedTags,
		})
	}

	if (isLoading) {
		return (
			<div className="container mx-auto px-4 py-8 max-w-4xl">
				<div className="animate-pulse space-y-8">
					<div className="h-8 bg-muted rounded w-48" />
					<div className="space-y-4">
						<div className="h-64 bg-muted rounded" />
						<div className="h-64 bg-muted rounded" />
					</div>
				</div>
			</div>
		)
	}

	if (!character) {
		return (
			<div className="container mx-auto px-4 py-16 text-center">
				<h1 className="text-2xl font-bold mb-4">Character not found</h1>
				<Button asChild>
					<Link href="/characters">
						<ArrowLeft className="h-4 w-4 mr-2" />
						Back to Characters
					</Link>
				</Button>
			</div>
		)
	}

	return (
		<div className="container mx-auto px-4 py-8 max-w-4xl">
			<CharacterFormHeader
				backUrl={`/characters/${id}`}
				backLabel="Back to Character"
				gradientText="Edit Character"
				title={`Edit ${character.name}`}
				description="Update the character details below"
			/>

			<Form {...form}>
				<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
					<CharacterBasicInfoForm control={form.control} />
					<CharacterMediaForm control={form.control} />
					<CharacterAttributesForm control={form.control} />
					<CharacterTagsForm
						selectedTags={selectedTags}
						onTagsChange={setSelectedTags}
					/>
					<CharacterFormActions
						isSubmitting={updateMutation.isPending}
						submitLabel="Save Changes"
						submittingLabel="Saving..."
						icon={Save}
						error={updateMutation.error?.message}
					/>
				</form>
			</Form>
		</div>
	)
}
