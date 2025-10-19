"use client"

import { Eye } from "lucide-react"
import { useSettings } from "@/components/settings/settings-client"
import { SettingsSection } from "@/components/settings/settings-section"
import { SettingsToggle } from "@/components/settings/settings-toggle"

export function ContentFilters() {
	const { showNSFW, setShowNSFW } = useSettings()

	return (
		<SettingsSection
			icon={Eye}
			title="Content Filters"
			description="Manage what content you want to see"
		>
			<SettingsToggle
				label="Show NSFW Content"
				description="Display content marked as NSFW (Not Safe For Work) in your browsing experience"
				checked={showNSFW}
				onCheckedChange={setShowNSFW}
				badgeText={showNSFW ? "Enabled" : "Disabled"}
			/>
		</SettingsSection>
	)
}
