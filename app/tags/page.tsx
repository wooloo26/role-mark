import { TagScope } from "@prisma/client"
import { FolderTree, Tag as TagIcon } from "lucide-react"
import { GenericTabSwitcher } from "@/components/layout/generic-tab-switcher"
import { ManagementPageLayout } from "@/components/layout/management-page-layout"
import { TagGroupsTabContent } from "@/components/tags/tag-groups-tab-content"
import { TagsPageClient } from "@/components/tags/tags-page-client"
import { TagsTabContent } from "@/components/tags/tags-tab-content"
import { TabsContent } from "@/components/ui/tabs"
import { api } from "@/server/api"

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
		<ManagementPageLayout
			badge="Tag Management"
			title="Tags & Groups"
			description="Organize and manage tags for characters and resources"
		>
			<GenericTabSwitcher
				initialTab={currentTab}
				tabs={[
					{
						value: "tags",
						label: "Tags",
						icon: <TagIcon className="h-4 w-4 mr-2" />,
					},
					{
						value: "groups",
						label: "Tag Groups",
						icon: <FolderTree className="h-4 w-4 mr-2" />,
					},
				]}
			>
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
			</GenericTabSwitcher>
		</ManagementPageLayout>
	)
}
