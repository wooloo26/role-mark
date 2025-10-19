import type { ReactNode } from "react"
import { DotPattern } from "@/components/ui/dot-pattern"
import { cn } from "@/lib/utils"

interface PageLayoutProps {
	children: ReactNode
	maxWidth?: "6xl" | "4xl" | "2xl"
}

export function PageLayout({ children, maxWidth = "6xl" }: PageLayoutProps) {
	const maxWidthClass = {
		"6xl": "max-w-6xl",
		"4xl": "max-w-4xl",
		"2xl": "max-w-2xl",
	}[maxWidth]

	return (
		<div className="container relative py-8 overflow-hidden mx-auto">
			<DotPattern
				className={cn(
					"[mask-image:radial-gradient(600px_circle_at_center,white,transparent)]",
					"absolute inset-0 -z-10",
				)}
			/>
			<div className={cn(maxWidthClass, "mx-auto space-y-6")}>{children}</div>
		</div>
	)
}
