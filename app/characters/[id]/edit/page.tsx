import { EditCharacterForm } from "@/components/characters/edit-character-form"

interface CharacterEditPageProps {
	params: Promise<{ id: string }>
}

export default async function CharacterEditPage({
	params,
}: CharacterEditPageProps) {
	const { id } = await params

	return (
		<div className="container mx-auto px-4 py-8 max-w-4xl">
			<EditCharacterForm characterId={id} />
		</div>
	)
}
