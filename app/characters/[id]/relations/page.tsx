import { notFound } from "next/navigation"
import { Suspense } from "react"
import { CharacterRelationsManagement } from "@/components/characters/character-relations-management"
import { Card, CardContent } from "@/components/ui/card"
import { api } from "@/lib/trpc/server"

interface CharacterRelationsPageProps {
	params: Promise<{
		id: string
	}>
}

export default async function CharacterRelationsPage({
	params,
}: CharacterRelationsPageProps) {
	const { id } = await params

	// Fetch character to verify it exists
	const character = await (await api()).character
		.getById({ id })
		.catch(() => null)

	if (!character) {
		notFound()
	}

	return (
		<div className="container py-8 max-w-7xl">
			<Suspense
				fallback={
					<Card>
						<CardContent className="text-center py-12 text-muted-foreground">
							Loading relations...
						</CardContent>
					</Card>
				}
			>
				<CharacterRelationsManagement
					characterId={id}
					characterName={character.name}
					isOwner={true} // TODO: Check if user is owner/authenticated
				/>
			</Suspense>
		</div>
	)
}
