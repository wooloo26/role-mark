"use client"

import type { TagScope } from "@prisma/client"
import { X } from "lucide-react"
import { useState } from "react"
import { trpc } from "@/client/trpc"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

interface TagSelectorProps {
	scope: TagScope
	selectedTags: string[]
	onTagsChange: (tagIds: string[]) => void
	placeholder?: string
	className?: string
}

export function TagSelector({
	scope,
	selectedTags,
	onTagsChange,
	placeholder = "Search tags...",
	className,
}: TagSelectorProps) {
	const [searchQuery, setSearchQuery] = useState("")

	// Fetch tags for the specific scope
	const { data: tags = [], isLoading } = trpc.tag.getByScope.useQuery({
		scope,
	})

	// Filter tags based on search
	const filteredTags = tags.filter((tag) =>
		tag.name.toLowerCase().includes(searchQuery.toLowerCase()),
	)

	const handleToggle = (tagId: string) => {
		if (selectedTags.includes(tagId)) {
			onTagsChange(selectedTags.filter((id) => id !== tagId))
		} else {
			onTagsChange([...selectedTags, tagId])
		}
	}

	// Group tags by their groups
	const groupedTags = filteredTags.reduce(
		(acc, tag) => {
			const groupName = tag.group?.name || "Ungrouped"
			if (!acc[groupName]) {
				acc[groupName] = []
			}
			acc[groupName].push(tag)
			return acc
		},
		{} as Record<string, typeof filteredTags>,
	)

	return (
		<div className={cn("space-y-3", className)}>
			{/* Search Input */}
			<Input
				type="text"
				placeholder={placeholder}
				value={searchQuery}
				onChange={(e) => setSearchQuery(e.target.value)}
				className="w-full"
			/>

			{/* Tags Grid */}
			<div className="border rounded-lg p-3 max-h-[400px] overflow-y-auto">
				{isLoading ? (
					<div className="text-sm text-muted-foreground text-center py-4">
						Loading tags...
					</div>
				) : filteredTags.length === 0 ? (
					<div className="text-sm text-muted-foreground text-center py-4">
						No tags found.
					</div>
				) : (
					<div className="space-y-4">
						{Object.entries(groupedTags).map(([groupName, groupTags]) => (
							<div key={groupName}>
								<h4 className="text-sm font-medium mb-2 text-muted-foreground">
									{groupName}
								</h4>
								<div className="flex flex-wrap gap-2">
									{groupTags.map((tag) => {
										const isSelected = selectedTags.includes(tag.id)
										return (
											<Badge
												key={tag.id}
												variant={isSelected ? "default" : "outline"}
												className={cn(
													"cursor-pointer transition-all gap-1 pl-3 pr-2 py-1.5",
													isSelected
														? "hover:bg-primary/90"
														: "hover:bg-secondary",
												)}
												onClick={() => handleToggle(tag.id)}
											>
												<span className="text-sm">{tag.name}</span>
												{isSelected && <X className="h-3 w-3 ml-1" />}
												<span className="text-xs opacity-70 ml-1">
													{tag._count.characterTags + tag._count.resourceTags}
												</span>
											</Badge>
										)
									})}
								</div>
							</div>
						))}
					</div>
				)}
			</div>

			{/* Selected Count */}
			{selectedTags.length > 0 && (
				<div className="text-sm text-muted-foreground">
					{selectedTags.length} tag{selectedTags.length > 1 ? "s" : ""} selected
				</div>
			)}
		</div>
	)
}
