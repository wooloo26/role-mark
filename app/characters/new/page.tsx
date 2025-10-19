import { CharacterFormHeader } from "@/components/characters/character-form-header"
import { NewCharacterForm } from "@/components/characters/new-character-form"

export default function NewCharacterPage() {
	return (
		<div className="container mx-auto px-4 py-8 max-w-4xl">
			<CharacterFormHeader
				backUrl="/characters"
				backLabel="Back to Characters"
				gradientText="New Character"
				title="Create Character"
				description="Fill in the details below to create a new character"
			/>

			<NewCharacterForm />
		</div>
	)
}
