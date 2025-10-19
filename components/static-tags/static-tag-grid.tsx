"use client"

import type { ReactNode } from "react"
import { cn } from "@/lib/utils"

interface StaticTagGridProps {
	children: ReactNode
	className?: string
}

export function StaticTagGrid({ children, className }: StaticTagGridProps) {
	return (
		<div
			className={cn(
				"grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
				className,
			)}
		>
			{children}
		</div>
	)
}
