import { Image as ImageIcon } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

interface Resource {
	id: string
	title: string
}

interface CharacterResourcesTabProps {
	resources?: Array<{ resource: Resource }> | null
}

export function CharacterResourcesTab({
	resources,
}: CharacterResourcesTabProps) {
	if (!resources || resources.length === 0) {
		return (
			<Card>
				<CardContent className="text-center py-8 text-muted-foreground">
					No resources associated with this character
				</CardContent>
			</Card>
		)
	}

	return (
		<div className="grid grid-cols-2 md:grid-cols-3 gap-4">
			{resources.map((cr) => (
				<Card
					key={cr.resource.id}
					className="group hover:shadow-md transition-shadow"
				>
					<CardContent className="p-4">
						<div className="aspect-square bg-muted rounded-lg mb-2 flex items-center justify-center">
							<ImageIcon className="h-8 w-8 text-muted-foreground" />
						</div>
						<p className="text-sm font-medium truncate">{cr.resource.title}</p>
					</CardContent>
				</Card>
			))}
		</div>
	)
}
