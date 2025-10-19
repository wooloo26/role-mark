"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { Pagination } from "@/components/layout/pagination"

interface CharactersPaginationClientProps {
	currentOffset: number
	limit: number
	hasMore: boolean
}

export function CharactersPaginationClient({
	currentOffset,
	limit,
	hasMore,
}: CharactersPaginationClientProps) {
	const router = useRouter()
	const searchParams = useSearchParams()

	const handlePageChange = (newOffset: number) => {
		const params = new URLSearchParams(searchParams.toString())
		if (newOffset > 0) {
			params.set("offset", newOffset.toString())
		} else {
			params.delete("offset")
		}
		router.push(`/characters?${params.toString()}`)
	}

	return (
		<Pagination
			currentOffset={currentOffset}
			onPrevious={() => handlePageChange(Math.max(0, currentOffset - limit))}
			onNext={() => handlePageChange(currentOffset + limit)}
			hasMore={hasMore}
		/>
	)
}
