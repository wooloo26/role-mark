import { Card, CardHeader } from "@/components/ui/card"

interface CharacterSkeletonProps {
	count?: number
}

export function CharacterSkeleton({ count = 8 }: CharacterSkeletonProps) {
	return (
		<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
			{Array.from({ length: count }).map((_, i) => (
				<Card key={i} className="animate-pulse">
					<CardHeader>
						<div className="w-full h-48 bg-muted rounded-lg mb-4" />
						<div className="h-6 bg-muted rounded w-3/4 mb-2" />
						<div className="h-4 bg-muted rounded w-full" />
					</CardHeader>
				</Card>
			))}
		</div>
	)
}
