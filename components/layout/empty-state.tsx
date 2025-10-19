import type { LucideIcon } from "lucide-react"
import type { ReactNode } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

interface EmptyStateProps {
	icon: LucideIcon
	title: string
	description: string
	action?: {
		label: string
		onClick?: () => void
		href?: string
	}
	children?: ReactNode
}

export function EmptyState({
	icon: Icon,
	title,
	description,
	action,
	children,
}: EmptyStateProps) {
	return (
		<Card className="text-center py-16">
			<CardContent>
				<Icon className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
				<h3 className="text-lg font-semibold mb-2">{title}</h3>
				<p className="text-muted-foreground mb-6">{description}</p>
				{action && (
					<Button asChild={!!action.href} onClick={action.onClick}>
						{action.href ? (
							<a href={action.href}>{action.label}</a>
						) : (
							action.label
						)}
					</Button>
				)}
				{children}
			</CardContent>
		</Card>
	)
}
