"use client"

import { ContentType, ResourceType } from "@prisma/client"
import { Plus, Search } from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import { trpc } from "@/client/trpc/client"
import { ResourceCard } from "@/components/resources/resource-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select"

export function ResourceList() {
	const [searchTitle, setSearchTitle] = useState("")
	const [filterType, setFilterType] = useState<ResourceType | "all">("all")
	const [filterContentType, setFilterContentType] = useState<
		ContentType | "all"
	>("all")
	const [offset, setOffset] = useState(0)
	const limit = 20

	const { data, isLoading, error } = trpc.resource.search.useQuery({
		title: searchTitle || undefined,
		type: filterType === "all" ? undefined : filterType,
		contentType: filterContentType === "all" ? undefined : filterContentType,
		limit,
		offset,
		sortBy: "createdAt",
		sortOrder: "desc",
	})

	const handleLoadMore = () => {
		setOffset((prev) => prev + limit)
	}

	const handleResetFilters = () => {
		setSearchTitle("")
		setFilterType("all")
		setFilterContentType("all")
		setOffset(0)
	}

	const hasActiveFilters =
		searchTitle || filterType !== "all" || filterContentType !== "all"

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-3xl font-bold tracking-tight">Resources</h1>
					<p className="text-muted-foreground mt-1">
						Browse and search uploaded resources
					</p>
				</div>
				<Button asChild>
					<Link href="/resources/new">
						<Plus className="mr-2 h-4 w-4" />
						Create Resource
					</Link>
				</Button>
			</div>

			{/* Filters */}
			<div className="flex flex-col sm:flex-row gap-4">
				{/* Search */}
				<div className="relative flex-1">
					<Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
					<Input
						placeholder="Search by title..."
						value={searchTitle}
						onChange={(e) => {
							setSearchTitle(e.target.value)
							setOffset(0)
						}}
						className="pl-9"
					/>
				</div>

				{/* Type Filter */}
				<Select
					value={filterType}
					onValueChange={(value) => {
						setFilterType(value as ResourceType | "all")
						setOffset(0)
					}}
				>
					<SelectTrigger className="w-full sm:w-[180px]">
						<SelectValue placeholder="All Types" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="all">All Types</SelectItem>
						<SelectItem value={ResourceType.SINGLE_FILE}>
							Single File
						</SelectItem>
						<SelectItem value={ResourceType.FILE_ARRAY}>File Array</SelectItem>
						<SelectItem value={ResourceType.FOLDER}>Folder</SelectItem>
					</SelectContent>
				</Select>

				{/* Content Type Filter */}
				<Select
					value={filterContentType}
					onValueChange={(value) => {
						setFilterContentType(value as ContentType | "all")
						setOffset(0)
					}}
				>
					<SelectTrigger className="w-full sm:w-[180px]">
						<SelectValue placeholder="All Content" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="all">All Content</SelectItem>
						<SelectItem value={ContentType.IMAGE}>Images</SelectItem>
						<SelectItem value={ContentType.VIDEO}>Videos</SelectItem>
						<SelectItem value={ContentType.OTHER}>Other</SelectItem>
					</SelectContent>
				</Select>

				{/* Reset Button */}
				{hasActiveFilters && (
					<Button variant="outline" onClick={handleResetFilters}>
						Reset
					</Button>
				)}
			</div>

			{/* Results */}
			{isLoading ? (
				<div className="text-center py-12 text-muted-foreground">
					Loading resources...
				</div>
			) : error ? (
				<div className="text-center py-12 text-destructive">
					Error loading resources: {error.message}
				</div>
			) : data && data.resources.length === 0 ? (
				<div className="text-center py-12">
					<p className="text-muted-foreground mb-4">
						{hasActiveFilters
							? "No resources found matching your filters"
							: "No resources yet"}
					</p>
					{!hasActiveFilters && (
						<Button asChild>
							<Link href="/resources/new">
								<Plus className="mr-2 h-4 w-4" />
								Create First Resource
							</Link>
						</Button>
					)}
				</div>
			) : (
				<>
					{/* Resource Grid */}
					<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
						{data?.resources.map((resource) => (
							<ResourceCard
								key={resource.id}
								id={resource.id}
								title={resource.title}
								description={resource.description}
								type={resource.type}
								contentType={resource.contentType}
								thumbnailUrl={resource.thumbnailUrl}
								files={resource.files}
								tags={resource.tags}
								_count={resource._count}
								uploader={resource.uploader ?? undefined}
								createdAt={resource.createdAt}
							/>
						))}
					</div>

					{/* Load More */}
					{data?.hasMore && (
						<div className="flex justify-center pt-6">
							<Button onClick={handleLoadMore} variant="outline">
								Load More
							</Button>
						</div>
					)}

					{/* Results Count */}
					{data && (
						<div className="text-center text-sm text-muted-foreground">
							Showing {data.resources.length} of {data.total} resources
						</div>
					)}
				</>
			)}
		</div>
	)
}
