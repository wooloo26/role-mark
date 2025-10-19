import {
	ArrowLeft,
	FileText,
	Image as ImageIcon,
	Link2,
	MessageSquare,
} from "lucide-react"
import Link from "next/link"
import { CharacterAvatarCard } from "@/components/characters/character-avatar-card"
import { CharacterCommentsTab } from "@/components/characters/character-comments-tab"
import { CharacterDetailClient } from "@/components/characters/character-detail-client"
import { CharacterInfoCard } from "@/components/characters/character-info-card"
import { CharacterPortraitCard } from "@/components/characters/character-portrait-card"
import { CharacterRelationsTab } from "@/components/characters/character-relations-tab"
import { CharacterResourcesTab } from "@/components/characters/character-resources-tab"
import { CharacterWikiTab } from "@/components/characters/character-wiki-tab"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { api } from "@/lib/trpc/server"

interface CharacterDetailPageProps {
	params: Promise<{ id: string }>
}

export default async function CharacterDetailPage({
	params,
}: CharacterDetailPageProps) {
	const { id } = await params
	const character = await (await api()).character.getById({ id })

	if (!character) {
		return (
			<div className="container mx-auto px-4 py-16 text-center">
				<h1 className="text-2xl font-bold mb-4">Character not found</h1>
				<Button asChild>
					<Link href="/characters">
						<ArrowLeft className="h-4 w-4 mr-2" />
						Back to Characters
					</Link>
				</Button>
			</div>
		)
	}

	return (
		<div className="container mx-auto px-4 py-8">
			<CharacterDetailClient
				characterId={character.id}
				characterName={character.name}
			/>

			{/* Main Content */}
			<div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
				{/* Left Column - Images */}
				<div className="lg:col-span-1 space-y-6">
					<CharacterAvatarCard
						name={character.name}
						avatarUrl={character.avatarUrl}
					/>
					{character.portraitUrl && (
						<CharacterPortraitCard
							name={character.name}
							portraitUrl={character.portraitUrl}
						/>
					)}
				</div>

				{/* Right Column - Details & Content */}
				<div className="lg:col-span-3 space-y-4">
					<CharacterInfoCard
						info={character.info}
						staticTags={character.staticTags}
						tags={character.tags}
					/>

					{/* Tabs */}
					<Tabs defaultValue="resources" className="w-full">
						<TabsList className="grid w-full grid-cols-4 mb-2">
							<TabsTrigger value="resources" className="gap-2">
								<ImageIcon className="h-4 w-4" />
								Resources
							</TabsTrigger>
							<TabsTrigger value="wiki" className="gap-2">
								<FileText className="h-4 w-4" />
								Wiki
							</TabsTrigger>
							<TabsTrigger value="relations" className="gap-2">
								<Link2 className="h-4 w-4" />
								Relations
							</TabsTrigger>
							<TabsTrigger value="comments" className="gap-2">
								<MessageSquare className="h-4 w-4" />
								Comments
							</TabsTrigger>
						</TabsList>

						<TabsContent value="resources">
							<CharacterResourcesTab resources={character.resources} />
						</TabsContent>

						<TabsContent value="wiki">
							<CharacterWikiTab wikiPages={character.wikiPages} />
						</TabsContent>

						<TabsContent value="relations">
							<CharacterRelationsTab
								characterId={character.id}
								isOwner={true} // TODO: Check if user is owner/authenticated
							/>
						</TabsContent>

						<TabsContent value="comments">
							<CharacterCommentsTab comments={character.comments} />
						</TabsContent>
					</Tabs>
				</div>
			</div>
		</div>
	)
}
