import type { ContentType, ResourceType } from "@prisma/client"
import { FolderOpen, Plus } from "lucide-react"
import Link from "next/link"
import { EmptyState } from "@/components/layout/empty-state"
import { HeroSection } from "@/components/layout/hero-section"
import { ResourceCard } from "@/components/resources/resource-card"
import { ResourcesListClient } from "@/components/resources/resources-list-client"
import { ResourcesPaginationClient } from "@/components/resources/resources-pagination-client"
import { Button } from "@/components/ui/button"
import { api } from "@/lib/trpc/server"

interface ResourcesPageProps {
	searchParams: Promise<{
		search?: string
		tags?: string
		type?: ResourceType
		contentType?: ContentType
		offset?: string
	}>
}

export default async function ResourcesPage({
	searchParams,
}: ResourcesPageProps) {
	const params = await searchParams
	const searchQuery = params.search || ""
	const selectedTags = params.tags ? params.tags.split(",") : []
	const type = params.type
	const contentType = params.contentType
	const offset = Number(params.offset) || 0
	const limit = 20

	const data = await (await api()).resource.search({
		title: searchQuery || undefined,
		tagIds: selectedTags.length > 0 ? selectedTags : undefined,
		type: type,
		contentType: contentType,
		limit,
		offset,
	})

	const resources = data?.resources || []
	const total = data?.total || 0
	const hasMore = data?.hasMore || false

	return (
		<div className="min-h-screen">
			<HeroSection
				badge="Resource Library"
				title="Resources"
				description="Browse and manage your resource collection"
			>
				<Button asChild size="lg">
					<Link href="/resources/new">
						<Plus className="h-5 w-5 mr-2" />
						Add Resource
					</Link>
				</Button>
			</HeroSection>

			<section className="container mx-auto px-4 pb-16">
				<ResourcesListClient
					initialSearch={searchQuery}
					initialTags={selectedTags}
					initialType={type}
					initialContentType={contentType}
				/>

				{resources.length === 0 ? (
					<EmptyState
						icon={FolderOpen}
						title="No resources found"
						description="Try adjusting your filters or create a new resource."
						action={{
							label: "Add Resource",
							href: "/resources/new",
						}}
					/>
				) : (
					<>
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
							{resources.map((resource) => (
								<ResourceCard key={resource.id} resource={resource} />
							))}
						</div>

						{total > limit && (
							<ResourcesPaginationClient
								offset={offset}
								limit={limit}
								hasMore={hasMore}
							/>
						)}
					</>
				)}
			</section>
		</div>
	)
}
