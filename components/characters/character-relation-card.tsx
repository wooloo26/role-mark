"use client"

import { Edit2, ExternalLink, Trash2 } from "lucide-react"
import Link from "next/link"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

interface CharacterRelationCardProps {
	relationId: string
	character: {
		id: string
		name: string
		avatarUrl?: string | null
	}
	relationType: {
		id: string
		name: string
	}
	isBidirectional: boolean
	direction: "outgoing" | "incoming"
	onEdit?: (relationId: string) => void
	onDelete?: (relationId: string) => void
	isDeleting?: boolean
}

export function CharacterRelationCard({
	relationId,
	character,
	relationType,
	isBidirectional,
	direction,
	onEdit,
	onDelete,
	isDeleting,
}: CharacterRelationCardProps) {
	return (
		<Card className="hover:shadow-md transition-shadow">
			<CardContent className="flex flex-col items-center gap-4 pl-4 pr-4">
				<div className="flex items-center gap-4">
					<Avatar className="h-12 w-12">
						<AvatarImage src={character.avatarUrl || undefined} />
						<AvatarFallback>
							{character.name.charAt(0).toUpperCase()}
						</AvatarFallback>
					</Avatar>

					<div className="flex-1 min-w-0">
						<div className="flex items-center gap-2 mb-1">
							<Link
								href={`/characters/${character.id}`}
								className="font-medium hover:underline truncate"
							>
								{character.name}
							</Link>
							{direction === "incoming" && (
								<Badge variant="outline" className="text-xs shrink-0">
									← incoming
								</Badge>
							)}
						</div>
						<div className="flex items-center gap-2 flex-wrap">
							<span className="text-sm text-muted-foreground">
								{relationType.name}
							</span>
							{isBidirectional && (
								<Badge variant="secondary" className="text-xs">
									↔ bidirectional
								</Badge>
							)}
						</div>
					</div>
				</div>

				<div className="flex items-center gap-1 shrink-0">
					<Button variant="ghost" size="icon" asChild>
						<Link href={`/characters/${character.id}`}>
							<ExternalLink className="h-4 w-4" />
						</Link>
					</Button>
					{onEdit && (
						<Button
							variant="ghost"
							size="icon"
							onClick={() => onEdit(relationId)}
							disabled={isDeleting}
						>
							<Edit2 className="h-4 w-4" />
						</Button>
					)}
					{onDelete && (
						<Button
							variant="ghost"
							size="icon"
							onClick={() => onDelete(relationId)}
							disabled={isDeleting}
						>
							<Trash2 className="h-4 w-4" />
						</Button>
					)}
				</div>
			</CardContent>
		</Card>
	)
}
