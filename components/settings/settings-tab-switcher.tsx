"use client"

import { Palette, Settings, Shield } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface SettingsTabSwitcherProps {
	initialTab: string
	children: React.ReactNode
}

export function SettingsTabSwitcher({
	initialTab,
	children,
}: SettingsTabSwitcherProps) {
	const router = useRouter()
	const searchParams = useSearchParams()

	const handleTabChange = (tab: string) => {
		const params = new URLSearchParams(searchParams.toString())
		params.set("tab", tab)
		router.push(`/settings?${params.toString()}`)
	}

	return (
		<Tabs
			defaultValue={initialTab}
			onValueChange={handleTabChange}
			className="w-full"
		>
			<TabsList className="grid w-full grid-cols-3 h-12 bg-muted/50 p-1">
				<TabsTrigger
					value="general"
					className="gap-2 data-[state=active]:shadow-md"
				>
					<Settings className="h-4 w-4" />
					<span className="hidden sm:inline">General</span>
				</TabsTrigger>
				<TabsTrigger
					value="appearance"
					className="gap-2 data-[state=active]:shadow-md"
				>
					<Palette className="h-4 w-4" />
					<span className="hidden sm:inline">Appearance</span>
				</TabsTrigger>
				<TabsTrigger
					value="privacy"
					className="gap-2 data-[state=active]:shadow-md"
				>
					<Shield className="h-4 w-4" />
					<span className="hidden sm:inline">Privacy</span>
				</TabsTrigger>
			</TabsList>
			{children}
		</Tabs>
	)
}
