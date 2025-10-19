import { ExternalLink } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card"

interface WikiPage {
	id: string
	title: string
	content?: string | null
}

interface CharacterWikiTabProps {
	wikiPages?: Array<{ wikiPage: WikiPage }> | null
}

export function CharacterWikiTab({ wikiPages }: CharacterWikiTabProps) {
	if (!wikiPages || wikiPages.length === 0) {
		return (
			<Card>
				<CardContent className="text-center py-8 text-muted-foreground">
					No wiki pages associated with this character
				</CardContent>
			</Card>
		)
	}

	return (
		<div className="space-y-3">
			{wikiPages.map((cw) => (
				<Card
					key={cw.wikiPage.id}
					className="group hover:shadow-md transition-shadow"
				>
					<CardHeader>
						<div className="flex items-center justify-between">
							<CardTitle className="text-lg">{cw.wikiPage.title}</CardTitle>
							<Button variant="ghost" size="sm" asChild>
								<Link href={`/wiki/${cw.wikiPage.id}`}>
									<ExternalLink className="h-4 w-4" />
								</Link>
							</Button>
						</div>
						{cw.wikiPage.content && (
							<CardDescription className="line-clamp-2">
								{cw.wikiPage.content.substring(0, 150)}...
							</CardDescription>
						)}
					</CardHeader>
				</Card>
			))}
		</div>
	)
}
