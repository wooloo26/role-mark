"use client"

import {
	ArrowLeft,
	Calendar,
	Edit,
	ExternalLink,
	FileText,
	Image as ImageIcon,
	Link2,
	MessageSquare,
	Ruler,
	Trash2,
	Weight,
} from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { use } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
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
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { trpc } from "@/lib/trpc/client"

interface CharacterDetailPageProps {
	params: Promise<{ id: string }>
}

export default function CharacterDetailPage({
	params,
}: CharacterDetailPageProps) {
	const { id } = use(params)
	const router = useRouter()
	const { data: character, isLoading } = trpc.character.getById.useQuery({ id })
	const deleteMutation = trpc.character.delete.useMutation({
		onSuccess: () => {
			router.push("/characters")
		},
	})

	const handleDelete = () => {
		if (character) {
			deleteMutation.mutate({ id: character.id })
		}
	}

	if (isLoading) {
		return (
			<div className="container mx-auto px-4 py-8">
				<div className="animate-pulse space-y-8">
					<div className="h-8 bg-muted rounded w-48" />
					<div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
						<div className="lg:col-span-1">
							<div className="h-96 bg-muted rounded" />
						</div>
						<div className="lg:col-span-2 space-y-4">
							<div className="h-12 bg-muted rounded w-3/4" />
							<div className="h-32 bg-muted rounded" />
						</div>
					</div>
				</div>
			</div>
		)
	}

	if (!character) {
		return (
			<div className="container mx-auto px-4 py-16 text-center">
				<h1 className="text-2xl font-bold mb-4">Character not found</h1>
				<Button asChild>
					<Link href="/characters">
						<ArrowLeft className="h-4 w-4 mr-2" />
						Back to Characters
					</Link>
				</Button>
			</div>
		)
	}

	const staticTagsMap = new Map(
		character.staticTags?.map((st) => [st.tagDefinition.name, st.value]) || [],
	)

	return (
		<div className="container mx-auto px-4 py-8">
			{/* Header */}
			<div className="flex items-center justify-between mb-8">
				<Button variant="ghost" asChild>
					<Link href="/characters">
						<ArrowLeft className="h-4 w-4 mr-2" />
						Back
					</Link>
				</Button>
				<div className="flex gap-2">
					<Button variant="outline" asChild>
						<Link href={`/characters/${character.id}/edit`}>
							<Edit className="h-4 w-4 mr-2" />
							Edit
						</Link>
					</Button>
					<Dialog>
						<DialogTrigger asChild>
							<Button variant="destructive">
								<Trash2 className="h-4 w-4 mr-2" />
								Delete
							</Button>
						</DialogTrigger>
						<DialogContent>
							<DialogHeader>
								<DialogTitle>Delete Character</DialogTitle>
								<DialogDescription>
									Are you sure you want to delete "{character.name}"? This
									action cannot be undone.
								</DialogDescription>
							</DialogHeader>
							<DialogFooter>
								<Button variant="outline">Cancel</Button>
								<Button
									variant="destructive"
									onClick={handleDelete}
									disabled={deleteMutation.isPending}
								>
									{deleteMutation.isPending ? "Deleting..." : "Delete"}
								</Button>
							</DialogFooter>
						</DialogContent>
					</Dialog>
				</div>
			</div>

			{/* Main Content */}
			<div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
				{/* Left Column - Images & Quick Info */}
				<div className="lg:col-span-1 space-y-6">
					{/* Avatar */}
					<Card>
						<CardContent className="p-4">
							<div className="aspect-square relative rounded-xl overflow-hidden mb-3 max-w-[220px] mx-auto">
								{character.avatarUrl ? (
									<Image
										src={character.avatarUrl}
										alt={character.name}
										fill
										className="object-cover"
									/>
								) : (
									<div className="w-full h-full flex items-center justify-center">
										<Avatar className="h-20 w-20">
											<AvatarFallback className="text-4xl">
												{character.name.charAt(0).toUpperCase()}
											</AvatarFallback>
										</Avatar>
									</div>
								)}
							</div>
							<h1 className="text-xl font-bold text-center">
								{character.name}
							</h1>
						</CardContent>
					</Card>

					{/* Portrait */}
					{character.portraitUrl && (
						<Card>
							<CardHeader className="pb-3">
								<CardTitle className="text-base">Portrait</CardTitle>
							</CardHeader>
							<CardContent className="pt-0">
								<div className="aspect-[2/3] relative rounded-lg overflow-hidden mx-auto">
									<Image
										src={character.portraitUrl}
										alt={`${character.name} portrait`}
										fill
										className="object-cover"
									/>
								</div>
							</CardContent>
						</Card>
					)}
				</div>

				{/* Right Column - Details & Content */}
				<div className="lg:col-span-3 space-y-4">
					{/* Description & Attributes Combined */}
					<Card>
						<CardContent className="p-4">
							{/* About Section */}
							{character.info && (
								<div className="mb-4">
									<h3 className="text-lg font-semibold mb-2">About</h3>
									<p className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">
										{character.info}
									</p>
								</div>
							)}

							{/* Static Tags - Compact Grid Layout */}
							{character.staticTags && character.staticTags.length > 0 && (
								<div className="border-t pt-4">
									<h3 className="text-lg font-semibold mb-3">Attributes</h3>
									<div className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-2">
										{staticTagsMap.get("height") && (
											<div className="flex items-center gap-2">
												<Ruler className="h-3.5 w-3.5 text-muted-foreground" />
												<span className="text-sm text-muted-foreground">
													Height:
												</span>
												<span className="text-sm font-medium">
													{staticTagsMap.get("height")} cm
												</span>
											</div>
										)}
										{staticTagsMap.get("weight") && (
											<div className="flex items-center gap-2">
												<Weight className="h-3.5 w-3.5 text-muted-foreground" />
												<span className="text-sm text-muted-foreground">
													Weight:
												</span>
												<span className="text-sm font-medium">
													{staticTagsMap.get("weight")} kg
												</span>
											</div>
										)}
										{staticTagsMap.get("birthday") && (
											<div className="flex items-center gap-2">
												<Calendar className="h-3.5 w-3.5 text-muted-foreground" />
												<span className="text-sm text-muted-foreground">
													Birthday:
												</span>
												<span className="text-sm font-medium">
													{new Date(
														staticTagsMap.get("birthday")!,
													).toLocaleDateString()}
												</span>
											</div>
										)}
									</div>
								</div>
							)}

							{/* Tags Section */}
							{character.tags && character.tags.length > 0 && (
								<div className="border-t pt-4 mt-4">
									<h3 className="text-lg font-semibold mb-3">Tags</h3>
									<div className="grid grid-cols-1 md:grid-cols-3 gap-3">
										{/* Group tags by group */}
										{(() => {
											const tagsByGroup = new Map<
												string,
												Array<{ id: string; name: string }>
											>()

											character.tags.forEach((ct) => {
												const groupName = ct.tag.group?.name || "Ungrouped"
												if (!tagsByGroup.has(groupName)) {
													tagsByGroup.set(groupName, [])
												}
												tagsByGroup.get(groupName)?.push({
													id: ct.tag.id,
													name: ct.tag.name,
												})
											})

											return Array.from(tagsByGroup.entries()).map(
												([groupName, tags]) => (
													<div key={groupName} className="flex items-start">
														<h4 className="text-sm font-medium text-muted-foreground mr-2 shrink-0">
															{groupName}:
														</h4>
														<div className="flex flex-wrap gap-2 flex-1">
															{tags.map((tag) => (
																<Badge
																	key={tag.id}
																	variant="secondary"
																	className="text-xs"
																>
																	{tag.name}
																</Badge>
															))}
														</div>
													</div>
												),
											)
										})()}
									</div>
								</div>
							)}
						</CardContent>
					</Card>

					{/* Tabs */}
					<Tabs defaultValue="resources" className="w-full">
						<TabsList className="grid w-full grid-cols-4 mb-2">
							<TabsTrigger value="resources" className="gap-2">
								<ImageIcon className="h-4 w-4" />
								Resources
							</TabsTrigger>
							<TabsTrigger value="wiki" className="gap-2">
								<FileText className="h-4 w-4" />
								Wiki
							</TabsTrigger>
							<TabsTrigger value="relations" className="gap-2">
								<Link2 className="h-4 w-4" />
								Relations
							</TabsTrigger>
							<TabsTrigger value="comments" className="gap-2">
								<MessageSquare className="h-4 w-4" />
								Comments
							</TabsTrigger>
						</TabsList>

						{/* Resources Tab */}
						<TabsContent value="resources" className="space-y-4">
							{character.resources && character.resources.length > 0 ? (
								<div className="grid grid-cols-2 md:grid-cols-3 gap-4">
									{character.resources.map((cr) => (
										<Card
											key={cr.resource.id}
											className="group hover:shadow-md transition-shadow"
										>
											<CardContent className="p-4">
												<div className="aspect-square bg-muted rounded-lg mb-2 flex items-center justify-center">
													<ImageIcon className="h-8 w-8 text-muted-foreground" />
												</div>
												<p className="text-sm font-medium truncate">
													{cr.resource.title}
												</p>
											</CardContent>
										</Card>
									))}
								</div>
							) : (
								<Card>
									<CardContent className="text-center py-8 text-muted-foreground">
										No resources associated with this character
									</CardContent>
								</Card>
							)}
						</TabsContent>

						{/* Wiki Tab */}
						<TabsContent value="wiki" className="space-y-4">
							{character.wikiPages && character.wikiPages.length > 0 ? (
								<div className="space-y-3">
									{character.wikiPages.map((cw) => (
										<Card
											key={cw.wikiPage.id}
											className="group hover:shadow-md transition-shadow"
										>
											<CardHeader>
												<div className="flex items-center justify-between">
													<CardTitle className="text-lg">
														{cw.wikiPage.title}
													</CardTitle>
													<Button variant="ghost" size="sm" asChild>
														<Link href={`/wiki/${cw.wikiPage.id}`}>
															<ExternalLink className="h-4 w-4" />
														</Link>
													</Button>
												</div>
												{cw.wikiPage.content && (
													<CardDescription className="line-clamp-2">
														{cw.wikiPage.content.substring(0, 150)}...
													</CardDescription>
												)}
											</CardHeader>
										</Card>
									))}
								</div>
							) : (
								<Card>
									<CardContent className="text-center py-8 text-muted-foreground">
										No wiki pages associated with this character
									</CardContent>
								</Card>
							)}
						</TabsContent>

						{/* Relations Tab */}
						<TabsContent value="relations" className="space-y-4">
							{(character.relationsFrom &&
								character.relationsFrom.length > 0) ||
							(character.relationsTo && character.relationsTo.length > 0) ? (
								<div className="space-y-6">
									{character.relationsFrom &&
										character.relationsFrom.length > 0 && (
											<div>
												<h3 className="font-semibold mb-3">Relationships</h3>
												<div className="space-y-2">
													{character.relationsFrom.map((rel) => (
														<Card key={rel.id}>
															<CardContent className="flex items-center gap-4 p-4">
																<Avatar>
																	<AvatarImage
																		src={rel.toCharacter.avatarUrl || undefined}
																	/>
																	<AvatarFallback>
																		{rel.toCharacter.name
																			.charAt(0)
																			.toUpperCase()}
																	</AvatarFallback>
																</Avatar>
																<div className="flex-1">
																	<p className="font-medium">
																		{rel.toCharacter.name}
																	</p>
																	<p className="text-sm text-muted-foreground">
																		{rel.relationType.name}
																	</p>
																</div>
																<Button variant="ghost" size="sm" asChild>
																	<Link
																		href={`/characters/${rel.toCharacter.id}`}
																	>
																		<ExternalLink className="h-4 w-4" />
																	</Link>
																</Button>
															</CardContent>
														</Card>
													))}
												</div>
											</div>
										)}
								</div>
							) : (
								<Card>
									<CardContent className="text-center py-8 text-muted-foreground">
										No relationships defined for this character
									</CardContent>
								</Card>
							)}
						</TabsContent>

						{/* Comments Tab */}
						<TabsContent value="comments" className="space-y-4">
							{character.comments && character.comments.length > 0 ? (
								<div className="space-y-3">
									{character.comments.map((cc) => (
										<Card key={cc.comment.id}>
											<CardContent className="p-4">
												<div className="flex items-start gap-3">
													<Avatar>
														<AvatarImage
															src={cc.comment.author.image || undefined}
														/>
														<AvatarFallback>
															{cc.comment.author.name
																?.charAt(0)
																.toUpperCase() || "U"}
														</AvatarFallback>
													</Avatar>
													<div className="flex-1">
														<div className="flex items-center gap-2 mb-1">
															<span className="font-medium">
																{cc.comment.author.name}
															</span>
															<span className="text-xs text-muted-foreground">
																{new Date(
																	cc.comment.createdAt,
																).toLocaleDateString()}
															</span>
														</div>
														<p className="text-sm text-muted-foreground">
															{cc.comment.content}
														</p>
													</div>
												</div>
											</CardContent>
										</Card>
									))}
								</div>
							) : (
								<Card>
									<CardContent className="text-center py-8 text-muted-foreground">
										No comments yet
									</CardContent>
								</Card>
							)}
						</TabsContent>
					</Tabs>
				</div>
			</div>
		</div>
	)
}
