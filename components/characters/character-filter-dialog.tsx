import { Filter } from "lucide-react"
import { TagSelector } from "@/components/tag-selector"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog"

interface CharacterFilterDialogProps {
	open: boolean
	onOpenChange: (open: boolean) => void
	selectedTags: string[]
	onTagsChange: (tags: string[]) => void
	onClearFilters: () => void
}

export function CharacterFilterDialog({
	open,
	onOpenChange,
	selectedTags,
	onTagsChange,
	onClearFilters,
}: CharacterFilterDialogProps) {
	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogTrigger asChild>
				<Button variant="outline" className="gap-2 relative">
					<Filter className="h-4 w-4" />
					Filters
					{selectedTags.length > 0 && (
						<Badge
							variant="secondary"
							className="ml-2 h-5 w-5 rounded-full p-0 flex items-center justify-center"
						>
							{selectedTags.length}
						</Badge>
					)}
				</Button>
			</DialogTrigger>
			<DialogContent className="sm:max-w-[600px]">
				<DialogHeader>
					<DialogTitle>Filter Characters</DialogTitle>
					<DialogDescription>
						Filter characters by tags and other criteria
					</DialogDescription>
				</DialogHeader>
				<div className="space-y-6 py-4">
					<div className="space-y-2">
						<div className="text-sm font-medium">Tags</div>
						<TagSelector
							scope="CHARACTER"
							selectedTags={selectedTags}
							onTagsChange={onTagsChange}
							placeholder="Filter by tags..."
						/>
					</div>
				</div>
				<div className="flex justify-between">
					<Button variant="outline" onClick={onClearFilters}>
						Clear Filters
					</Button>
					<Button onClick={() => onOpenChange(false)}>Apply Filters</Button>
				</div>
			</DialogContent>
		</Dialog>
	)
}
