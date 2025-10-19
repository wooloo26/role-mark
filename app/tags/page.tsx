"use client"

import { TagScope } from "@prisma/client"
import { FolderTree, Plus, Search, Tag as TagIcon } from "lucide-react"
import { useState } from "react"
import { AnimatedGradientText } from "@/components/ui/animated-gradient-text"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { DotPattern } from "@/components/ui/dot-pattern"
import { Input } from "@/components/ui/input"
import { Particles } from "@/components/ui/particles"
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { trpc } from "@/lib/trpc/client"
import { cn } from "@/lib/utils"
import { CreateTagDialog } from "./components/create-tag-dialog"
import { CreateTagGroupDialog } from "./components/create-tag-group-dialog"
import { EditTagDialog } from "./components/edit-tag-dialog"
import { EditTagGroupDialog } from "./components/edit-tag-group-dialog"
import { TagCard } from "./components/tag-card"
import { TagGroupCard } from "./components/tag-group-card"

export default function TagsPage() {
	const [searchQuery, setSearchQuery] = useState("")
	const [selectedScope, setSelectedScope] = useState<TagScope>(
		TagScope.CHARACTER,
	)
	const [createTagOpen, setCreateTagOpen] = useState(false)
	const [createGroupOpen, setCreateGroupOpen] = useState(false)
	const [editingTag, setEditingTag] = useState<string | null>(null)
	const [editingGroup, setEditingGroup] = useState<string | null>(null)

	// Fetch grouped tags for the selected scope
	const { data: groupedData, isLoading } = trpc.tag.getGroupedTags.useQuery({
		scope: selectedScope,
	})

	// Filter by search query
	const filteredGrouped =
		groupedData?.grouped.filter((group) =>
			group.name.toLowerCase().includes(searchQuery.toLowerCase()),
		) || []

	const filteredUngrouped =
		groupedData?.ungrouped.filter((tag) =>
			tag.name.toLowerCase().includes(searchQuery.toLowerCase()),
		) || []

	// Fetch tag groups for management
	const { data: tagGroups } = trpc.tag.listGroups.useQuery({
		scope: selectedScope,
	})

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
							Tag Management
						</span>
					</AnimatedGradientText>

					<h1 className="text-4xl font-bold tracking-tight sm:text-5xl bg-clip-text text-transparent bg-gradient-to-b from-foreground to-foreground/60">
						Tags & Groups
					</h1>

					<p className="text-muted-foreground text-lg max-w-2xl mx-auto">
						Organize and manage tags for characters and resources
					</p>
				</div>
			</section>

			{/* Main Content */}
			<section className="container mx-auto px-4 pb-16">
				<Tabs defaultValue="tags" className="space-y-6">
					<TabsList className="grid w-full max-w-md mx-auto grid-cols-2">
						<TabsTrigger value="tags">
							<TagIcon className="h-4 w-4 mr-2" />
							Tags
						</TabsTrigger>
						<TabsTrigger value="groups">
							<FolderTree className="h-4 w-4 mr-2" />
							Tag Groups
						</TabsTrigger>
					</TabsList>

					{/* Tags Tab */}
					<TabsContent value="tags" className="space-y-6">
						{/* Search and Actions */}
						<div className="flex flex-col sm:flex-row gap-4">
							<div className="relative flex-1">
								<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
								<Input
									placeholder="Search tags..."
									value={searchQuery}
									onChange={(e) => setSearchQuery(e.target.value)}
									className="pl-10"
								/>
							</div>
							<Select
								value={selectedScope}
								onValueChange={(value) => setSelectedScope(value as TagScope)}
							>
								<SelectTrigger className="w-[180px]">
									<SelectValue placeholder="Select scope" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value={TagScope.CHARACTER}>
										Character Tags
									</SelectItem>
									<SelectItem value={TagScope.RESOURCE}>
										Resource Tags
									</SelectItem>
								</SelectContent>
							</Select>
							<Button onClick={() => setCreateTagOpen(true)} className="gap-2">
								<Plus className="h-4 w-4" />
								New Tag
							</Button>
						</div>

						{/* Loading State */}
						{isLoading && (
							<div className="text-center py-12 text-muted-foreground">
								Loading tags...
							</div>
						)}

						{/* Tags Display */}
						{!isLoading && (
							<div className="space-y-8">
								{/* Grouped Tags */}
								{filteredGrouped.map((group) => (
									<div key={group.id} className="space-y-4">
										<div className="flex items-center justify-between">
											<h3 className="text-xl font-semibold flex items-center gap-2">
												<FolderTree className="h-5 w-5" />
												{group.name}
											</h3>
											<Badge variant="outline">{group.tags.length} tags</Badge>
										</div>
										<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
											{group.tags.map((tag) => (
												<TagCard
													key={tag.id}
													tag={tag}
													onEdit={() => setEditingTag(tag.id)}
												/>
											))}
										</div>
									</div>
								))}

								{/* Ungrouped Tags */}
								{filteredUngrouped.length > 0 && (
									<div className="space-y-4">
										<div className="flex items-center justify-between">
											<h3 className="text-xl font-semibold flex items-center gap-2">
												<TagIcon className="h-5 w-5" />
												Ungrouped Tags
											</h3>
											<Badge variant="outline">
												{filteredUngrouped.length} tags
											</Badge>
										</div>
										<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
											{filteredUngrouped.map((tag) => (
												<TagCard
													key={tag.id}
													tag={tag}
													onEdit={() => setEditingTag(tag.id)}
												/>
											))}
										</div>
									</div>
								)}

								{/* Empty State */}
								{filteredGrouped.length === 0 &&
									filteredUngrouped.length === 0 && (
										<Card className="text-center py-12">
											<CardContent>
												<TagIcon className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
												<p className="text-muted-foreground">
													No tags found. Create your first tag to get started.
												</p>
											</CardContent>
										</Card>
									)}
							</div>
						)}
					</TabsContent>

					{/* Tag Groups Tab */}
					<TabsContent value="groups" className="space-y-6">
						{/* Search and Actions */}
						<div className="flex flex-col sm:flex-row gap-4">
							<div className="relative flex-1">
								<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
								<Input
									placeholder="Search tag groups..."
									value={searchQuery}
									onChange={(e) => setSearchQuery(e.target.value)}
									className="pl-10"
								/>
							</div>
							<Select
								value={selectedScope}
								onValueChange={(value) => setSelectedScope(value as TagScope)}
							>
								<SelectTrigger className="w-[180px]">
									<SelectValue placeholder="Select scope" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value={TagScope.CHARACTER}>
										Character Groups
									</SelectItem>
									<SelectItem value={TagScope.RESOURCE}>
										Resource Groups
									</SelectItem>
								</SelectContent>
							</Select>
							<Button
								onClick={() => setCreateGroupOpen(true)}
								className="gap-2"
							>
								<Plus className="h-4 w-4" />
								New Group
							</Button>
						</div>

						{/* Tag Groups Display */}
						{!isLoading && (
							<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
								{tagGroups
									?.filter((group) =>
										group.name
											.toLowerCase()
											.includes(searchQuery.toLowerCase()),
									)
									.map((group) => (
										<TagGroupCard
											key={group.id}
											group={group}
											onEdit={() => setEditingGroup(group.id)}
										/>
									))}
							</div>
						)}

						{/* Empty State */}
						{!isLoading && (!tagGroups || tagGroups.length === 0) && (
							<Card className="text-center py-12">
								<CardContent>
									<FolderTree className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
									<p className="text-muted-foreground">
										No tag groups found. Create your first group to organize
										tags.
									</p>
								</CardContent>
							</Card>
						)}
					</TabsContent>
				</Tabs>
			</section>

			{/* Dialogs */}
			<CreateTagDialog
				open={createTagOpen}
				onOpenChange={setCreateTagOpen}
				defaultScope={selectedScope}
			/>
			<CreateTagGroupDialog
				open={createGroupOpen}
				onOpenChange={setCreateGroupOpen}
				defaultScope={selectedScope}
			/>
			{editingTag && (
				<EditTagDialog
					tagId={editingTag}
					open={!!editingTag}
					onOpenChange={(open: boolean) => !open && setEditingTag(null)}
				/>
			)}
			{editingGroup && (
				<EditTagGroupDialog
					groupId={editingGroup}
					open={!!editingGroup}
					onOpenChange={(open: boolean) => !open && setEditingGroup(null)}
				/>
			)}
		</div>
	)
}
