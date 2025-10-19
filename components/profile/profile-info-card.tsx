import type { LucideIcon } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface InfoItem {
	label: string
	value: string
}

interface ProfileInfoCardProps {
	icon: LucideIcon
	title: string
	items: InfoItem[]
}

export function ProfileInfoCard({
	icon: Icon,
	title,
	items,
}: ProfileInfoCardProps) {
	return (
		<Card className="border-muted">
			<CardHeader>
				<CardTitle className="flex items-center gap-2 text-lg">
					<Icon className="h-5 w-5 text-primary" />
					{title}
				</CardTitle>
			</CardHeader>
			<CardContent className="space-y-4">
				{items.map((item) => (
					<div key={item.label} className="space-y-1">
						<p className="text-sm font-medium text-muted-foreground">
							{item.label}
						</p>
						<p className="text-base font-medium">{item.value}</p>
					</div>
				))}
			</CardContent>
		</Card>
	)
}
