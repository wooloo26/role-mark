import Image from "next/image"
import Link from "next/link"
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card"

interface ResourceCharactersCardProps {
	characters: Array<{
		character: {
			id: string
			name: string
			avatarUrl?: string | null
		}
	}>
}

export function ResourceCharactersCard({
	characters,
}: ResourceCharactersCardProps) {
	if (characters.length === 0) {
		return (
			<Card>
				<CardHeader>
					<CardTitle>Associated Characters</CardTitle>
					<CardDescription>
						No characters associated with this resource
					</CardDescription>
				</CardHeader>
			</Card>
		)
	}

	return (
		<Card>
			<CardHeader>
				<CardTitle>Associated Characters</CardTitle>
				<CardDescription>Characters linked to this resource</CardDescription>
			</CardHeader>
			<CardContent>
				<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
					{characters.map(({ character }) => (
						<Link
							key={character.id}
							href={`/characters/${character.id}`}
							className="group"
						>
							<div className="space-y-2">
								{character.avatarUrl ? (
									<div className="relative aspect-square w-full rounded-lg overflow-hidden border group-hover:border-primary transition-colors">
										<Image
											src={character.avatarUrl}
											alt={character.name}
											fill
											className="object-cover"
										/>
									</div>
								) : (
									<div className="aspect-square w-full rounded-lg border bg-muted flex items-center justify-center group-hover:border-primary transition-colors">
										<span className="text-4xl text-muted-foreground">
											{character.name.charAt(0).toUpperCase()}
										</span>
									</div>
								)}
								<p className="text-sm font-medium text-center line-clamp-1 group-hover:text-primary transition-colors">
									{character.name}
								</p>
							</div>
						</Link>
					))}
				</div>
			</CardContent>
		</Card>
	)
}
