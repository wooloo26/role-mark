"use client"

import { StaticTagDataType } from "@prisma/client"
import {
	Calendar,
	Edit,
	Text,
	ToggleLeft,
	Trash2,
	TrendingUp,
} from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"
import { trpc } from "@/client/trpc"
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
import { cn } from "@/lib/utils"
import { EditStaticTagDialog } from "./edit-static-tag-dialog"

interface StaticTagCardProps {
	tag: {
		id: string
		name: string
		displayName: string
		dataType: StaticTagDataType
		unit?: string | null
		description?: string | null
		isRequired: boolean
		_count: {
			characterStaticTags: number
		}
	}
}

const dataTypeIcons: Record<StaticTagDataType, React.ReactNode> = {
	[StaticTagDataType.STRING]: <Text className="h-4 w-4" />,
	[StaticTagDataType.NUMBER]: <TrendingUp className="h-4 w-4" />,
	[StaticTagDataType.DATE]: <Calendar className="h-4 w-4" />,
	[StaticTagDataType.BOOLEAN]: <ToggleLeft className="h-4 w-4" />,
}

const dataTypeColors: Record<StaticTagDataType, string> = {
	[StaticTagDataType.STRING]: "bg-blue-500/10 text-blue-500 border-blue-500/20",
	[StaticTagDataType.NUMBER]:
		"bg-green-500/10 text-green-500 border-green-500/20",
	[StaticTagDataType.DATE]:
		"bg-purple-500/10 text-purple-500 border-purple-500/20",
	[StaticTagDataType.BOOLEAN]:
		"bg-orange-500/10 text-orange-500 border-orange-500/20",
}

export function StaticTagCard({ tag }: StaticTagCardProps) {
	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
	const [editDialogOpen, setEditDialogOpen] = useState(false)
	const utils = trpc.useUtils()

	const deleteMutation = trpc.staticTag.delete.useMutation({
		onSuccess: () => {
			utils.staticTag.list.invalidate()
			utils.staticTag.getGroupedByDataType.invalidate()
			utils.staticTag.getStats.invalidate()
			setDeleteDialogOpen(false)
			toast.success("Static tag deleted successfully")
		},
		onError: () => {
			toast.error("Failed to delete static tag")
		},
	})

	const usageCount = tag._count.characterStaticTags

	return (
		<>
			<Card
				className={cn(
					"group hover:shadow-lg transition-shadow relative",
					tag.isRequired && "border-primary/50 bg-primary/5",
				)}
			>
				<CardHeader className="pb-3">
					<div className="flex items-start justify-between gap-2">
						<div className="flex items-center gap-2 flex-1 min-w-0">
							<div
								className={cn(
									"p-2 rounded-lg border",
									dataTypeColors[tag.dataType],
								)}
							>
								{dataTypeIcons[tag.dataType]}
							</div>
							<div className="min-w-0 flex-1">
								<CardTitle className="text-lg truncate flex items-center gap-2">
									{tag.displayName}
									{tag.isRequired && (
										<Badge variant="destructive" className="text-xs">
											Required
										</Badge>
									)}
								</CardTitle>
								<CardDescription className="text-xs truncate">
									{tag.name}
								</CardDescription>
							</div>
						</div>
					</div>
				</CardHeader>
				<CardContent className="space-y-3">
					<div className="flex items-center gap-2 flex-wrap">
						<Badge variant="outline" className="text-xs">
							{tag.dataType}
						</Badge>
						{tag.unit && (
							<Badge variant="secondary" className="text-xs">
								Unit: {tag.unit}
							</Badge>
						)}
					</div>

					{tag.description && (
						<p className="text-sm text-muted-foreground line-clamp-2">
							{tag.description}
						</p>
					)}

					<div className="flex items-center justify-between text-sm">
						<span className="text-muted-foreground">Usage</span>
						<Badge variant="secondary">{usageCount}</Badge>
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

			{/* Delete Confirmation Dialog */}
			<Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Delete Static Tag Definition</DialogTitle>
						<DialogDescription>
							Are you sure you want to delete "{tag.displayName}"?
							{usageCount > 0 && (
								<span className="block mt-2 text-destructive font-medium">
									This will also delete {usageCount} character attribute
									{usageCount > 1 ? "s" : ""} using this definition.
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
							onClick={() => deleteMutation.mutate({ id: tag.id })}
							disabled={deleteMutation.isPending}
						>
							{deleteMutation.isPending ? "Deleting..." : "Delete"}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			{/* Edit Dialog */}
			<EditStaticTagDialog
				open={editDialogOpen}
				onOpenChange={setEditDialogOpen}
				tag={tag}
			/>
		</>
	)
}
