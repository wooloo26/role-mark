import { FolderTree } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface TagGroupHeaderProps {
	name: string
	count: number
	icon?: React.ComponentType<{ className?: string }>
}

export function TagGroupHeader({
	name,
	count,
	icon: Icon = FolderTree,
}: TagGroupHeaderProps) {
	return (
		<div className="flex items-center justify-between mb-4">
			<h3 className="text-xl font-semibold flex items-center gap-2">
				<Icon className="h-5 w-5" />
				{name}
			</h3>
			<Badge variant="outline">{count} tags</Badge>
		</div>
	)
}
