"use client"

import { Plus } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useCallback, useState } from "react"
import { CharacterFilterDialog } from "@/components/characters/character-filter-dialog"
import { ActiveFiltersBar } from "@/components/layout/active-filters-bar"
import { SearchBar } from "@/components/layout/search-bar"
import { Button } from "@/components/ui/button"

interface CharactersListClientProps {
	initialSearch?: string
	initialTags?: string[]
}

export function CharactersListClient({
	initialSearch = "",
	initialTags = [],
}: CharactersListClientProps) {
	const router = useRouter()
	const [searchQuery, setSearchQuery] = useState(initialSearch)
	const [selectedTags, setSelectedTags] = useState<string[]>(initialTags)
	const [filterOpen, setFilterOpen] = useState(false)

	const updateURL = useCallback(
		(search: string, tags: string[], offset: number = 0) => {
			const params = new URLSearchParams()
			if (search) params.set("search", search)
			if (tags.length > 0) params.set("tags", tags.join(","))
			if (offset > 0) params.set("offset", offset.toString())

			router.push(`/characters?${params.toString()}`)
		},
		[router],
	)

	const handleSearchChange = (value: string) => {
		setSearchQuery(value)
		updateURL(value, selectedTags, 0)
	}

	const handleTagsChange = (tags: string[]) => {
		setSelectedTags(tags)
		updateURL(searchQuery, tags, 0)
	}

	const clearFilters = () => {
		setSelectedTags([])
		setSearchQuery("")
		updateURL("", [], 0)
	}

	const handleClearSearch = () => {
		setSearchQuery("")
		updateURL("", selectedTags, 0)
	}

	const handleClearTags = () => {
		setSelectedTags([])
		updateURL(searchQuery, [], 0)
	}

	return (
		<>
			<SearchBar
				value={searchQuery}
				onChange={handleSearchChange}
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
				onClearSearch={handleClearSearch}
				filterCount={selectedTags.length}
				filterLabel="tag"
				onClearFilters={handleClearTags}
				onClearAll={clearFilters}
			/>
		</>
	)
}
