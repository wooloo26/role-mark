"use client"

import { cn } from "@/lib/utils"

interface RelationTypeGridProps {
	children: React.ReactNode
	className?: string
}

export function RelationTypeGrid({
	children,
	className,
}: RelationTypeGridProps) {
	return (
		<div
			className={cn(
				"grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
				className,
			)}
		>
			{children}
		</div>
	)
}
