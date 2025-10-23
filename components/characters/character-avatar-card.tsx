import Image from "next/image"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Card, CardContent } from "@/components/ui/card"
import { getFileApiUrl } from "@/lib/path"

interface CharacterAvatarCardProps {
	avatarUrl?: string | null
	name: string
}

export function CharacterAvatarCard({
	avatarUrl,
	name,
}: CharacterAvatarCardProps) {
	return (
		<Card>
			<CardContent className="p-4">
				<div className="aspect-square relative rounded-xl overflow-hidden mb-3 max-w-[220px] mx-auto">
					{avatarUrl ? (
						<Image
							src={getFileApiUrl(avatarUrl)}
							alt={`${name}'s avatar`}
							fill
							sizes="(max-width: 768px) 220px, 220px"
							className="object-cover"
							quality={75}
							priority
						/>
					) : (
						<div className="w-full h-full flex items-center justify-center">
							<Avatar className="h-20 w-20">
								<AvatarFallback className="text-4xl">
									{name.charAt(0).toUpperCase()}
								</AvatarFallback>
							</Avatar>
						</div>
					)}
				</div>
				<h1 className="text-xl font-bold text-center">{name}</h1>
			</CardContent>
		</Card>
	)
}
