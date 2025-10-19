import Image from "next/image"
import Link from "next/link"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
	Card,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card"

interface CharacterCardProps {
	id: string
	name: string
	info?: string | null
	avatarUrl?: string | null
	tags?: Array<{
		tag: {
			id: string
			name: string
			pinned: boolean
			group?: {
				pinned: boolean
			} | null
		}
	}>
	_count?: {
		resources?: number
		wikiPages?: number
	}
}

export function CharacterCard({
	id,
	name,
	info,
	avatarUrl,
	tags,
	_count,
}: CharacterCardProps) {
	const pinnedTags =
		tags?.filter((ct) => ct.tag.pinned || ct.tag.group?.pinned) || []

	return (
		<Link href={`/characters/${id}`}>
			<Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer overflow-hidden h-full">
				<CardHeader className="p-0 h-full flex flex-col">
					{/* Character Image */}
					<div className="relative w-50 h-50 overflow-hidden rounded-xl mx-auto">
						{avatarUrl ? (
							<Image src={avatarUrl} alt={name} fill className="object-cover" />
						) : (
							<div className="w-full h-full flex items-center justify-center">
								<Avatar className="h-50 w-50 rounded-lg">
									<AvatarFallback className="text-4xl rounded-lg">
										{name.charAt(0).toUpperCase()}
									</AvatarFallback>
								</Avatar>
							</div>
						)}
					</div>

					{/* Character Info */}
					<div className="pl-4 pr-4 space-y-3 flex-1 w-full flex flex-col">
						<CardTitle className="line-clamp-1">{name}</CardTitle>
						{info && (
							<CardDescription className="line-clamp-2">{info}</CardDescription>
						)}

						{/* Pinned Tags */}
						<div className="flex-1">
							{pinnedTags.length > 0 && (
								<div className="flex flex-wrap gap-1">
									{pinnedTags.map((ct) => (
										<Badge
											key={ct.tag.id}
											variant="secondary"
											className="text-xs"
										>
											{ct.tag.name}
										</Badge>
									))}
								</div>
							)}
						</div>

						{/* Stats */}
						<div className="flex items-center gap-4 text-xs text-muted-foreground pt-2 border-t">
							<span>{_count?.resources || 0} resources</span>
							<span>{_count?.wikiPages || 0} wiki pages</span>
						</div>
					</div>
				</CardHeader>
			</Card>
		</Link>
	)
}
