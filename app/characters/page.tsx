"use client"

import { Filter, Plus, Search, Users, X } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useState } from "react"
import { TagSelector } from "@/components/tag-selector"
import { AnimatedGradientText } from "@/components/ui/animated-gradient-text"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card"
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog"
import { DotPattern } from "@/components/ui/dot-pattern"
import { Input } from "@/components/ui/input"
import { Particles } from "@/components/ui/particles"
import { trpc } from "@/lib/trpc/client"
import { cn } from "@/lib/utils"

export default function CharactersPage() {
	const [searchQuery, setSearchQuery] = useState("")
	const [selectedTags, setSelectedTags] = useState<string[]>([])
	const [filterOpen, setFilterOpen] = useState(false)
	const [limit] = useState(20)
	const [offset, setOffset] = useState(0)

	const { data, isLoading } = trpc.character.search.useQuery({
		name: searchQuery || undefined,
		tagIds: selectedTags.length > 0 ? selectedTags : undefined,
		limit,
		offset,
	})

	const characters = data?.characters || []
	const total = data?.total || 0
	const hasMore = data?.hasMore || false

	const handleTagsChange = (tags: string[]) => {
		setSelectedTags(tags)
		setOffset(0)
	}

	const clearFilters = () => {
		setSelectedTags([])
		setSearchQuery("")
		setOffset(0)
	}

	const hasActiveFilters = searchQuery || selectedTags.length > 0

	return (
		<div className="min-h-screen">
			{/* Hero Section */}
			<section className="relative px-4 py-16 text-center overflow-hidden">
				<DotPattern
					className={cn(
						"[mask-image:radial-gradient(400px_circle_at_center,white,transparent)]",
					)}
				/>
				<Particles
					className="absolute inset-0 pointer-events-none"
					quantity={50}
					ease={80}
					color="#888888"
					refresh
				/>

				<div className="relative z-10 max-w-4xl mx-auto space-y-6">
					<AnimatedGradientText className="inline-flex items-center gap-2 mb-4">
						<span
							className={cn(
								"inline animate-gradient bg-gradient-to-r from-[#ffaa40] via-[#9c40ff] to-[#ffaa40] bg-[length:var(--bg-size)_100%] bg-clip-text text-transparent",
							)}
						>
							Character Database
						</span>
					</AnimatedGradientText>

					<h1 className="text-4xl font-bold tracking-tight sm:text-5xl bg-clip-text text-transparent bg-gradient-to-b from-foreground to-foreground/60">
						Characters
					</h1>

					<p className="text-muted-foreground text-lg max-w-2xl mx-auto">
						Explore and manage your character collection
					</p>
				</div>
			</section>

			{/* Main Content */}
			<section className="container mx-auto px-4 pb-16">
				{/* Search and Actions */}
				<div className="flex flex-col sm:flex-row gap-4 mb-8">
					<div className="relative flex-1">
						<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
						<Input
							placeholder="Search characters..."
							value={searchQuery}
							onChange={(e) => {
								setSearchQuery(e.target.value)
								setOffset(0)
							}}
							className="pl-10"
						/>
					</div>
					<Dialog open={filterOpen} onOpenChange={setFilterOpen}>
						<DialogTrigger asChild>
							<Button variant="outline" className="gap-2 relative">
								<Filter className="h-4 w-4" />
								Filters
								{selectedTags.length > 0 && (
									<Badge
										variant="secondary"
										className="ml-2 h-5 w-5 rounded-full p-0 flex items-center justify-center"
									>
										{selectedTags.length}
									</Badge>
								)}
							</Button>
						</DialogTrigger>
						<DialogContent className="sm:max-w-[600px]">
							<DialogHeader>
								<DialogTitle>Filter Characters</DialogTitle>
								<DialogDescription>
									Filter characters by tags and other criteria
								</DialogDescription>
							</DialogHeader>
							<div className="space-y-6 py-4">
								<div className="space-y-2">
									<div className="text-sm font-medium">Tags</div>
									<TagSelector
										scope="CHARACTER"
										selectedTags={selectedTags}
										onTagsChange={handleTagsChange}
										placeholder="Filter by tags..."
									/>
								</div>
							</div>
							<div className="flex justify-between">
								<Button variant="outline" onClick={clearFilters}>
									Clear Filters
								</Button>
								<Button onClick={() => setFilterOpen(false)}>
									Apply Filters
								</Button>
							</div>
						</DialogContent>
					</Dialog>
					<Button asChild className="gap-2">
						<Link href="/characters/new">
							<Plus className="h-4 w-4" />
							New Character
						</Link>
					</Button>
				</div>

				{/* Active Filters */}
				{hasActiveFilters && (
					<div className="mb-6 flex flex-wrap items-center gap-2">
						<span className="text-sm text-muted-foreground">
							Active filters:
						</span>
						{searchQuery && (
							<Badge variant="secondary" className="gap-1">
								Search: {searchQuery}
								<button
									type="button"
									onClick={() => {
										setSearchQuery("")
										setOffset(0)
									}}
									className="ml-1 hover:text-destructive"
								>
									<X className="h-3 w-3" />
								</button>
							</Badge>
						)}
						{selectedTags.length > 0 && (
							<Badge variant="secondary" className="gap-1">
								{selectedTags.length} tag{selectedTags.length !== 1 ? "s" : ""}
								<button
									type="button"
									onClick={() => {
										setSelectedTags([])
										setOffset(0)
									}}
									className="ml-1 hover:text-destructive"
								>
									<X className="h-3 w-3" />
								</button>
							</Badge>
						)}
						<Button
							variant="ghost"
							size="sm"
							onClick={clearFilters}
							className="h-7 text-xs"
						>
							Clear all
						</Button>
					</div>
				)}

				{/* Results Count */}
				<div className="mb-6">
					<p className="text-sm text-muted-foreground">
						{isLoading
							? "Loading..."
							: `${total} character${total !== 1 ? "s" : ""} found`}
					</p>
				</div>

				{/* Character Grid */}
				{isLoading ? (
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
						{Array.from({ length: 8 }).map((_, i) => (
							<Card key={i} className="animate-pulse">
								<CardHeader>
									<div className="w-full h-48 bg-muted rounded-lg mb-4" />
									<div className="h-6 bg-muted rounded w-3/4 mb-2" />
									<div className="h-4 bg-muted rounded w-full" />
								</CardHeader>
							</Card>
						))}
					</div>
				) : characters.length === 0 ? (
					<Card className="text-center py-16">
						<CardContent>
							<Users className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
							<h3 className="text-lg font-semibold mb-2">
								No characters found
							</h3>
							<p className="text-muted-foreground mb-6">
								{searchQuery
									? "Try adjusting your search criteria"
									: "Get started by creating your first character"}
							</p>
							<Button asChild>
								<Link href="/characters/new">
									<Plus className="h-4 w-4 mr-2" />
									Create Character
								</Link>
							</Button>
						</CardContent>
					</Card>
				) : (
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
						{characters.map((character) => (
							<Link key={character.id} href={`/characters/${character.id}`}>
								<Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer overflow-hidden h-full">
									<CardHeader className="p-0">
										{/* Character Image */}
										<div className="relative w-full h-48 bg-primary overflow-hidden">
											{character.avatarUrl ? (
												<Image
													src={character.avatarUrl}
													alt={character.name}
													fill
													className="object-cover group-hover:scale-110 transition-transform duration-300"
												/>
											) : (
												<div className="w-full h-full flex items-center justify-center">
													<Avatar className="h-24 w-24">
														<AvatarFallback className="text-4xl">
															{character.name.charAt(0).toUpperCase()}
														</AvatarFallback>
													</Avatar>
												</div>
											)}
										</div>

										{/* Character Info */}
										<div className="p-4 space-y-3">
											<CardTitle className="line-clamp-1">
												{character.name}
											</CardTitle>
											{character.info && (
												<CardDescription className="line-clamp-2">
													{character.info}
												</CardDescription>
											)}

											{/* Tags - Show tags from pinned groups and individually pinned tags */}
											{character.tags &&
												(() => {
													const pinnedTags = character.tags.filter(
														(ct) => ct.tag.pinned || ct.tag.group?.pinned,
													)
													return (
														<div className="flex flex-wrap gap-1">
															{pinnedTags.map((ct) => (
																<Badge
																	key={ct.tag.id}
																	variant="secondary"
																	className="text-xs"
																>
																	{ct.tag.name}
																</Badge>
															))}
														</div>
													)
												})()}

											{/* Stats */}
											<div className="flex items-center gap-4 text-xs text-muted-foreground pt-2 border-t">
												<span>
													{character._count?.resources || 0} resources
												</span>
												<span>
													{character._count?.wikiPages || 0} wiki pages
												</span>
											</div>
										</div>
									</CardHeader>
								</Card>
							</Link>
						))}
					</div>
				)}

				{/* Pagination */}
				{!isLoading && characters.length > 0 && (
					<div className="flex justify-center gap-4 mt-8">
						<Button
							variant="outline"
							disabled={offset === 0}
							onClick={() => setOffset(Math.max(0, offset - limit))}
						>
							Previous
						</Button>
						<Button
							variant="outline"
							disabled={!hasMore}
							onClick={() => setOffset(offset + limit)}
						>
							Next
						</Button>
					</div>
				)}
			</section>
		</div>
	)
}
