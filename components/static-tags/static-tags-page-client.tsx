"use client"

import type { StaticTagDataType } from "@prisma/client"
import { useRouter, useSearchParams } from "next/navigation"
import { StaticTagsSearchBar } from "./static-tags-search-bar"

interface StaticTagsPageClientProps {
	initialSearch: string
	initialDataType?: StaticTagDataType
}

export function StaticTagsPageClient({
	initialSearch,
	initialDataType,
}: StaticTagsPageClientProps) {
	const router = useRouter()
	const searchParams = useSearchParams()

	const handleSearch = (search: string) => {
		const params = new URLSearchParams(searchParams)
		if (search) {
			params.set("search", search)
		} else {
			params.delete("search")
		}
		router.push(`/static-tags?${params.toString()}`)
	}

	const handleDataTypeChange = (dataType: StaticTagDataType | "all") => {
		const params = new URLSearchParams(searchParams)
		if (dataType !== "all") {
			params.set("dataType", dataType)
		} else {
			params.delete("dataType")
		}
		router.push(`/static-tags?${params.toString()}`)
	}

	return (
		<StaticTagsSearchBar
			initialSearch={initialSearch}
			initialDataType={initialDataType}
			onSearch={handleSearch}
			onDataTypeChange={handleDataTypeChange}
		/>
	)
}
