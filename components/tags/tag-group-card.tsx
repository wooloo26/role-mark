"use client"

import { Edit, FolderTree, Hash, Pin, Trash2 } from "lucide-react"
import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card"
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog"
import { trpc } from "@/lib/trpc/client"
import { cn } from "@/lib/utils"

interface TagGroupCardProps {
	group: {
		id: string
		name: string
		scope: string
		pinned: boolean
		tags: Array<{
			id: string
			name: string
		}>
	}
	onEdit: () => void
}

export function TagGroupCard({ group, onEdit }: TagGroupCardProps) {
	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
	const utils = trpc.useUtils()

	const deleteMutation = trpc.tag.deleteGroup.useMutation({
		onSuccess: () => {
			utils.tag.listGroups.invalidate()
			utils.tag.getGroupedTags.invalidate()
			setDeleteDialogOpen(false)
		},
	})

	const togglePinnedMutation = trpc.tag.toggleGroupPinned.useMutation({
		onSuccess: () => {
			utils.tag.listGroups.invalidate()
			utils.tag.getGroupedTags.invalidate()
		},
	})

	const hasRelations = group.tags.length > 0

	return (
		<>
			<Card
				className={cn(
					"group hover:shadow-lg transition-shadow",
					group.pinned && "border-primary/50 bg-primary/5",
				)}
			>
				<CardHeader>
					<div className="flex items-start justify-between">
						<div className="flex items-center gap-2 flex-1">
							<FolderTree className="h-5 w-5 text-muted-foreground" />
							<div>
								<CardTitle className="text-lg flex items-center gap-2">
									{group.name}
									{group.pinned && (
										<Pin className="h-3 w-3 text-primary fill-primary" />
									)}
								</CardTitle>
								<CardDescription className="text-xs capitalize">
									{group.scope.toLowerCase()}
								</CardDescription>
							</div>
						</div>
						<Badge variant="secondary">{group.tags.length}</Badge>
					</div>
				</CardHeader>
				<CardContent className="space-y-3">
					{group.tags.length > 0 ? (
						<div className="space-y-2">
							<p className="text-xs text-muted-foreground">Tags in group:</p>
							<div className="flex flex-wrap gap-1">
								{group.tags.slice(0, 5).map((tag) => (
									<Badge key={tag.id} variant="outline" className="text-xs">
										<Hash className="h-3 w-3 mr-1" />
										{tag.name}
									</Badge>
								))}
								{group.tags.length > 5 && (
									<Badge variant="outline" className="text-xs">
										+{group.tags.length - 5} more
									</Badge>
								)}
							</div>
						</div>
					) : (
						<p className="text-xs text-muted-foreground italic">
							No tags in this group
						</p>
					)}

					<div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
						<Button
							variant="outline"
							size="sm"
							onClick={() => togglePinnedMutation.mutate({ id: group.id })}
							disabled={togglePinnedMutation.isPending}
							className={cn(group.pinned && "text-primary")}
						>
							<Pin className={cn("h-3 w-3", group.pinned && "fill-primary")} />
						</Button>
						<Button
							variant="outline"
							size="sm"
							className="flex-1"
							onClick={onEdit}
						>
							<Edit className="h-3 w-3 mr-1" />
							Edit
						</Button>
						<Button
							variant="outline"
							size="sm"
							onClick={() => setDeleteDialogOpen(true)}
							disabled={hasRelations}
							title={
								hasRelations ? "Cannot delete group with tags" : "Delete group"
							}
						>
							<Trash2 className="h-3 w-3" />
						</Button>
					</div>
				</CardContent>
			</Card>

			{/* Delete Confirmation Dialog */}
			<Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Delete Tag Group</DialogTitle>
						<DialogDescription>
							Are you sure you want to delete the tag group "{group.name}"? This
							action cannot be undone.
							{hasRelations && (
								<span className="block mt-2 text-destructive">
									This group has {group.tags.length} tag(s). Please remove or
									reassign them first.
								</span>
							)}
						</DialogDescription>
					</DialogHeader>
					<DialogFooter>
						<Button
							variant="outline"
							onClick={() => setDeleteDialogOpen(false)}
						>
							Cancel
						</Button>
						<Button
							variant="destructive"
							onClick={() => deleteMutation.mutate({ id: group.id })}
							disabled={deleteMutation.isPending || hasRelations}
						>
							{deleteMutation.isPending ? "Deleting..." : "Delete"}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</>
	)
}
