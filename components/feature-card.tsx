import type { LucideIcon } from "lucide-react"
import {
	Card,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card"

interface FeatureCardProps {
	icon: LucideIcon
	title: string
	description: string
}

export function FeatureCard({
	icon: Icon,
	title,
	description,
}: FeatureCardProps) {
	return (
		<Card className="border-1 hover:border-primary/50 transition-colors">
			<CardHeader>
				<Icon className="h-10 w-10 mb-3 text-primary" />
				<CardTitle>{title}</CardTitle>
				<CardDescription>{description}</CardDescription>
			</CardHeader>
		</Card>
	)
}
