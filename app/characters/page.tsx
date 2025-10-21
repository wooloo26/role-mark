import { Users } from "lucide-react"
import { CharacterCard } from "@/components/characters/character-card"
import { CharactersListClient } from "@/components/characters/characters-list-client"
import { CharactersPaginationClient } from "@/components/characters/characters-pagination-client"
import { EmptyState } from "@/components/layout/empty-state"
import { HeroSection } from "@/components/layout/hero-section"
import { api } from "@/server/api"

interface CharactersPageProps {
	searchParams: Promise<{
		search?: string
		tags?: string
		offset?: string
	}>
}

export default async function CharactersPage({
	searchParams,
}: CharactersPageProps) {
	const params = await searchParams
	const searchQuery = params.search || ""
	const selectedTags = params.tags ? params.tags.split(",") : []
	const offset = Number(params.offset) || 0
	const limit = 20

	const data = await (await api()).character.search({
		name: searchQuery || undefined,
		tagIds: selectedTags.length > 0 ? selectedTags : undefined,
		limit,
		offset,
	})

	const characters = data?.characters || []
	const total = data?.total || 0
	const hasMore = data?.hasMore || false

	return (
		<div className="min-h-screen">
			<HeroSection
				badge="Character Database"
				title="Characters"
				description="Explore and manage your character collection"
			/>

			<section className="container mx-auto px-4 pb-16">
				<CharactersListClient
					initialSearch={searchQuery}
					initialTags={selectedTags}
				/>

				<div className="mb-6">
					<p className="text-sm text-muted-foreground">
						{total} character{total !== 1 ? "s" : ""} found
					</p>
				</div>

				{characters.length === 0 ? (
					<EmptyState
						icon={Users}
						title="No characters found"
						description={
							searchQuery
								? "Try adjusting your search criteria"
								: "Get started by creating your first character"
						}
						action={{
							label: "Create Character",
							href: "/characters/new",
						}}
					/>
				) : (
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
						{characters.map((character) => (
							<CharacterCard key={character.id} {...character} />
						))}
					</div>
				)}

				{characters.length > 0 && (
					<CharactersPaginationClient
						currentOffset={offset}
						limit={limit}
						hasMore={hasMore}
					/>
				)}
			</section>
		</div>
	)
}
