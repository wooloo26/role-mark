import { ArrowLeft, Edit } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { prisma } from "@/lib/prisma"
import { createCaller } from "@/server/routers/_app"

type Props = {
	params: Promise<{ id: string }>
}

export default async function CharacterDetailPage({ params }: Props) {
	const { id } = await params

	// Create server-side tRPC caller
	const caller = createCaller({ prisma, session: null })

	try {
		const character = await caller.character.getById({ id })

		if (!character) {
			notFound()
		}

		// Parse static tags if they exist
		const staticTags = character.staticTags
			? (character.staticTags as Record<string, unknown>)
			: null

		return (
			<div className="container py-8">
				<div className="flex flex-col gap-6">
					{/* Back button */}
					<Button variant="ghost" asChild className="w-fit">
						<Link href="/characters">
							<ArrowLeft className="mr-2 h-4 w-4" />
							Back to Characters
						</Link>
					</Button>

					{/* Header with portrait */}
					<div className="grid gap-6 md:grid-cols-[300px_1fr]">
						<div className="space-y-4">
							{/* Portrait */}
							<div className="aspect-[3/4] relative rounded-lg overflow-hidden bg-muted">
								{character.portraitUrl ? (
									<Image
										src={character.portraitUrl}
										alt={character.name}
										fill
										className="object-cover"
										priority
									/>
								) : character.avatarUrl ? (
									<Image
										src={character.avatarUrl}
										alt={character.name}
										fill
										className="object-cover"
										priority
									/>
								) : (
									<div className="flex items-center justify-center h-full text-muted-foreground text-6xl font-bold">
										{character.name[0]?.toUpperCase()}
									</div>
								)}
							</div>

							{/* Avatar if different from portrait */}
							{character.avatarUrl && character.portraitUrl && (
								<div className="aspect-square relative rounded-lg overflow-hidden bg-muted">
									<Image
										src={character.avatarUrl}
										alt={`${character.name} avatar`}
										fill
										className="object-cover"
									/>
								</div>
							)}
						</div>

						{/* Main content */}
						<div className="space-y-6">
							<div className="flex items-start justify-between">
								<div>
									<h1 className="text-4xl font-bold tracking-tight">
										{character.name}
									</h1>
									{character.info && (
										<p className="text-lg text-muted-foreground mt-2">
											{character.info}
										</p>
									)}
								</div>
								<Button asChild>
									<Link href={`/characters/${character.id}/edit`}>
										<Edit className="mr-2 h-4 w-4" />
										Edit
									</Link>
								</Button>
							</div>

							{/* Dynamic Tags */}
							{character.dynamicTags && character.dynamicTags.length > 0 && (
								<div className="flex flex-wrap gap-2">
									{character.dynamicTags.map((tag) => (
										<Badge key={tag} variant="secondary">
											{tag}
										</Badge>
									))}
								</div>
							)}

							<Separator />

							{/* Tabs for different sections */}
							<Tabs defaultValue="info" className="w-full">
								<TabsList>
									<TabsTrigger value="info">Information</TabsTrigger>
									<TabsTrigger value="relationships">Relationships</TabsTrigger>
									<TabsTrigger value="resources">Resources</TabsTrigger>
									<TabsTrigger value="wiki">Wiki Pages</TabsTrigger>
									<TabsTrigger value="comments">Comments</TabsTrigger>
								</TabsList>

								{/* Information Tab */}
								<TabsContent value="info" className="space-y-4">
									{staticTags && Object.keys(staticTags).length > 0 ? (
										<Card>
											<CardHeader>
												<CardTitle>Profile Details</CardTitle>
												<CardDescription>
													Static character information
												</CardDescription>
											</CardHeader>
											<CardContent className="grid gap-4 sm:grid-cols-2">
												{Object.entries(staticTags).map(([key, value]) => (
													<div key={key}>
														<dt className="text-sm font-medium text-muted-foreground capitalize">
															{key.replace(/([A-Z])/g, " $1").trim()}
														</dt>
														<dd className="text-sm mt-1">
															{value instanceof Date
																? value.toLocaleDateString()
																: String(value)}
														</dd>
													</div>
												))}
											</CardContent>
										</Card>
									) : (
										<p className="text-muted-foreground text-center py-8">
											No additional information available
										</p>
									)}
								</TabsContent>

								{/* Relationships Tab */}
								<TabsContent value="relationships">
									<p className="text-muted-foreground text-center py-8">
										Relationships feature coming soon
									</p>
								</TabsContent>

								{/* Resources Tab */}
								<TabsContent value="resources">
									<p className="text-muted-foreground text-center py-8">
										No resources linked yet
									</p>
								</TabsContent>

								{/* Wiki Pages Tab */}
								<TabsContent value="wiki">
									<p className="text-muted-foreground text-center py-8">
										No wiki pages linked yet
									</p>
								</TabsContent>

								{/* Comments Tab */}
								<TabsContent value="comments">
									<p className="text-muted-foreground text-center py-8">
										No comments yet
									</p>
								</TabsContent>
							</Tabs>
						</div>
					</div>
				</div>
			</div>
		)
	} catch (error) {
		console.error("Error fetching character:", error)
		notFound()
	}
}
