import type { StaticTagDataType } from "@prisma/client"
import { GenericTabSwitcher } from "@/components/layout/generic-tab-switcher"
import { ManagementPageLayout } from "@/components/layout/management-page-layout"
import {
	StatCard,
	StatGrid,
	UsageCard,
	UsageList,
} from "@/components/layout/statistics-components"
import { StaticTagsPageClient } from "@/components/static-tags/static-tags-page-client"
import { StaticTagsTabContent } from "@/components/static-tags/static-tags-tab-content"
import { TabsContent } from "@/components/ui/tabs"
import { api } from "@/lib/trpc/server"

interface StaticTagsPageProps {
	searchParams: Promise<{
		search?: string
		dataType?: string
		tab?: string
	}>
}

export default async function StaticTagsPage({
	searchParams,
}: StaticTagsPageProps) {
	const params = await searchParams
	const searchQuery = params.search || ""
	const selectedDataType = params.dataType as StaticTagDataType | undefined
	const currentTab = params.tab || "static-tags"

	// Fetch data
	const [staticTags, groupedByDataType, stats] = await Promise.all([
		(await api()).staticTag.list(),
		(await api()).staticTag.getGroupedByDataType(),
		(await api()).staticTag.getStats(),
	])

	// Filter by search query
	const filteredStaticTags = staticTags.filter(
		(tag) =>
			tag.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
			tag.displayName.toLowerCase().includes(searchQuery.toLowerCase()),
	)

	// Filter by data type if specified
	const finalFilteredTags = selectedDataType
		? filteredStaticTags.filter((tag) => tag.dataType === selectedDataType)
		: filteredStaticTags

	return (
		<ManagementPageLayout
			badge="Static Tag Management"
			title="Character Attributes"
			description="Define and manage static character attributes like height, weight, birthday, and more"
		>
			<GenericTabSwitcher
				initialTab={currentTab}
				tabs={[
					{ value: "static-tags", label: "Attributes" },
					{ value: "statistics", label: "Statistics" },
				]}
			>
				<StaticTagsPageClient
					initialSearch={searchQuery}
					initialDataType={selectedDataType}
				/>

				{/* Static Tags Tab */}
				<TabsContent value="static-tags" className="space-y-6">
					<StaticTagsTabContent
						staticTags={finalFilteredTags}
						groupedByDataType={groupedByDataType}
					/>
				</TabsContent>

				{/* Statistics Tab */}
				<TabsContent value="statistics" className="space-y-6">
					<StatGrid>
						<StatCard label="Total Definitions" value={stats.total} />
						<StatCard label="Required Fields" value={stats.required} />
						{Object.entries(stats.byDataType).map(([type, count]) => (
							<StatCard key={type} label={`${type} Fields`} value={count} />
						))}
					</StatGrid>

					{/* Most Used Tags */}
					<UsageList title="Most Used Attributes">
						{stats.mostUsed.map((tag) => (
							<UsageCard
								key={tag.id}
								title={tag.displayName}
								subtitle={`${tag.name} • ${tag.dataType}`}
								count={tag.usageCount}
							/>
						))}
					</UsageList>
				</TabsContent>
			</GenericTabSwitcher>
		</ManagementPageLayout>
	)
}
