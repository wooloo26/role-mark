"use client"

import { Edit, Heart, Trash2, Users } from "lucide-react"
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
import { EditRelationTypeDialog } from "./edit-relation-type-dialog"

interface RelationTypeCardProps {
	relationType: {
		id: string
		name: string
		description: string | null
		_count: {
			relations: number
		}
	}
}

const relationTypeIcons: Record<string, React.ReactNode> = {
	friends: <Heart className="h-4 w-4" />,
	rivals: <Users className="h-4 w-4" />,
	siblings: <Users className="h-4 w-4" />,
	mentor: <Users className="h-4 w-4" />,
	allies: <Users className="h-4 w-4" />,
	enemies: <Users className="h-4 w-4" />,
}

const relationTypeColors: Record<string, string> = {
	friends: "bg-pink-500/10 text-pink-500 border-pink-500/20",
	rivals: "bg-orange-500/10 text-orange-500 border-orange-500/20",
	siblings: "bg-blue-500/10 text-blue-500 border-blue-500/20",
	mentor: "bg-purple-500/10 text-purple-500 border-purple-500/20",
	allies: "bg-green-500/10 text-green-500 border-green-500/20",
	enemies: "bg-red-500/10 text-red-500 border-red-500/20",
}

export function RelationTypeCard({ relationType }: RelationTypeCardProps) {
	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
	const [editDialogOpen, setEditDialogOpen] = useState(false)
	const utils = trpc.useUtils()

	const deleteMutation = trpc.relation.deleteType.useMutation({
		onSuccess: () => {
			utils.relation.getAllTypes.invalidate()
			setDeleteDialogOpen(false)
		},
	})

	const usageCount = relationType._count.relations
	const icon = relationTypeIcons[relationType.name] || (
		<Users className="h-4 w-4" />
	)
	const colorClass =
		relationTypeColors[relationType.name] ||
		"bg-gray-500/10 text-gray-500 border-gray-500/20"

	return (
		<>
			<Card className="group hover:shadow-lg transition-shadow relative">
				<CardHeader className="pb-3">
					<div className="flex items-start justify-between gap-2">
						<div className="flex items-center gap-2 flex-1 min-w-0">
							<div className={cn("p-2 rounded-lg border", colorClass)}>
								{icon}
							</div>
							<div className="flex-1 min-w-0">
								<CardTitle className="text-lg capitalize truncate">
									{relationType.name}
								</CardTitle>
							</div>
						</div>
					</div>
				</CardHeader>

				<CardContent className="space-y-3">
					{relationType.description && (
						<CardDescription className="line-clamp-2">
							{relationType.description}
						</CardDescription>
					)}

					<div className="flex items-center justify-between pt-2 border-t">
						<span className="text-sm text-muted-foreground">Usage</span>
						<Badge variant="secondary" className="font-mono">
							{usageCount}
						</Badge>
					</div>

					<div className="flex gap-2 opacity-50 group-hover:opacity-100 transition-opacity pt-2">
						<Button
							variant="outline"
							size="sm"
							onClick={() => setEditDialogOpen(true)}
							className="flex-1"
						>
							<Edit />
							Edit
						</Button>
						<Button
							variant="outline"
							size="sm"
							onClick={() => setDeleteDialogOpen(true)}
							className="text-destructive hover:text-destructive"
						>
							<Trash2 />
						</Button>
					</div>
				</CardContent>
			</Card>

			<EditRelationTypeDialog
				relationType={relationType}
				open={editDialogOpen}
				onOpenChange={setEditDialogOpen}
			/>

			<Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Delete Relation Type</DialogTitle>
						<DialogDescription>
							Are you sure you want to delete the "{relationType.name}" relation
							type?
							{usageCount > 0 && (
								<span className="block mt-2 text-destructive font-medium">
									This relation type is currently used in {usageCount} relation
									{usageCount !== 1 ? "s" : ""} and cannot be deleted.
								</span>
							)}
						</DialogDescription>
					</DialogHeader>
					<DialogFooter>
						<Button
							variant="outline"
							onClick={() => setDeleteDialogOpen(false)}
							disabled={deleteMutation.isPending}
						>
							Cancel
						</Button>
						<Button
							variant="destructive"
							onClick={() => deleteMutation.mutate({ id: relationType.id })}
							disabled={deleteMutation.isPending || usageCount > 0}
						>
							{deleteMutation.isPending ? "Deleting..." : "Delete"}
						</Button>
					</DialogFooter>
					{deleteMutation.isError && (
						<p className="text-sm text-destructive mt-2">
							{deleteMutation.error.message}
						</p>
					)}
				</DialogContent>
			</Dialog>
		</>
	)
}
