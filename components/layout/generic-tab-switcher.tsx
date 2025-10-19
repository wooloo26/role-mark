"use client"

import { useSearchParams } from "next/navigation"
import type { ReactNode } from "react"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface TabConfig {
	value: string
	label: string
	icon?: ReactNode
}

interface GenericTabSwitcherProps {
	initialTab: string
	tabs: TabConfig[]
	children: ReactNode
	className?: string
}

export function GenericTabSwitcher({
	initialTab,
	tabs,
	children,
	className = "space-y-6",
}: GenericTabSwitcherProps) {
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
			className={className}
		>
			<TabsList
				className={`grid w-full max-w-md mx-auto grid-cols-${tabs.length}`}
			>
				{tabs.map((tab) => (
					<TabsTrigger key={tab.value} value={tab.value}>
						{tab.icon}
						{tab.label}
					</TabsTrigger>
				))}
			</TabsList>
			{children}
		</Tabs>
	)
}
