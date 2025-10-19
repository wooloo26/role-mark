"use client"

import { useRouter, useSearchParams } from "next/navigation"
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
	const router = useRouter()
	const searchParams = useSearchParams()

	const handleTabChange = (tab: string) => {
		const params = new URLSearchParams(searchParams)
		params.set("tab", tab)
		router.push(`/static-tags?${params.toString()}`)
	}

	return (
		<Tabs value={initialTab} onValueChange={handleTabChange} className="w-full">
			<TabsList className="w-full sm:w-auto mb-6">
				<TabsTrigger value="static-tags">Attributes</TabsTrigger>
				<TabsTrigger value="statistics">Statistics</TabsTrigger>
			</TabsList>
			{children}
		</Tabs>
	)
}
