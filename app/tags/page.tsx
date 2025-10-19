import { TagScope } from "@prisma/client"
import { HeroSection } from "@/components/layout/hero-section"
import { TagGroupsTabContent } from "@/components/tags/tag-groups-tab-content"
import { TagsPageClient } from "@/components/tags/tags-page-client"
import { TagsTabContent } from "@/components/tags/tags-tab-content"
import { TagsTabSwitcher } from "@/components/tags/tags-tab-switcher"
import { TabsContent } from "@/components/ui/tabs"
import { api } from "@/lib/trpc/server"

interface TagsPageProps {
	searchParams: Promise<{
		search?: string
		scope?: string
		tab?: string
	}>
}

export default async function TagsPage({ searchParams }: TagsPageProps) {
	const params = await searchParams
	const searchQuery = params.search || ""
	const selectedScope = (params.scope as TagScope) || TagScope.CHARACTER
	const currentTab = params.tab || "tags"

	// Fetch data based on current tab
	const [groupedData, tagGroups] = await Promise.all([
		(await api()).tag.getGroupedTags({ scope: selectedScope }),
		(await api()).tag.listGroups({ scope: selectedScope }),
	])

	// Filter by search query
	const filteredGrouped =
		groupedData.grouped.filter((group) =>
			group.name.toLowerCase().includes(searchQuery.toLowerCase()),
		) || []

	const filteredUngrouped =
		groupedData.ungrouped.filter((tag) =>
			tag.name.toLowerCase().includes(searchQuery.toLowerCase()),
		) || []

	const filteredTagGroups =
		tagGroups.filter((group) =>
			group.name.toLowerCase().includes(searchQuery.toLowerCase()),
		) || []

	return (
		<div className="min-h-screen">
			<HeroSection
				badge="Tag Management"
				title="Tags & Groups"
				description="Organize and manage tags for characters and resources"
			/>

			<section className="container mx-auto px-4 pb-16">
				<TagsTabSwitcher initialTab={currentTab}>
					<TagsPageClient
						initialSearch={searchQuery}
						initialScope={selectedScope}
						initialTab={currentTab}
					/>

					{/* Tags Tab */}
					<TabsContent value="tags" className="space-y-6">
						<TagsTabContent
							groupedTags={filteredGrouped}
							ungroupedTags={filteredUngrouped}
						/>
					</TabsContent>

					{/* Tag Groups Tab */}
					<TabsContent value="groups" className="space-y-6">
						<TagGroupsTabContent tagGroups={filteredTagGroups} />
					</TabsContent>
				</TagsTabSwitcher>
			</section>
		</div>
	)
}
