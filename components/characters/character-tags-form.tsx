import { TagSelector } from "@/components/tag-selector"
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card"

interface CharacterTagsFormProps {
	selectedTags: string[]
	onTagsChange: (tags: string[]) => void
}

export function CharacterTagsForm({
	selectedTags,
	onTagsChange,
}: CharacterTagsFormProps) {
	return (
		<Card>
			<CardHeader>
				<CardTitle>Tags</CardTitle>
				<CardDescription>
					Categorize the character with tags for better organization
				</CardDescription>
			</CardHeader>
			<CardContent>
				<TagSelector
					scope="CHARACTER"
					selectedTags={selectedTags}
					onTagsChange={onTagsChange}
					placeholder="Select tags for this character..."
				/>
			</CardContent>
		</Card>
	)
}
