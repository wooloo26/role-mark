"use client"

import { Edit, Hash, Trash2 } from "lucide-react"
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

interface TagCardProps {
	tag: {
		id: string
		name: string
		slug: string
		scope: string
		group?: { id: string; name: string } | null
		_count: {
			characterTags: number
			resourceTags: number
		}
	}
	onEdit: () => void
}

export function TagCard({ tag, onEdit }: TagCardProps) {
	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
	const utils = trpc.useUtils()

	const deleteMutation = trpc.tag.delete.useMutation({
		onSuccess: () => {
			utils.tag.getGroupedTags.invalidate()
			utils.tag.search.invalidate()
			setDeleteDialogOpen(false)
		},
	})

	const totalUsage = tag._count.characterTags + tag._count.resourceTags

	return (
		<>
			<Card className="group hover:shadow-lg transition-shadow">
				<CardHeader className="pb-3">
					<div className="flex items-start justify-between">
						<div className="flex items-center gap-2 flex-1 min-w-0">
							<Hash className="h-4 w-4 text-muted-foreground shrink-0" />
							<div className="min-w-0 flex-1">
								<CardTitle className="text-lg truncate">{tag.name}</CardTitle>
								<CardDescription className="text-xs truncate">
									{tag.slug}
								</CardDescription>
							</div>
						</div>
					</div>
				</CardHeader>
				<CardContent className="space-y-3">
					{tag.group && (
						<Badge variant="outline" className="text-xs">
							{tag.group.name}
						</Badge>
					)}

					<div className="flex items-center justify-between text-sm">
						<span className="text-muted-foreground">Usage</span>
						<Badge variant="secondary">{totalUsage}</Badge>
					</div>

					<div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
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
							disabled={totalUsage > 0}
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
						<DialogTitle>Delete Tag</DialogTitle>
						<DialogDescription>
							Are you sure you want to delete the tag "{tag.name}"? This action
							cannot be undone.
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
							onClick={() => deleteMutation.mutate({ id: tag.id })}
							disabled={deleteMutation.isPending}
						>
							{deleteMutation.isPending ? "Deleting..." : "Delete"}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</>
	)
}
