"use client"

import {
	ArrowLeft,
	FileText,
	Image as ImageIcon,
	Link2,
	MessageSquare,
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { use } from "react"
import { CharacterAvatarCard } from "@/components/characters/character-avatar-card"
import { CharacterCommentsTab } from "@/components/characters/character-comments-tab"
import { CharacterDetailHeader } from "@/components/characters/character-detail-header"
import { CharacterInfoCard } from "@/components/characters/character-info-card"
import { CharacterPortraitCard } from "@/components/characters/character-portrait-card"
import { CharacterRelationsTab } from "@/components/characters/character-relations-tab"
import { CharacterResourcesTab } from "@/components/characters/character-resources-tab"
import { CharacterWikiTab } from "@/components/characters/character-wiki-tab"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { trpc } from "@/lib/trpc/client"

interface CharacterDetailPageProps {
	params: Promise<{ id: string }>
}

export default function CharacterDetailPage({
	params,
}: CharacterDetailPageProps) {
	const { id } = use(params)
	const router = useRouter()
	const { data: character, isLoading } = trpc.character.getById.useQuery({ id })
	const deleteMutation = trpc.character.delete.useMutation({
		onSuccess: () => {
			router.push("/characters")
		},
	})

	const handleDelete = () => {
		if (character) {
			deleteMutation.mutate({ id: character.id })
		}
	}

	if (isLoading) {
		return (
			<div className="container mx-auto px-4 py-8">
				<div className="animate-pulse space-y-8">
					<div className="h-8 bg-muted rounded w-48" />
					<div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
						<div className="lg:col-span-1">
							<div className="h-96 bg-muted rounded" />
						</div>
						<div className="lg:col-span-2 space-y-4">
							<div className="h-12 bg-muted rounded w-3/4" />
							<div className="h-32 bg-muted rounded" />
						</div>
					</div>
				</div>
			</div>
		)
	}

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
			<CharacterDetailHeader
				characterId={character.id}
				characterName={character.name}
				onDelete={handleDelete}
				isDeleting={deleteMutation.isPending}
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
								relationsFrom={character.relationsFrom}
								relationsTo={character.relationsTo}
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
