import { ExternalLink } from "lucide-react"
import Link from "next/link"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

interface RelationFrom {
	id: string
	toCharacter: {
		id: string
		name: string
		avatarUrl?: string | null
	}
	relationType: {
		name: string
	}
}

interface RelationTo {
	id: string
	fromCharacter: {
		id: string
		name: string
		avatarUrl?: string | null
	}
	relationType: {
		name: string
	}
}

interface CharacterRelationsTabProps {
	relationsFrom?: RelationFrom[] | null
	relationsTo?: RelationTo[] | null
}

export function CharacterRelationsTab({
	relationsFrom,
	relationsTo,
}: CharacterRelationsTabProps) {
	const hasRelations =
		(relationsFrom && relationsFrom.length > 0) ||
		(relationsTo && relationsTo.length > 0)

	if (!hasRelations) {
		return (
			<Card>
				<CardContent className="text-center py-8 text-muted-foreground">
					No relationships defined for this character
				</CardContent>
			</Card>
		)
	}

	return (
		<div className="space-y-6">
			{relationsFrom && relationsFrom.length > 0 && (
				<div>
					<h3 className="font-semibold mb-3">Relationships</h3>
					<div className="space-y-2">
						{relationsFrom.map((rel) => (
							<Card key={rel.id}>
								<CardContent className="flex items-center gap-4 p-4">
									<Avatar>
										<AvatarImage src={rel.toCharacter.avatarUrl || undefined} />
										<AvatarFallback>
											{rel.toCharacter.name.charAt(0).toUpperCase()}
										</AvatarFallback>
									</Avatar>
									<div className="flex-1">
										<p className="font-medium">{rel.toCharacter.name}</p>
										<p className="text-sm text-muted-foreground">
											{rel.relationType.name}
										</p>
									</div>
									<Button variant="ghost" size="sm" asChild>
										<Link href={`/characters/${rel.toCharacter.id}`}>
											<ExternalLink className="h-4 w-4" />
										</Link>
									</Button>
								</CardContent>
							</Card>
						))}
					</div>
				</div>
			)}
		</div>
	)
}
