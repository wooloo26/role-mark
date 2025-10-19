import { HeroSection } from "@/components/layout/hero-section"
import { RelationTypesTabContent } from "@/components/relations/relation-types-tab-content"
import { RelationsPageClient } from "@/components/relations/relations-page-client"
import { RelationsTabSwitcher } from "@/components/relations/relations-tab-switcher"
import { TabsContent } from "@/components/ui/tabs"
import { api } from "@/lib/trpc/server"

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
		<div className="min-h-screen">
			<HeroSection
				badge="Relationship Management"
				title="Character Relations"
				description="Define and manage relationships between characters including friends, rivals, mentors, and more"
			/>

			<section className="container mx-auto px-4 pb-16">
				<RelationsTabSwitcher initialTab={currentTab}>
					<RelationsPageClient initialSearch={searchQuery} />

					{/* Relation Types Tab */}
					<TabsContent value="types" className="space-y-6">
						<RelationTypesTabContent relationTypes={filteredRelationTypes} />
					</TabsContent>

					{/* Statistics Tab */}
					<TabsContent value="statistics" className="space-y-6">
						<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
							<div className="rounded-lg border bg-card p-6">
								<h3 className="text-sm font-medium text-muted-foreground">
									Total Relation Types
								</h3>
								<p className="mt-2 text-3xl font-bold">{stats.totalTypes}</p>
							</div>
							<div className="rounded-lg border bg-card p-6">
								<h3 className="text-sm font-medium text-muted-foreground">
									Total Relations
								</h3>
								<p className="mt-2 text-3xl font-bold">
									{stats.totalRelations}
								</p>
							</div>
						</div>

						{/* Most Used Relation Types */}
						<div className="space-y-4">
							<h3 className="text-xl font-semibold">
								Most Used Relation Types
							</h3>
							<div className="space-y-2">
								{stats.mostUsed.map((type) => (
									<div
										key={type.id}
										className="flex items-center justify-between rounded-lg border bg-card p-4"
									>
										<div>
											<h4 className="font-semibold capitalize">{type.name}</h4>
											{type.description && (
												<p className="text-sm text-muted-foreground">
													{type.description}
												</p>
											)}
										</div>
										<div className="text-right">
											<p className="text-2xl font-bold">
												{type._count.relations}
											</p>
											<p className="text-xs text-muted-foreground">relations</p>
										</div>
									</div>
								))}
								{stats.mostUsed.length === 0 && (
									<p className="text-center text-muted-foreground py-8">
										No relation types in use yet.
									</p>
								)}
							</div>
						</div>
					</TabsContent>
				</RelationsTabSwitcher>
			</section>
		</div>
	)
}
