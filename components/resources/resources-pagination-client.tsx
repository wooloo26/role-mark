"use client"

import { ChevronLeft, ChevronRight } from "lucide-react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"

interface ResourcesPaginationClientProps {
	offset: number
	limit: number
	hasMore: boolean
}

export function ResourcesPaginationClient({
	offset,
	limit,
	hasMore,
}: ResourcesPaginationClientProps) {
	const router = useRouter()
	const pathname = usePathname()
	const searchParams = useSearchParams()

	const currentPage = Math.floor(offset / limit) + 1

	const handlePageChange = (newOffset: number) => {
		const newParams = new URLSearchParams(searchParams.toString())
		if (newOffset > 0) {
			newParams.set("offset", newOffset.toString())
		} else {
			newParams.delete("offset")
		}
		router.push(`${pathname}?${newParams.toString()}`)
	}

	return (
		<div className="flex justify-center items-center gap-4 mt-8">
			<Button
				variant="outline"
				onClick={() => handlePageChange(Math.max(0, offset - limit))}
				disabled={offset === 0}
			>
				<ChevronLeft className="h-4 w-4 mr-2" />
				Previous
			</Button>

			<span className="text-sm text-muted-foreground">Page {currentPage}</span>

			<Button
				variant="outline"
				onClick={() => handlePageChange(offset + limit)}
				disabled={!hasMore}
			>
				Next
				<ChevronRight className="h-4 w-4 ml-2" />
			</Button>
		</div>
	)
}
