import type { StaticTagDataType } from "@prisma/client"
import { HeroSection } from "@/components/layout/hero-section"
import { StaticTagsPageClient } from "@/components/static-tags/static-tags-page-client"
import { StaticTagsTabContent } from "@/components/static-tags/static-tags-tab-content"
import { StaticTagsTabSwitcher } from "@/components/static-tags/static-tags-tab-switcher"
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
		<div className="min-h-screen">
			<HeroSection
				badge="Static Tag Management"
				title="Character Attributes"
				description="Define and manage static character attributes like height, weight, birthday, and more"
			/>

			<section className="container mx-auto px-4 pb-16">
				<StaticTagsTabSwitcher initialTab={currentTab}>
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
						<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
							<div className="rounded-lg border bg-card p-6">
								<h3 className="text-sm font-medium text-muted-foreground">
									Total Definitions
								</h3>
								<p className="mt-2 text-3xl font-bold">{stats.total}</p>
							</div>
							<div className="rounded-lg border bg-card p-6">
								<h3 className="text-sm font-medium text-muted-foreground">
									Required Fields
								</h3>
								<p className="mt-2 text-3xl font-bold">{stats.required}</p>
							</div>
							{Object.entries(stats.byDataType).map(([type, count]) => (
								<div key={type} className="rounded-lg border bg-card p-6">
									<h3 className="text-sm font-medium text-muted-foreground">
										{type} Fields
									</h3>
									<p className="mt-2 text-3xl font-bold">{count}</p>
								</div>
							))}
						</div>

						{/* Most Used Tags */}
						<div className="space-y-4">
							<h3 className="text-xl font-semibold">Most Used Attributes</h3>
							<div className="space-y-2">
								{stats.mostUsed.map((tag) => (
									<div
										key={tag.id}
										className="flex items-center justify-between rounded-lg border bg-card p-4"
									>
										<div>
											<h4 className="font-medium">{tag.displayName}</h4>
											<p className="text-sm text-muted-foreground">
												{tag.name} • {tag.dataType}
											</p>
										</div>
										<div className="text-2xl font-bold text-primary">
											{tag.usageCount}
										</div>
									</div>
								))}
							</div>
						</div>
					</TabsContent>
				</StaticTagsTabSwitcher>
			</section>
		</div>
	)
}
