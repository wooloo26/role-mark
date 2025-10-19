import type { LucideIcon } from "lucide-react"
import type { ReactNode } from "react"
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card"

interface SettingsSectionProps {
	icon: LucideIcon
	title: string
	description: string
	children: ReactNode
}

export function SettingsSection({
	icon: Icon,
	title,
	description,
	children,
}: SettingsSectionProps) {
	return (
		<Card className="border-1 shadow-lg">
			<CardHeader>
				<div className="flex items-center gap-3">
					<div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
						<Icon className="h-5 w-5 text-primary" />
					</div>
					<div>
						<CardTitle className="text-xl">{title}</CardTitle>
						<CardDescription className="text-base">
							{description}
						</CardDescription>
					</div>
				</div>
			</CardHeader>
			<CardContent>{children}</CardContent>
		</Card>
	)
}
