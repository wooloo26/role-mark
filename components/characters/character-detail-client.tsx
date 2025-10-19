"use client"

import { useRouter } from "next/navigation"
import { CharacterDetailHeader } from "@/components/characters/character-detail-header"
import { trpc } from "@/lib/trpc/client"

interface CharacterDetailClientProps {
	characterId: string
	characterName: string
}

export function CharacterDetailClient({
	characterId,
	characterName,
}: CharacterDetailClientProps) {
	const router = useRouter()
	const deleteMutation = trpc.character.delete.useMutation({
		onSuccess: () => {
			router.push("/characters")
		},
	})

	const handleDelete = () => {
		deleteMutation.mutate({ id: characterId })
	}

	return (
		<CharacterDetailHeader
			characterId={characterId}
			characterName={characterName}
			onDelete={handleDelete}
			isDeleting={deleteMutation.isPending}
		/>
	)
}
