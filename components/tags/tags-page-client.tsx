"use client"

import type { TagScope } from "@prisma/client"
import { useRouter, useSearchParams } from "next/navigation"
import { useState } from "react"
import { CreateTagDialog } from "@/components/tags/create-tag-dialog"
import { CreateTagGroupDialog } from "@/components/tags/create-tag-group-dialog"
import { TagsSearchBar } from "@/components/tags/tags-search-bar"

interface TagsPageClientProps {
	initialSearch: string
	initialScope: TagScope
	initialTab: string
}

export function TagsPageClient({
	initialSearch,
	initialScope,
	initialTab,
}: TagsPageClientProps) {
	const router = useRouter()
	const searchParams = useSearchParams()
	const [searchQuery, setSearchQuery] = useState(initialSearch)
	const [selectedScope, setSelectedScope] = useState<TagScope>(initialScope)
	const [createTagOpen, setCreateTagOpen] = useState(false)
	const [createGroupOpen, setCreateGroupOpen] = useState(false)

	const updateURL = (search?: string, scope?: TagScope, tab?: string) => {
		const params = new URLSearchParams(searchParams.toString())

		if (search !== undefined) {
			if (search) {
				params.set("search", search)
			} else {
				params.delete("search")
			}
		}

		if (scope !== undefined) {
			params.set("scope", scope)
		}

		if (tab !== undefined) {
			params.set("tab", tab)
		}

		router.push(`/tags?${params.toString()}`)
	}

	const handleSearchChange = (value: string) => {
		setSearchQuery(value)
		updateURL(value, undefined, undefined)
	}

	const handleScopeChange = (scope: TagScope) => {
		setSelectedScope(scope)
		updateURL(undefined, scope, undefined)
	}

	return (
		<>
			<TagsSearchBar
				searchQuery={searchQuery}
				onSearchChange={handleSearchChange}
				selectedScope={selectedScope}
				onScopeChange={handleScopeChange}
				onCreateClick={() => {
					if (initialTab === "groups") {
						setCreateGroupOpen(true)
					} else {
						setCreateTagOpen(true)
					}
				}}
				createLabel={initialTab === "groups" ? "New Group" : "New Tag"}
				scopeLabels={
					initialTab === "groups"
						? {
								CHARACTER: "Character Groups",
								RESOURCE: "Resource Groups",
							}
						: undefined
				}
			/>

			{/* Dialogs */}
			<CreateTagDialog
				open={createTagOpen}
				onOpenChange={setCreateTagOpen}
				defaultScope={selectedScope}
			/>
			<CreateTagGroupDialog
				open={createGroupOpen}
				onOpenChange={setCreateGroupOpen}
				defaultScope={selectedScope}
			/>
		</>
	)
}
