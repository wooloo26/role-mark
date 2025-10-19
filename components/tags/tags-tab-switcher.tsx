"use client"

import { FolderTree, Tag as TagIcon } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface TagsTabSwitcherProps {
	initialTab: string
	children: React.ReactNode
}

export function TagsTabSwitcher({
	initialTab,
	children,
}: TagsTabSwitcherProps) {
	const router = useRouter()
	const searchParams = useSearchParams()

	const handleTabChange = (tab: string) => {
		const params = new URLSearchParams(searchParams.toString())
		params.set("tab", tab)
		router.push(`/tags?${params.toString()}`)
	}

	return (
		<Tabs
			defaultValue={initialTab}
			onValueChange={handleTabChange}
			className="space-y-6"
		>
			<TabsList className="grid w-full max-w-md mx-auto grid-cols-2">
				<TabsTrigger value="tags">
					<TagIcon className="h-4 w-4 mr-2" />
					Tags
				</TabsTrigger>
				<TabsTrigger value="groups">
					<FolderTree className="h-4 w-4 mr-2" />
					Tag Groups
				</TabsTrigger>
			</TabsList>
			{children}
		</Tabs>
	)
}
