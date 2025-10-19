import { Calendar, Ruler, Weight } from "lucide-react"

interface CharacterAttributesDisplayProps {
	staticTagsMap: Map<string, string>
}

export function CharacterAttributesDisplay({
	staticTagsMap,
}: CharacterAttributesDisplayProps) {
	const hasAttributes =
		staticTagsMap.get("height") ||
		staticTagsMap.get("weight") ||
		staticTagsMap.get("birthday")

	if (!hasAttributes) return null

	return (
		<div className="border-t pt-4">
			<h3 className="text-lg font-semibold mb-3">Attributes</h3>
			<div className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-2">
				{staticTagsMap.get("height") && (
					<div className="flex items-center gap-2">
						<Ruler className="h-3.5 w-3.5 text-muted-foreground" />
						<span className="text-sm text-muted-foreground">Height:</span>
						<span className="text-sm font-medium">
							{staticTagsMap.get("height")} cm
						</span>
					</div>
				)}
				{staticTagsMap.get("weight") && (
					<div className="flex items-center gap-2">
						<Weight className="h-3.5 w-3.5 text-muted-foreground" />
						<span className="text-sm text-muted-foreground">Weight:</span>
						<span className="text-sm font-medium">
							{staticTagsMap.get("weight")} kg
						</span>
					</div>
				)}
				{staticTagsMap.get("birthday") && (
					<div className="flex items-center gap-2">
						<Calendar className="h-3.5 w-3.5 text-muted-foreground" />
						<span className="text-sm text-muted-foreground">Birthday:</span>
						<span className="text-sm font-medium">
							{new Date(staticTagsMap.get("birthday")!).toLocaleDateString()}
						</span>
					</div>
				)}
			</div>
		</div>
	)
}
