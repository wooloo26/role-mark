import { GenericTabSwitcher } from "@/components/layout/generic-tab-switcher"
import { ManagementPageLayout } from "@/components/layout/management-page-layout"
import {
	StatCard,
	StatGrid,
	UsageCard,
	UsageList,
} from "@/components/layout/statistics-components"
import { RelationTypesTabContent } from "@/components/relations/relation-types-tab-content"
import { RelationsPageClient } from "@/components/relations/relations-page-client"
import { TabsContent } from "@/components/ui/tabs"
import { api } from "@/server/api"

interface RelationsPageProps {
	searchParams: Promise<{
		search?: string
		tab?: string
	}>
}

export default async function RelationsPage({
	searchParams,
}: RelationsPageProps) {
	const params = await searchParams
	const searchQuery = params.search || ""
	const currentTab = params.tab || "types"

	// Fetch data
	const relationTypes = await (await api()).relation.getAllTypes()

	// Filter by search query
	const filteredRelationTypes = relationTypes.filter(
		(type) =>
			type.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
			type.description?.toLowerCase().includes(searchQuery.toLowerCase()),
	)

	// Calculate stats
	const stats = {
		totalTypes: relationTypes.length,
		totalRelations: relationTypes.reduce(
			(sum, type) => sum + type._count.relations,
			0,
		),
		mostUsed: [...relationTypes]
			.sort((a, b) => b._count.relations - a._count.relations)
			.slice(0, 5),
	}

	return (
		<ManagementPageLayout
			badge="Relationship Management"
			title="Character Relations"
			description="Define and manage relationships between characters including friends, rivals, mentors, and more"
		>
			<GenericTabSwitcher
				initialTab={currentTab}
				tabs={[
					{ value: "types", label: "Relations" },
					{ value: "statistics", label: "Statistics" },
				]}
			>
				<RelationsPageClient initialSearch={searchQuery} />

				{/* Relation Types Tab */}
				<TabsContent value="types" className="space-y-6">
					<RelationTypesTabContent relationTypes={filteredRelationTypes} />
				</TabsContent>

				{/* Statistics Tab */}
				<TabsContent value="statistics" className="space-y-6">
					<StatGrid>
						<StatCard label="Total Relation Types" value={stats.totalTypes} />
						<StatCard label="Total Relations" value={stats.totalRelations} />
					</StatGrid>

					{/* Most Used Relation Types */}
					<UsageList
						title="Most Used Relation Types"
						emptyMessage="No relation types in use yet."
						showEmpty={stats.mostUsed.length === 0}
					>
						{stats.mostUsed.map((type) => (
							<UsageCard
								key={type.id}
								title={type.name}
								subtitle={type.description || undefined}
								count={type._count.relations}
								countLabel="relations"
							/>
						))}
					</UsageList>
				</TabsContent>
			</GenericTabSwitcher>
		</ManagementPageLayout>
	)
}
