"use client";

import { BookOpen, Loader2, Plus, Search } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc/client";

export default function WikiPage() {
	const [searchQuery, setSearchQuery] = useState("");
	const { data, isLoading } = trpc.wiki.search.useQuery({
		title: searchQuery,
		limit: 50,
	});

	const wikiPages = data?.wikiPages ?? [];

	return (
		<div className="container py-8">
			<div className="flex flex-col gap-6">
				{/* Header */}
				<div className="flex items-center justify-between">
					<div>
						<h1 className="text-3xl font-bold tracking-tight">Wiki</h1>
						<p className="text-muted-foreground">Browse and edit wiki pages</p>
					</div>
					<Button asChild>
						<Link href="/wiki/new">
							<Plus className="mr-2 h-4 w-4" />
							Create Page
						</Link>
					</Button>
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
					<div className="flex justify-center items-center py-12">
						<Loader2 className="h-8 w-8 animate-spin text-primary" />
					</div>
				) : (
					<div className="grid gap-4">
						{wikiPages.map((page) => (
							<Link key={page.id} href={`/wiki/${page.id}`}>
								<Card className="transition-shadow hover:shadow-lg">
									<CardHeader>
										<div className="flex items-start gap-4">
											<BookOpen className="h-8 w-8 text-primary mt-1" />
											<div className="flex-1">
												<CardTitle>{page.title}</CardTitle>
												{page.content && (
													<CardDescription className="line-clamp-2 mt-2">
														{page.content.substring(0, 200)}...
													</CardDescription>
												)}
												<div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
													<span>
														Updated{" "}
														{new Date(page.updatedAt).toLocaleDateString()}
													</span>
													{page.author && <span>by {page.author.name}</span>}
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
					<div className="flex flex-col items-center justify-center py-12 text-center">
						<p className="text-lg text-muted-foreground mb-4">
							{searchQuery
								? "No wiki pages found matching your search"
								: "No wiki pages yet"}
						</p>
						<Button asChild>
							<Link href="/wiki/new">
								<Plus className="mr-2 h-4 w-4" />
								Create your first wiki page
							</Link>
						</Button>
					</div>
				)}
			</div>
		</div>
	);
}
