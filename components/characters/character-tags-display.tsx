import { Badge } from "@/components/ui/badge"

interface Tag {
	id: string
	name: string
	group?: {
		name: string
	} | null
}

interface CharacterTagsDisplayProps {
	tags: Array<{ tag: Tag }>
}

export function CharacterTagsDisplay({ tags }: CharacterTagsDisplayProps) {
	if (!tags || tags.length === 0) return null

	// Group tags by group
	const tagsByGroup = new Map<string, Array<{ id: string; name: string }>>()

	tags.forEach((ct) => {
		const groupName = ct.tag.group?.name || "Ungrouped"
		if (!tagsByGroup.has(groupName)) {
			tagsByGroup.set(groupName, [])
		}
		tagsByGroup.get(groupName)?.push({
			id: ct.tag.id,
			name: ct.tag.name,
		})
	})

	return (
		<div className="border-t pt-4 mt-4">
			<h3 className="text-lg font-semibold mb-3">Tags</h3>
			<div className="grid grid-cols-1 md:grid-cols-3 gap-3">
				{Array.from(tagsByGroup.entries()).map(([groupName, groupTags]) => (
					<div key={groupName} className="flex items-start">
						<h4 className="text-sm font-medium text-muted-foreground mr-2 shrink-0">
							{groupName}:
						</h4>
						<div className="flex flex-wrap gap-2 flex-1">
							{groupTags.map((tag) => (
								<Badge key={tag.id} variant="secondary" className="text-xs">
									{tag.name}
								</Badge>
							))}
						</div>
					</div>
				))}
			</div>
		</div>
	)
}
