"use client"

import type { ContentType, ResourceType } from "@prisma/client"
import { Search } from "lucide-react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useState, useTransition } from "react"
import { ResourceFilterDialog } from "@/components/resources/resource-filter-dialog"
import { TagSelector } from "@/components/tag-selector"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface ResourcesListClientProps {
	initialSearch?: string
	initialTags?: string[]
	initialType?: ResourceType
	initialContentType?: ContentType
}

export function ResourcesListClient({
	initialSearch = "",
	initialTags = [],
	initialType,
	initialContentType,
}: ResourcesListClientProps) {
	const router = useRouter()
	const pathname = usePathname()
	const searchParams = useSearchParams()
	const [isPending, startTransition] = useTransition()

	const [search, setSearch] = useState(initialSearch)
	const [selectedTags, setSelectedTags] = useState<string[]>(initialTags)

	const updateURL = (params: Record<string, string | undefined>) => {
		const newParams = new URLSearchParams(searchParams.toString())

		// Update or delete params
		for (const [key, value] of Object.entries(params)) {
			if (value) {
				newParams.set(key, value)
			} else {
				newParams.delete(key)
			}
		}

		// Always reset offset when filters change
		newParams.delete("offset")

		startTransition(() => {
			router.push(`${pathname}?${newParams.toString()}`)
		})
	}

	const handleSearch = () => {
		updateURL({ search: search || undefined })
	}

	const handleTagChange = (tagIds: string[]) => {
		setSelectedTags(tagIds)
		updateURL({ tags: tagIds.length > 0 ? tagIds.join(",") : undefined })
	}

	const handleFilterChange = (filters: {
		type?: ResourceType
		contentType?: ContentType
	}) => {
		updateURL({
			type: filters.type,
			contentType: filters.contentType,
		})
	}

	return (
		<div className="space-y-4 mb-8">
			{/* Search Bar */}
			<div className="flex gap-2">
				<div className="relative flex-1">
					<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
					<Input
						placeholder="Search resources..."
						value={search}
						onChange={(e) => setSearch(e.target.value)}
						onKeyDown={(e) => {
							if (e.key === "Enter") {
								handleSearch()
							}
						}}
						className="pl-10"
					/>
				</div>
				<Button onClick={handleSearch} disabled={isPending}>
					Search
				</Button>
			</div>

			{/* Filters */}
			<div className="flex flex-wrap gap-2">
				<TagSelector
					selectedTags={selectedTags}
					onTagsChange={handleTagChange}
					scope="RESOURCE"
				/>
				<ResourceFilterDialog
					type={initialType}
					contentType={initialContentType}
					onFilterChange={handleFilterChange}
				/>
			</div>
		</div>
	)
}
