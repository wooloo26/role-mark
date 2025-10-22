"use client"

import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { trpc } from "@/client/trpc"
import { CharacterDetailHeader } from "@/components/characters/character-detail-header"

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
			toast.success("Character deleted successfully")
			router.push("/characters")
		},
		onError: () => {
			toast.error("Failed to delete character")
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
