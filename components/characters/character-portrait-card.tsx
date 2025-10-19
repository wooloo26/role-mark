import Image from "next/image"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface CharacterPortraitCardProps {
	portraitUrl: string
	name: string
}

export function CharacterPortraitCard({
	portraitUrl,
	name,
}: CharacterPortraitCardProps) {
	return (
		<Card>
			<CardHeader className="pb-3">
				<CardTitle className="text-base">Portrait</CardTitle>
			</CardHeader>
			<CardContent className="pt-0">
				<div className="aspect-[2/3] relative rounded-lg overflow-hidden mx-auto">
					<Image
						src={portraitUrl}
						alt={`${name} portrait`}
						fill
						className="object-cover"
					/>
				</div>
			</CardContent>
		</Card>
	)
}
