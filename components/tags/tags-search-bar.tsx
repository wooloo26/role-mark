import type { TagScope } from "@prisma/client"
import { Plus } from "lucide-react"
import { SearchBar } from "@/components/layout/search-bar"
import { Button } from "@/components/ui/button"
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select"

interface TagsSearchBarProps {
	searchQuery: string
	onSearchChange: (value: string) => void
	selectedScope: TagScope
	onScopeChange: (scope: TagScope) => void
	onCreateClick: () => void
	createLabel?: string
	scopeLabels?: Record<string, string>
}

export function TagsSearchBar({
	searchQuery,
	onSearchChange,
	selectedScope,
	onScopeChange,
	onCreateClick,
	createLabel = "New Tag",
	scopeLabels = {
		CHARACTER: "Character Tags",
		RESOURCE: "Resource Tags",
	},
}: TagsSearchBarProps) {
	return (
		<SearchBar
			value={searchQuery}
			onChange={onSearchChange}
			placeholder="Search tags..."
			actions={
				<>
					<Select
						value={selectedScope}
						onValueChange={(value) => onScopeChange(value as TagScope)}
					>
						<SelectTrigger className="w-[180px]">
							<SelectValue placeholder="Select scope" />
						</SelectTrigger>
						<SelectContent>
							{Object.entries(scopeLabels).map(([key, label]) => (
								<SelectItem key={key} value={key}>
									{label}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
					<Button onClick={onCreateClick} className="gap-2">
						<Plus className="h-4 w-4" />
						{createLabel}
					</Button>
				</>
			}
		/>
	)
}
