import { ArrowLeft, Edit, Trash2 } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog"

interface CharacterDetailHeaderProps {
	characterId: string
	characterName: string
	onDelete: () => void
	isDeleting: boolean
}

export function CharacterDetailHeader({
	characterId,
	characterName,
	onDelete,
	isDeleting,
}: CharacterDetailHeaderProps) {
	return (
		<div className="flex items-center justify-between mb-8">
			<Button variant="ghost" asChild>
				<Link href="/characters">
					<ArrowLeft className="h-4 w-4 mr-2" />
					Back
				</Link>
			</Button>
			<div className="flex gap-2">
				<Button variant="outline" asChild>
					<Link href={`/characters/${characterId}/edit`}>
						<Edit className="h-4 w-4 mr-2" />
						Edit
					</Link>
				</Button>
				<Dialog>
					<DialogTrigger asChild>
						<Button variant="destructive">
							<Trash2 className="h-4 w-4 mr-2" />
							Delete
						</Button>
					</DialogTrigger>
					<DialogContent>
						<DialogHeader>
							<DialogTitle>Delete Character</DialogTitle>
							<DialogDescription>
								Are you sure you want to delete "{characterName}"? This action
								cannot be undone.
							</DialogDescription>
						</DialogHeader>
						<DialogFooter>
							<Button variant="outline">Cancel</Button>
							<Button
								variant="destructive"
								onClick={onDelete}
								disabled={isDeleting}
							>
								{isDeleting ? "Deleting..." : "Delete"}
							</Button>
						</DialogFooter>
					</DialogContent>
				</Dialog>
			</div>
		</div>
	)
}
