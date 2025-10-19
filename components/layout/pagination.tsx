import { Button } from "@/components/ui/button"

interface PaginationProps {
	currentOffset: number
	onPrevious: () => void
	onNext: () => void
	hasMore: boolean
	isLoading?: boolean
}

export function Pagination({
	currentOffset,
	onPrevious,
	onNext,
	hasMore,
	isLoading = false,
}: PaginationProps) {
	return (
		<div className="flex justify-center gap-4 mt-8">
			<Button
				variant="outline"
				disabled={currentOffset === 0 || isLoading}
				onClick={onPrevious}
			>
				Previous
			</Button>
			<Button
				variant="outline"
				disabled={!hasMore || isLoading}
				onClick={onNext}
			>
				Next
			</Button>
		</div>
	)
}
