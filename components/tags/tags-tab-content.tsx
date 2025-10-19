"use client"

import { Tag as TagIcon } from "lucide-react"
import { useState } from "react"
import { EmptyState } from "@/components/layout/empty-state"
import { EditTagDialog } from "@/components/tags/edit-tag-dialog"
import { TagCard } from "@/components/tags/tag-card"
import { TagGrid } from "@/components/tags/tag-grid"
import { TagGroupHeader } from "@/components/tags/tag-group-header"

type Tag = {
	id: string
	name: string
	slug: string
	scope: string
	pinned: boolean
	_count: {
		characterTags: number
		resourceTags: number
	}
}

interface TagsTabContentProps {
	groupedTags: Array<{
		id: string
		name: string
		tags: Tag[]
	}>
	ungroupedTags: Tag[]
}

export function TagsTabContent({
	groupedTags,
	ungroupedTags,
}: TagsTabContentProps) {
	const [editingTag, setEditingTag] = useState<string | null>(null)

	return (
		<>
			<div className="space-y-8">
				{/* Grouped Tags */}
				{groupedTags.map((group) => (
					<div key={group.id} className="space-y-4">
						<TagGroupHeader name={group.name} count={group.tags.length} />
						<TagGrid>
							{group.tags.map((tag) => (
								<TagCard
									key={tag.id}
									tag={{ ...tag, group: { id: group.id, name: group.name } }}
									onEdit={() => setEditingTag(tag.id)}
								/>
							))}
						</TagGrid>
					</div>
				))}

				{/* Ungrouped Tags */}
				{ungroupedTags.length > 0 && (
					<div className="space-y-4">
						<TagGroupHeader
							name="Ungrouped Tags"
							count={ungroupedTags.length}
							icon={TagIcon}
						/>
						<TagGrid>
							{ungroupedTags.map((tag) => (
								<TagCard
									key={tag.id}
									tag={{ ...tag, group: null }}
									onEdit={() => setEditingTag(tag.id)}
								/>
							))}
						</TagGrid>
					</div>
				)}

				{/* Empty State */}
				{groupedTags.length === 0 && ungroupedTags.length === 0 && (
					<EmptyState
						icon={TagIcon}
						title="No tags found"
						description="No tags found. Create your first tag to get started."
					/>
				)}
			</div>

			{/* Edit Dialog */}
			{editingTag && (
				<EditTagDialog
					tagId={editingTag}
					open={!!editingTag}
					onOpenChange={(open: boolean) => !open && setEditingTag(null)}
				/>
			)}
		</>
	)
}
