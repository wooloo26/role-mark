"use client"

import { useSearchParams } from "next/navigation"
import type { ReactNode } from "react"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface StaticTagsTabSwitcherProps {
	initialTab: string
	children: ReactNode
}

export function StaticTagsTabSwitcher({
	initialTab,
	children,
}: StaticTagsTabSwitcherProps) {
	const searchParams = useSearchParams()

	const handleTabChange = (tab: string) => {
		const params = new URLSearchParams(searchParams)
		params.set("tab", tab)
		const newUrl = `${window.location.pathname}?${params.toString()}`
		window.history.replaceState({}, "", newUrl)
	}

	return (
		<Tabs
			defaultValue={initialTab}
			onValueChange={handleTabChange}
			className="space-y-6"
		>
			<TabsList className="grid w-full max-w-md mx-auto grid-cols-2">
				<TabsTrigger value="static-tags">Attributes</TabsTrigger>
				<TabsTrigger value="statistics">Statistics</TabsTrigger>
			</TabsList>
			{children}
		</Tabs>
	)
}
