"use client"

import { Plus, Users } from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import { CharacterCard } from "@/components/characters/character-card"
import { CharacterFilterDialog } from "@/components/characters/character-filter-dialog"
import { CharacterSkeleton } from "@/components/characters/character-skeleton"
import { ActiveFiltersBar } from "@/components/layout/active-filters-bar"
import { EmptyState } from "@/components/layout/empty-state"
import { HeroSection } from "@/components/layout/hero-section"
import { Pagination } from "@/components/layout/pagination"
import { SearchBar } from "@/components/layout/search-bar"
import { Button } from "@/components/ui/button"
import { trpc } from "@/lib/trpc/client"

export default function CharactersPage() {
	const [searchQuery, setSearchQuery] = useState("")
	const [selectedTags, setSelectedTags] = useState<string[]>([])
	const [filterOpen, setFilterOpen] = useState(false)
	const [limit] = useState(20)
	const [offset, setOffset] = useState(0)

	const { data, isLoading } = trpc.character.search.useQuery({
		name: searchQuery || undefined,
		tagIds: selectedTags.length > 0 ? selectedTags : undefined,
		limit,
		offset,
	})

	const characters = data?.characters || []
	const total = data?.total || 0
	const hasMore = data?.hasMore || false

	const handleTagsChange = (tags: string[]) => {
		setSelectedTags(tags)
		setOffset(0)
	}

	const clearFilters = () => {
		setSelectedTags([])
		setSearchQuery("")
		setOffset(0)
	}

	return (
		<div className="min-h-screen">
			<HeroSection
				badge="Character Database"
				title="Characters"
				description="Explore and manage your character collection"
			/>

			<section className="container mx-auto px-4 pb-16">
				<SearchBar
					value={searchQuery}
					onChange={(value) => {
						setSearchQuery(value)
						setOffset(0)
					}}
					placeholder="Search characters..."
					actions={
						<>
							<CharacterFilterDialog
								open={filterOpen}
								onOpenChange={setFilterOpen}
								selectedTags={selectedTags}
								onTagsChange={handleTagsChange}
								onClearFilters={clearFilters}
							/>
							<Button asChild className="gap-2">
								<Link href="/characters/new">
									<Plus className="h-4 w-4" />
									New Character
								</Link>
							</Button>
						</>
					}
				/>

				<ActiveFiltersBar
					searchQuery={searchQuery}
					onClearSearch={() => {
						setSearchQuery("")
						setOffset(0)
					}}
					filterCount={selectedTags.length}
					filterLabel="tag"
					onClearFilters={() => {
						setSelectedTags([])
						setOffset(0)
					}}
					onClearAll={clearFilters}
				/>

				<div className="mb-6">
					<p className="text-sm text-muted-foreground">
						{isLoading
							? "Loading..."
							: `${total} character${total !== 1 ? "s" : ""} found`}
					</p>
				</div>

				{isLoading ? (
					<CharacterSkeleton />
				) : characters.length === 0 ? (
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

				{!isLoading && characters.length > 0 && (
					<Pagination
						currentOffset={offset}
						onPrevious={() => setOffset(Math.max(0, offset - limit))}
						onNext={() => setOffset(offset + limit)}
						hasMore={hasMore}
					/>
				)}
			</section>
		</div>
	)
}
