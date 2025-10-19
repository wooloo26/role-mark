"use client"

import { TagScope } from "@prisma/client"
import { FolderTree, Tag as TagIcon } from "lucide-react"
import { useState } from "react"
import { EmptyState } from "@/components/layout/empty-state"
import { HeroSection } from "@/components/layout/hero-section"
import { CreateTagDialog } from "@/components/tags/create-tag-dialog"
import { CreateTagGroupDialog } from "@/components/tags/create-tag-group-dialog"
import { EditTagDialog } from "@/components/tags/edit-tag-dialog"
import { EditTagGroupDialog } from "@/components/tags/edit-tag-group-dialog"
import { TagCard } from "@/components/tags/tag-card"
import { TagGrid } from "@/components/tags/tag-grid"
import { TagGroupCard } from "@/components/tags/tag-group-card"
import { TagGroupHeader } from "@/components/tags/tag-group-header"
import { TagsSearchBar } from "@/components/tags/tags-search-bar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { trpc } from "@/lib/trpc/client"

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

	const filteredTagGroups =
		tagGroups?.filter((group) =>
			group.name.toLowerCase().includes(searchQuery.toLowerCase()),
		) || []

	return (
		<div className="min-h-screen">
			<HeroSection
				badge="Tag Management"
				title="Tags & Groups"
				description="Organize and manage tags for characters and resources"
			/>

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
						<TagsSearchBar
							searchQuery={searchQuery}
							onSearchChange={setSearchQuery}
							selectedScope={selectedScope}
							onScopeChange={setSelectedScope}
							onCreateClick={() => setCreateTagOpen(true)}
							createLabel="New Tag"
						/>

						{isLoading && (
							<div className="text-center py-12 text-muted-foreground">
								Loading tags...
							</div>
						)}

						{!isLoading && (
							<div className="space-y-8">
								{/* Grouped Tags */}
								{filteredGrouped.map((group) => (
									<div key={group.id} className="space-y-4">
										<TagGroupHeader
											name={group.name}
											count={group.tags.length}
										/>
										<TagGrid>
											{group.tags.map((tag) => (
												<TagCard
													key={tag.id}
													tag={tag}
													onEdit={() => setEditingTag(tag.id)}
												/>
											))}
										</TagGrid>
									</div>
								))}

								{/* Ungrouped Tags */}
								{filteredUngrouped.length > 0 && (
									<div className="space-y-4">
										<TagGroupHeader
											name="Ungrouped Tags"
											count={filteredUngrouped.length}
											icon={TagIcon}
										/>
										<TagGrid>
											{filteredUngrouped.map((tag) => (
												<TagCard
													key={tag.id}
													tag={tag}
													onEdit={() => setEditingTag(tag.id)}
												/>
											))}
										</TagGrid>
									</div>
								)}

								{/* Empty State */}
								{filteredGrouped.length === 0 &&
									filteredUngrouped.length === 0 && (
										<EmptyState
											icon={TagIcon}
											title="No tags found"
											description="No tags found. Create your first tag to get started."
										/>
									)}
							</div>
						)}
					</TabsContent>

					{/* Tag Groups Tab */}
					<TabsContent value="groups" className="space-y-6">
						<TagsSearchBar
							searchQuery={searchQuery}
							onSearchChange={setSearchQuery}
							selectedScope={selectedScope}
							onScopeChange={setSelectedScope}
							onCreateClick={() => setCreateGroupOpen(true)}
							createLabel="New Group"
							scopeLabels={{
								CHARACTER: "Character Groups",
								RESOURCE: "Resource Groups",
							}}
						/>

						{!isLoading && filteredTagGroups.length > 0 ? (
							<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
								{filteredTagGroups.map((group) => (
									<TagGroupCard
										key={group.id}
										group={group}
										onEdit={() => setEditingGroup(group.id)}
									/>
								))}
							</div>
						) : (
							<EmptyState
								icon={FolderTree}
								title="No tag groups found"
								description="No tag groups found. Create your first group to organize tags."
							/>
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
