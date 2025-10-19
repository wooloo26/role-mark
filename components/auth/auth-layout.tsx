import type { ReactNode } from "react"
import { DotPattern } from "@/components/ui/dot-pattern"
import { cn } from "@/lib/utils"

interface AuthLayoutProps {
	children: ReactNode
}

export function AuthLayout({ children }: AuthLayoutProps) {
	return (
		<div className="container relative flex items-center justify-center min-h-[calc(100vh-200px)] mx-auto py-8 overflow-hidden">
			<DotPattern
				className={cn(
					"[mask-image:radial-gradient(500px_circle_at_center,white,transparent)]",
					"absolute inset-0",
				)}
			/>
			<div className="w-full max-w-md relative z-10">{children}</div>
		</div>
	)
}
