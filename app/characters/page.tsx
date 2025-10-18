"use client"

import { Loader2, Plus, Search } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { trpc } from "@/lib/trpc/client"

export default function CharactersPage() {
	const [searchQuery, setSearchQuery] = useState("")
	const { data, isLoading } = trpc.character.search.useQuery({
		name: searchQuery,
		limit: 50,
	})

	const characters = data?.characters ?? []

	return (
		<div className="container py-8">
			<div className="flex flex-col gap-6">
				{/* Header */}
				<div className="flex items-center justify-between">
					<div>
						<h1 className="text-3xl font-bold tracking-tight">Characters</h1>
						<p className="text-muted-foreground">
							Browse and manage your character database
						</p>
					</div>
					<Button asChild>
						<Link href="/characters/new">
							<Plus className="mr-2 h-4 w-4" />
							Add Character
						</Link>
					</Button>
				</div>

				{/* Search */}
				<div className="relative">
					<Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
					<Input
						placeholder="Search characters..."
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
						className="pl-10"
					/>
				</div>

				{/* Character Grid */}
				{isLoading ? (
					<div className="flex justify-center items-center py-12">
						<Loader2 className="h-8 w-8 animate-spin text-primary" />
					</div>
				) : (
					<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
						{characters.map((character) => (
							<Link
								key={character.id}
								href={`/characters/${character.id}`}
								className="group"
							>
								<Card className="overflow-hidden transition-shadow hover:shadow-lg">
									<div className="aspect-square relative bg-muted">
										{character.avatarUrl ? (
											<Image
												src={character.avatarUrl}
												alt={character.name}
												fill
												className="object-cover group-hover:scale-105 transition-transform"
											/>
										) : (
											<div className="flex items-center justify-center h-full text-muted-foreground text-4xl font-bold">
												{character.name[0]?.toUpperCase()}
											</div>
										)}
									</div>
									<CardHeader>
										<CardTitle className="line-clamp-1">
											{character.name}
										</CardTitle>
										{character.info && (
											<CardDescription className="line-clamp-2">
												{character.info}
											</CardDescription>
										)}
									</CardHeader>
									{character.dynamicTags &&
										character.dynamicTags.length > 0 && (
											<CardContent>
												<div className="flex flex-wrap gap-1">
													{character.dynamicTags
														.slice(0, 3)
														.map((tag: string) => (
															<Badge
																key={tag}
																variant="secondary"
																className="text-xs"
															>
																{tag}
															</Badge>
														))}
													{character.dynamicTags.length > 3 && (
														<Badge variant="outline" className="text-xs">
															+{character.dynamicTags.length - 3}
														</Badge>
													)}
												</div>
											</CardContent>
										)}
								</Card>
							</Link>
						))}
					</div>
				)}

				{!isLoading && characters.length === 0 && (
					<div className="flex flex-col items-center justify-center py-12 text-center">
						<p className="text-lg text-muted-foreground mb-4">
							{searchQuery
								? "No characters found matching your search"
								: "No characters yet"}
						</p>
						<Button asChild>
							<Link href="/characters/new">
								<Plus className="mr-2 h-4 w-4" />
								Create your first character
							</Link>
						</Button>
					</div>
				)}
			</div>
		</div>
	)
}
