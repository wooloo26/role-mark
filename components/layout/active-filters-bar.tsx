import { X } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

interface FilterBadgeProps {
	label: string
	onRemove: () => void
}

function FilterBadge({ label, onRemove }: FilterBadgeProps) {
	return (
		<Badge variant="secondary" className="gap-1">
			{label}
			<button
				type="button"
				onClick={onRemove}
				className="ml-1 hover:text-destructive"
			>
				<X className="h-3 w-3" />
			</button>
		</Badge>
	)
}

interface ActiveFiltersBarProps {
	searchQuery?: string
	onClearSearch?: () => void
	filterCount?: number
	filterLabel?: string
	onClearFilters?: () => void
	onClearAll: () => void
}

export function ActiveFiltersBar({
	searchQuery,
	onClearSearch,
	filterCount = 0,
	filterLabel = "filters",
	onClearFilters,
	onClearAll,
}: ActiveFiltersBarProps) {
	const hasFilters = searchQuery || filterCount > 0

	if (!hasFilters) return null

	return (
		<div className="mb-6 flex flex-wrap items-center gap-2">
			<span className="text-sm text-muted-foreground">Active filters:</span>
			{searchQuery && onClearSearch && (
				<FilterBadge
					label={`Search: ${searchQuery}`}
					onRemove={onClearSearch}
				/>
			)}
			{filterCount > 0 && onClearFilters && (
				<FilterBadge
					label={`${filterCount} ${filterLabel}${filterCount !== 1 ? "s" : ""}`}
					onRemove={onClearFilters}
				/>
			)}
			<Button
				variant="ghost"
				size="sm"
				onClick={onClearAll}
				className="h-7 text-xs"
			>
				Clear all
			</Button>
		</div>
	)
}
