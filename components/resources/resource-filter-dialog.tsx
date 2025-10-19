"use client"

import { ContentType, ResourceType } from "@prisma/client"
import { Filter } from "lucide-react"
import { useId, useState } from "react"
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
import { Label } from "@/components/ui/label"
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select"

interface ResourceFilterDialogProps {
	type?: ResourceType
	contentType?: ContentType
	onFilterChange: (filters: {
		type?: ResourceType
		contentType?: ContentType
	}) => void
}

export function ResourceFilterDialog({
	type: initialType,
	contentType: initialContentType,
	onFilterChange,
}: ResourceFilterDialogProps) {
	const [open, setOpen] = useState(false)
	const [type, setType] = useState<ResourceType | "all">(initialType || "all")
	const [contentType, setContentType] = useState<ContentType | "all">(
		initialContentType || "all",
	)
	const typeId = useId()
	const contentId = useId()

	const handleApply = () => {
		onFilterChange({
			type: type !== "all" ? type : undefined,
			contentType: contentType !== "all" ? contentType : undefined,
		})
		setOpen(false)
	}

	const handleReset = () => {
		setType("all")
		setContentType("all")
		onFilterChange({})
		setOpen(false)
	}

	const activeFilterCount =
		(type !== "all" ? 1 : 0) + (contentType !== "all" ? 1 : 0)

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button variant="outline" className="gap-2">
					<Filter className="h-4 w-4" />
					Filters
					{activeFilterCount > 0 && (
						<span className="ml-1 rounded-full bg-primary text-primary-foreground px-2 py-0.5 text-xs">
							{activeFilterCount}
						</span>
					)}
				</Button>
			</DialogTrigger>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Filter Resources</DialogTitle>
					<DialogDescription>
						Narrow down resources by type and content
					</DialogDescription>
				</DialogHeader>

				<div className="space-y-4 py-4">
					{/* Resource Type Filter */}
					<div className="space-y-2">
						<Label htmlFor={typeId}>Resource Type</Label>
						<Select
							value={type}
							onValueChange={(value) => setType(value as ResourceType | "all")}
						>
							<SelectTrigger id={typeId}>
								<SelectValue placeholder="Select type" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">All Types</SelectItem>
								<SelectItem value={ResourceType.SINGLE_FILE}>
									Single File
								</SelectItem>
								<SelectItem value={ResourceType.FILE_ARRAY}>
									File Array
								</SelectItem>
								<SelectItem value={ResourceType.FOLDER}>Folder</SelectItem>
							</SelectContent>
						</Select>
					</div>

					{/* Content Type Filter */}
					<div className="space-y-2">
						<Label htmlFor={contentId}>Content Type</Label>
						<Select
							value={contentType}
							onValueChange={(value) =>
								setContentType(value as ContentType | "all")
							}
							disabled={type === ResourceType.FOLDER}
						>
							<SelectTrigger id={contentId}>
								<SelectValue placeholder="Select content type" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">All Content Types</SelectItem>
								<SelectItem value={ContentType.IMAGE}>Image</SelectItem>
								<SelectItem value={ContentType.VIDEO}>Video</SelectItem>
								<SelectItem value={ContentType.OTHER}>Other</SelectItem>
							</SelectContent>
						</Select>
						{type === ResourceType.FOLDER && (
							<p className="text-xs text-muted-foreground">
								Content type not applicable for folders
							</p>
						)}
					</div>
				</div>

				<DialogFooter>
					<Button variant="outline" onClick={handleReset}>
						Reset
					</Button>
					<Button onClick={handleApply}>Apply Filters</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	)
}
