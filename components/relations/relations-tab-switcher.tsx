"use client"

import { useSearchParams } from "next/navigation"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface RelationsTabSwitcherProps {
	children: React.ReactNode
	initialTab?: string
}

export function RelationsTabSwitcher({
	children,
	initialTab = "types",
}: RelationsTabSwitcherProps) {
	const searchParams = useSearchParams()

	const handleTabChange = (value: string) => {
		const params = new URLSearchParams(searchParams)
		params.set("tab", value)
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
				<TabsTrigger value="types">Relations</TabsTrigger>
				<TabsTrigger value="statistics">Statistics</TabsTrigger>
			</TabsList>
			{children}
		</Tabs>
	)
}
