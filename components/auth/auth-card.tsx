import type { LucideIcon } from "lucide-react"
import type { ReactNode } from "react"
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card"

interface AuthCardProps {
	icon: LucideIcon
	title: string
	description: string
	children: ReactNode
	footer?: ReactNode
	onSubmit?: (e: React.FormEvent) => void
}

export function AuthCard({
	icon: Icon,
	title,
	description,
	children,
	footer,
	onSubmit,
}: AuthCardProps) {
	const content = (
		<>
			<CardHeader className="space-y-1 text-center pb-6">
				<div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
					<Icon className="h-8 w-8 text-primary" />
				</div>
				<CardTitle className="text-3xl font-bold tracking-tight">
					{title}
				</CardTitle>
				<CardDescription className="text-base">{description}</CardDescription>
			</CardHeader>
			<CardContent>{children}</CardContent>
			{footer && (
				<CardFooter className="flex flex-col space-y-4 pt-6">
					{footer}
				</CardFooter>
			)}
		</>
	)

	if (onSubmit) {
		return (
			<Card className="border-1 shadow-2xl backdrop-blur-sm bg-background/95">
				<form onSubmit={onSubmit}>{content}</form>
			</Card>
		)
	}

	return (
		<Card className="border-1 shadow-2xl backdrop-blur-sm bg-background/95">
			{content}
		</Card>
	)
}
