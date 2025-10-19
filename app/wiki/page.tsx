"use client"

import { BookOpen, Clock, Loader2, Plus, Search, User } from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import {
	Card,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card"
import { DotPattern } from "@/components/ui/dot-pattern"
import { Input } from "@/components/ui/input"
import { ShimmerButton } from "@/components/ui/shimmer-button"
import { trpc } from "@/lib/trpc/client"
import { cn } from "@/lib/utils"

export default function WikiPage() {
	const [searchQuery, setSearchQuery] = useState("")
	const { data, isLoading } = trpc.wiki.search.useQuery({
		title: searchQuery,
		limit: 50,
	})

	const wikiPages = data?.wikiPages ?? []

	return (
		<div className="container relative py-8 mx-auto">
			<DotPattern
				className={cn(
					"[mask-image:radial-gradient(700px_circle_at_center,white,transparent)]",
					"absolute inset-0 -z-10",
				)}
			/>
			<div className="flex flex-col gap-8">
				{/* Header */}
				<div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
					<div className="space-y-2">
						<h1 className="text-4xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/60">
							Wiki Library
						</h1>
						<p className="text-lg text-muted-foreground">
							Browse and edit your knowledge base
						</p>
					</div>
					<ShimmerButton className="shadow-lg" shimmerSize="0.15em">
						<Link
							href="/wiki/new"
							className="flex items-center gap-2 px-4 py-2"
						>
							<Plus className="h-4 w-4" />
							Create Page
						</Link>
					</ShimmerButton>
				</div>

				{/* Search */}
				<div className="relative">
					<Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
					<Input
						placeholder="Search wiki pages..."
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
						className="pl-10"
					/>
				</div>

				{/* Wiki List */}
				{isLoading ? (
					<div className="flex flex-col justify-center items-center py-20 gap-4">
						<Loader2 className="h-12 w-12 animate-spin text-primary" />
						<p className="text-muted-foreground">Loading wiki pages...</p>
					</div>
				) : (
					<div className="grid gap-4 md:gap-6">
						{wikiPages.map((page) => (
							<Link key={page.id} href={`/wiki/${page.id}`}>
								<Card className="group transition-all duration-300 hover:shadow-xl hover:scale-[1.02] border-1 hover:border-primary/50">
									<CardHeader>
										<div className="flex items-start gap-5">
											<div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-primary/10 group-hover:bg-primary/20 transition-colors">
												<BookOpen className="h-7 w-7 text-primary" />
											</div>
											<div className="flex-1 min-w-0">
												<div className="flex items-start justify-between gap-4 mb-2">
													<CardTitle className="text-xl group-hover:text-primary transition-colors">
														{page.title}
													</CardTitle>
													<Badge variant="secondary" className="shrink-0">
														{page.content
															? `${page.content.length} chars`
															: "Empty"}
													</Badge>
												</div>
												{page.content && (
													<CardDescription className="line-clamp-2 text-base leading-relaxed">
														{page.content.substring(0, 200)}
														{page.content.length > 200 && "..."}
													</CardDescription>
												)}
												<div className="flex flex-wrap items-center gap-4 mt-4 text-sm text-muted-foreground">
													<span className="flex items-center gap-1.5">
														<Clock className="h-4 w-4" />
														Updated{" "}
														{new Date(page.updatedAt).toLocaleDateString()}
													</span>
													{page.author && (
														<span className="flex items-center gap-1.5">
															<User className="h-4 w-4" />
															{page.author.name}
														</span>
													)}
												</div>
											</div>
										</div>
									</CardHeader>
								</Card>
							</Link>
						))}
					</div>
				)}

				{!isLoading && wikiPages.length === 0 && (
					<Card className="border-1 border-dashed">
						<CardHeader className="text-center py-16">
							<div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-muted">
								<BookOpen className="h-10 w-10 text-muted-foreground" />
							</div>
							<CardTitle className="text-2xl mb-2">
								{searchQuery ? "No Results Found" : "No Wiki Pages Yet"}
							</CardTitle>
							<CardDescription className="text-base mb-6">
								{searchQuery
									? "Try adjusting your search terms"
									: "Start building your knowledge base by creating your first wiki page"}
							</CardDescription>
							<div className="flex justify-center">
								<ShimmerButton className="shadow-lg" shimmerSize="0.15em">
									<Link
										href="/wiki/new"
										className="flex items-center gap-2 px-6 py-2"
									>
										<Plus className="h-4 w-4" />
										Create your first wiki page
									</Link>
								</ShimmerButton>
							</div>
						</CardHeader>
					</Card>
				)}
			</div>
		</div>
	)
}
