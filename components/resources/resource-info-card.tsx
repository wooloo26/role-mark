import { Badge } from "@/components/ui/badge"
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card"

interface ResourceInfoCardProps {
	title: string
	description?: string | null
	tags?: Array<{
		tag: {
			id: string
			name: string
			group?: {
				id: string
				name: string
			} | null
		}
	}>
	uploader?: {
		id: string
		name: string | null
		image: string | null
	} | null
	createdAt: Date
	updatedAt: Date
}

export function ResourceInfoCard({
	title,
	description,
	tags = [],
	uploader,
	createdAt,
	updatedAt,
}: ResourceInfoCardProps) {
	return (
		<Card>
			<CardHeader>
				<CardTitle>{title}</CardTitle>
				{description && <CardDescription>{description}</CardDescription>}
			</CardHeader>
			<CardContent className="space-y-4">
				{/* Uploader Info */}
				<div className="space-y-2">
					<h3 className="text-sm font-medium">Uploader</h3>
					<p className="text-sm text-muted-foreground">
						{uploader?.name || "Unknown"}
					</p>
				</div>

				{/* Dates */}
				<div className="grid grid-cols-2 gap-4">
					<div className="space-y-1">
						<h3 className="text-sm font-medium">Created</h3>
						<p className="text-sm text-muted-foreground">
							{new Date(createdAt).toLocaleDateString()}
						</p>
					</div>
					<div className="space-y-1">
						<h3 className="text-sm font-medium">Updated</h3>
						<p className="text-sm text-muted-foreground">
							{new Date(updatedAt).toLocaleDateString()}
						</p>
					</div>
				</div>

				{/* Tags */}
				{tags.length > 0 && (
					<div className="space-y-2">
						<h3 className="text-sm font-medium">Tags</h3>
						<div className="flex flex-wrap gap-2">
							{tags.map((tagRelation) => (
								<Badge key={tagRelation.tag.id} variant="secondary">
									{tagRelation.tag.group && (
										<span className="text-muted-foreground">
											{tagRelation.tag.group.name} /{" "}
										</span>
									)}
									{tagRelation.tag.name}
								</Badge>
							))}
						</div>
					</div>
				)}
			</CardContent>
		</Card>
	)
}
