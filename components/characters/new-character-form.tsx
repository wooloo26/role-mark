"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { Plus } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { CharacterAttributesForm } from "@/components/characters/character-attributes-form"
import { CharacterBasicInfoForm } from "@/components/characters/character-basic-info-form"
import { CharacterFormActions } from "@/components/characters/character-form-actions"
import { CharacterMediaForm } from "@/components/characters/character-media-form"
import { CharacterTagsForm } from "@/components/characters/character-tags-form"
import {
	type CharacterFormValues,
	characterFormSchema,
} from "@/components/characters/form-schemas"
import { Form } from "@/components/ui/form"
import { trpc } from "@/lib/trpc/client"

export function NewCharacterForm() {
	const router = useRouter()
	const [selectedTags, setSelectedTags] = useState<string[]>([])

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

	const createMutation = trpc.character.create.useMutation({
		onSuccess: (data) => {
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

		createMutation.mutate({
			name: values.name,
			avatarUrl: values.avatarUrl || undefined,
			portraitUrl: values.portraitUrl || undefined,
			info: values.info || undefined,
			staticTags: Object.keys(staticTags).length > 0 ? staticTags : undefined,
			tagIds: selectedTags,
		})
	}

	return (
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
					isSubmitting={createMutation.isPending}
					submitLabel="Create Character"
					submittingLabel="Creating..."
					icon={Plus}
					error={createMutation.error?.message}
				/>
			</form>
		</Form>
	)
}
