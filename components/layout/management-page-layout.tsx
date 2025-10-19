import type { ReactNode } from "react"
import { HeroSection } from "./hero-section"

interface ManagementPageLayoutProps {
	badge: string
	title: string
	description: string
	children: ReactNode
}

/**
 * Reusable layout wrapper for management pages (tags, relations, static-tags, etc.)
 * Provides consistent structure with hero section and container.
 */
export function ManagementPageLayout({
	badge,
	title,
	description,
	children,
}: ManagementPageLayoutProps) {
	return (
		<div className="min-h-screen">
			<HeroSection badge={badge} title={title} description={description} />
			<section className="container mx-auto px-4 pb-16">{children}</section>
		</div>
	)
}
