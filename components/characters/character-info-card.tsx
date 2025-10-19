import { Card, CardContent } from "@/components/ui/card"
import { CharacterAttributesDisplay } from "./character-attributes-display"
import { CharacterTagsDisplay } from "./character-tags-display"

interface CharacterInfoCardProps {
	info?: string | null
	staticTags?: Array<{
		tagDefinition: { name: string }
		value: string
	}> | null
	tags?: Array<{
		tag: {
			id: string
			name: string
			group?: { name: string } | null
		}
	}> | null
}

export function CharacterInfoCard({
	info,
	staticTags,
	tags,
}: CharacterInfoCardProps) {
	const staticTagsMap = new Map(
		staticTags?.map((st) => [st.tagDefinition.name, st.value]) || [],
	)

	return (
		<Card>
			<CardContent className="p-4">
				{/* About Section */}
				{info && (
					<div className="mb-4">
						<h3 className="text-lg font-semibold mb-2">About</h3>
						<p className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">
							{info}
						</p>
					</div>
				)}

				{/* Attributes */}
				<CharacterAttributesDisplay staticTagsMap={staticTagsMap} />

				{/* Tags */}
				<CharacterTagsDisplay tags={tags || []} />
			</CardContent>
		</Card>
	)
}
