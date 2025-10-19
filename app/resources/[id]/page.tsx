import { ArrowLeft } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { ResourceCharactersCard } from "@/components/resources/resource-characters-card"
import { ResourceDetailClient } from "@/components/resources/resource-detail-client"
import { ResourceFilesCard } from "@/components/resources/resource-files-card"
import { ResourceInfoCard } from "@/components/resources/resource-info-card"
import { Button } from "@/components/ui/button"
import { api } from "@/lib/trpc/server"

interface ResourceDetailPageProps {
	params: Promise<{ id: string }>
}

export default async function ResourceDetailPage({
	params,
}: ResourceDetailPageProps) {
	const { id } = await params
	const resource = await (await api()).resource.getById({ id })

	if (!resource) {
		return (
			<div className="container mx-auto px-4 py-16 text-center">
				<h1 className="text-2xl font-bold mb-4">Resource not found</h1>
				<Button asChild>
					<Link href="/resources">
						<ArrowLeft className="h-4 w-4 mr-2" />
						Back to Resources
					</Link>
				</Button>
			</div>
		)
	}

	return (
		<div className="container mx-auto px-4 py-8">
			<ResourceDetailClient
				resourceId={resource.id}
				resourceTitle={resource.title}
			/>

			{/* Main Content */}
			<div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
				{/* Left Column - Thumbnail */}
				<div className="lg:col-span-1">
					{resource.thumbnailUrl ? (
						<div className="relative aspect-square w-full rounded-xl overflow-hidden border">
							<Image
								src={resource.thumbnailUrl}
								alt={resource.title}
								fill
								className="object-cover"
							/>
						</div>
					) : (
						<div className="aspect-square w-full rounded-xl border bg-muted flex items-center justify-center">
							<span className="text-4xl text-muted-foreground">
								{resource.title.charAt(0).toUpperCase()}
							</span>
						</div>
					)}
				</div>

				{/* Right Column - Details */}
				<div className="lg:col-span-2 space-y-6">
					<ResourceInfoCard
						title={resource.title}
						description={resource.description}
						tags={resource.tags}
						uploader={resource.uploader}
						createdAt={resource.createdAt}
						updatedAt={resource.updatedAt}
					/>

					<ResourceFilesCard
						type={resource.type}
						contentType={resource.contentType}
						files={resource.files}
					/>

					<ResourceCharactersCard characters={resource.characters} />
				</div>
			</div>
		</div>
	)
}
