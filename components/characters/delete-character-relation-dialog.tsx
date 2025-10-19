"use client"

import { AlertTriangle } from "lucide-react"
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { trpc } from "@/lib/trpc/client"

interface DeleteCharacterRelationDialogProps {
	relationId: string
	characterId: string
	targetCharacterName: string
	relationTypeName: string
	open: boolean
	onOpenChange: (open: boolean) => void
}

export function DeleteCharacterRelationDialog({
	relationId,
	characterId,
	targetCharacterName,
	relationTypeName,
	open,
	onOpenChange,
}: DeleteCharacterRelationDialogProps) {
	const utils = trpc.useUtils()

	const deleteMutation = trpc.relation.delete.useMutation({
		onSuccess: () => {
			utils.relation.getRelations.invalidate({ characterId })
			utils.character.getById.invalidate({ id: characterId })
			onOpenChange(false)
		},
	})

	const handleDelete = () => {
		deleteMutation.mutate({ id: relationId })
	}

	return (
		<AlertDialog open={open} onOpenChange={onOpenChange}>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle className="flex items-center gap-2">
						<AlertTriangle className="h-5 w-5 text-destructive" />
						Delete Relation
					</AlertDialogTitle>
					<AlertDialogDescription>
						Are you sure you want to delete the{" "}
						<strong>{relationTypeName}</strong> relationship with{" "}
						<strong>{targetCharacterName}</strong>? This action cannot be
						undone.
					</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter>
					<AlertDialogCancel disabled={deleteMutation.isPending}>
						Cancel
					</AlertDialogCancel>
					<AlertDialogAction
						onClick={handleDelete}
						disabled={deleteMutation.isPending}
						className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
					>
						{deleteMutation.isPending ? "Deleting..." : "Delete"}
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	)
}
