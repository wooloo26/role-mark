import React from "react"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"

interface SettingsToggleProps {
	label: string
	description: string
	checked: boolean
	onCheckedChange: (checked: boolean) => void
	badgeText?: string
}

export function SettingsToggle({
	label,
	description,
	checked,
	onCheckedChange,
	badgeText,
}: SettingsToggleProps) {
	const switchId = React.useId()

	return (
		<>
			<Separator className="mb-4" />
			<div className="flex items-start justify-between gap-4">
				<div className="space-y-1 flex-1">
					<div className="flex items-center gap-2">
						<Label htmlFor={switchId} className="text-base font-semibold">
							{label}
						</Label>
						{badgeText && (
							<Badge variant={checked ? "default" : "secondary"}>
								{badgeText}
							</Badge>
						)}
					</div>
					<p className="text-sm text-muted-foreground leading-relaxed">
						{description}
					</p>
				</div>
				<Switch
					id={switchId}
					checked={checked}
					onCheckedChange={onCheckedChange}
					className="mt-1"
				/>
			</div>
		</>
	)
}
