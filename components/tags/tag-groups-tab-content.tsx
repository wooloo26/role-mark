"use client"

import { FolderTree } from "lucide-react"
import { useState } from "react"
import { EmptyState } from "@/components/layout/empty-state"
import { EditTagGroupDialog } from "@/components/tags/edit-tag-group-dialog"
import { TagGroupCard } from "@/components/tags/tag-group-card"

interface TagGroupsTabContentProps {
	tagGroups: Array<{
		id: string
		name: string
		scope: string
		pinned: boolean
		tags: Array<{
			id: string
			name: string
		}>
	}>
}

export function TagGroupsTabContent({ tagGroups }: TagGroupsTabContentProps) {
	const [editingGroup, setEditingGroup] = useState<string | null>(null)

	return (
		<>
			{tagGroups.length > 0 ? (
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
					{tagGroups.map((group) => (
						<TagGroupCard
							key={group.id}
							group={group}
							onEdit={() => setEditingGroup(group.id)}
						/>
					))}
				</div>
			) : (
				<EmptyState
					icon={FolderTree}
					title="No tag groups found"
					description="No tag groups found. Create your first group to organize tags."
				/>
			)}

			{/* Edit Dialog */}
			{editingGroup && (
				<EditTagGroupDialog
					groupId={editingGroup}
					open={!!editingGroup}
					onOpenChange={(open: boolean) => !open && setEditingGroup(null)}
				/>
			)}
		</>
	)
}
