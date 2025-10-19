"use client"

import { Filter, Network, Plus, Search } from "lucide-react"
import { useState } from "react"
import { CharacterRelationCard } from "@/components/characters/character-relation-card"
import { CreateCharacterRelationDialog } from "@/components/characters/create-character-relation-dialog"
import { DeleteCharacterRelationDialog } from "@/components/characters/delete-character-relation-dialog"
import { EditCharacterRelationDialog } from "@/components/characters/edit-character-relation-dialog"
import { RelationStatsCards } from "@/components/characters/relation-stats-cards"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select"
import { trpc } from "@/lib/trpc/client"

interface CharacterRelationsManagementProps {
	characterId: string
	characterName: string
	isOwner?: boolean
}

export function CharacterRelationsManagement({
	characterId,
	characterName,
	isOwner = false,
}: CharacterRelationsManagementProps) {
	const [createDialogOpen, setCreateDialogOpen] = useState(false)
	const [editDialogState, setEditDialogState] = useState<{
		open: boolean
		relationId: string
	}>({ open: false, relationId: "" })
	const [deleteDialogState, setDeleteDialogState] = useState<{
		open: boolean
		relationId: string
		targetName: string
		typeName: string
	}>({ open: false, relationId: "", targetName: "", typeName: "" })

	const [searchQuery, setSearchQuery] = useState("")
	const [filterRelationType, setFilterRelationType] = useState<string>("all")

	// Fetch character relations
	const { data: relations, isLoading } = trpc.relation.getRelations.useQuery({
		characterId,
		includeIncoming: true,
		includeOutgoing: true,
		...(filterRelationType !== "all" && { relationTypeId: filterRelationType }),
	})

	// Fetch relation types for filtering
	const { data: relationTypes } = trpc.relation.getAllTypes.useQuery()

	const handleEdit = (relationId: string) => {
		setEditDialogState({ open: true, relationId })
	}

	const handleDelete = (relationId: string) => {
		const outgoingRelation = relations?.outgoing.find(
			(r) => r.id === relationId,
		)
		const incomingRelation = relations?.incoming.find(
			(r) => r.id === relationId,
		)

		if (outgoingRelation) {
			setDeleteDialogState({
				open: true,
				relationId,
				targetName: outgoingRelation.toCharacter.name,
				typeName: outgoingRelation.relationType.name,
			})
		} else if (incomingRelation) {
			setDeleteDialogState({
				open: true,
				relationId,
				targetName: incomingRelation.fromCharacter.name,
				typeName: incomingRelation.relationType.name,
			})
		}
	}

	// Filter relations by search
	const filterOutgoingRelations = () => {
		if (!relations?.outgoing) return []
		return relations.outgoing.filter((rel) => {
			return (
				rel.toCharacter.name
					.toLowerCase()
					.includes(searchQuery.toLowerCase()) ||
				rel.relationType.name.toLowerCase().includes(searchQuery.toLowerCase())
			)
		})
	}

	const filterIncomingRelations = () => {
		if (!relations?.incoming) return []
		return relations.incoming.filter((rel) => {
			return (
				rel.fromCharacter.name
					.toLowerCase()
					.includes(searchQuery.toLowerCase()) ||
				rel.relationType.name.toLowerCase().includes(searchQuery.toLowerCase())
			)
		})
	}

	const filteredOutgoing = filterOutgoingRelations()
	const filteredIncoming = filterIncomingRelations()

	// Calculate statistics
	const totalRelations =
		(relations?.outgoing.length || 0) + (relations?.incoming.length || 0)
	const outgoingCount = relations?.outgoing.length || 0
	const incomingCount = relations?.incoming.length || 0
	const bidirectionalCount =
		relations?.outgoing.filter((r) => r.isBidirectional).length || 0

	if (isLoading) {
		return (
			<div className="space-y-6">
				<Card>
					<CardContent className="text-center py-12 text-muted-foreground">
						Loading relations...
					</CardContent>
				</Card>
			</div>
		)
	}

	return (
		<div className="space-y-6">
			{/* Statistics Cards */}
			<RelationStatsCards
				totalRelations={totalRelations}
				outgoingCount={outgoingCount}
				incomingCount={incomingCount}
				bidirectionalCount={bidirectionalCount}
			/>

			{/* Header */}
			<div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
				<div>
					<h2 className="text-2xl font-bold">Character Relations</h2>
					<p className="text-muted-foreground">
						Manage {characterName}'s relationships
					</p>
				</div>
				{isOwner && (
					<Button onClick={() => setCreateDialogOpen(true)}>
						<Plus className="h-4 w-4 mr-2" />
						Add Relation
					</Button>
				)}
			</div>

			{/* Filters */}
			<Card>
				<CardHeader>
					<CardTitle className="text-base">Filter Relations</CardTitle>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="flex flex-col sm:flex-row gap-4">
						<div className="flex-1 relative">
							<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
							<Input
								placeholder="Search by character or relation type..."
								value={searchQuery}
								onChange={(e) => setSearchQuery(e.target.value)}
								className="pl-10"
							/>
						</div>
						<div className="w-full sm:w-[250px]">
							<Select
								value={filterRelationType}
								onValueChange={setFilterRelationType}
							>
								<SelectTrigger>
									<Filter className="h-4 w-4 mr-2" />
									<SelectValue placeholder="All types" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="all">All Types</SelectItem>
									{relationTypes?.map((type) => (
										<SelectItem key={type.id} value={type.id}>
											{type.name}
											<Badge variant="secondary" className="ml-2">
												{type._count.relations}
											</Badge>
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Relations List */}
			<div className="space-y-6">
				{/* Outgoing Relations */}
				{filteredOutgoing.length > 0 && (
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								Outgoing Relations
								<Badge variant="secondary">{filteredOutgoing.length}</Badge>
							</CardTitle>
						</CardHeader>
						<CardContent className="space-y-3">
							{filteredOutgoing.map((relation) => (
								<CharacterRelationCard
									key={relation.id}
									relationId={relation.id}
									character={relation.toCharacter}
									relationType={relation.relationType}
									isBidirectional={relation.isBidirectional}
									direction="outgoing"
									onEdit={isOwner ? handleEdit : undefined}
									onDelete={isOwner ? handleDelete : undefined}
								/>
							))}
						</CardContent>
					</Card>
				)}

				{/* Incoming Relations */}
				{filteredIncoming.length > 0 && (
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								Incoming Relations
								<Badge variant="secondary">{filteredIncoming.length}</Badge>
							</CardTitle>
						</CardHeader>
						<CardContent className="space-y-3">
							{filteredIncoming.map((relation) => (
								<CharacterRelationCard
									key={relation.id}
									relationId={relation.id}
									character={relation.fromCharacter}
									relationType={relation.relationType}
									isBidirectional={relation.isBidirectional}
									direction="incoming"
									onEdit={isOwner ? handleEdit : undefined}
									onDelete={isOwner ? handleDelete : undefined}
								/>
							))}
						</CardContent>
					</Card>
				)}

				{/* Empty State */}
				{filteredOutgoing.length === 0 && filteredIncoming.length === 0 && (
					<Card>
						<CardContent className="text-center py-12">
							<Network className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
							<h3 className="text-lg font-semibold mb-2">No relations found</h3>
							<p className="text-muted-foreground mb-4">
								{searchQuery || filterRelationType !== "all"
									? "Try adjusting your filters"
									: "Start building character relationships"}
							</p>
							{isOwner && !searchQuery && filterRelationType === "all" && (
								<Button onClick={() => setCreateDialogOpen(true)}>
									<Plus className="h-4 w-4 mr-2" />
									Create First Relation
								</Button>
							)}
						</CardContent>
					</Card>
				)}
			</div>

			{/* Dialogs */}
			{isOwner && (
				<>
					<CreateCharacterRelationDialog
						fromCharacterId={characterId}
						open={createDialogOpen}
						onOpenChange={setCreateDialogOpen}
					/>

					<EditCharacterRelationDialog
						relationId={editDialogState.relationId}
						characterId={characterId}
						open={editDialogState.open}
						onOpenChange={(open) =>
							setEditDialogState({ ...editDialogState, open })
						}
					/>

					<DeleteCharacterRelationDialog
						relationId={deleteDialogState.relationId}
						characterId={characterId}
						targetCharacterName={deleteDialogState.targetName}
						relationTypeName={deleteDialogState.typeName}
						open={deleteDialogState.open}
						onOpenChange={(open) =>
							setDeleteDialogState({ ...deleteDialogState, open })
						}
					/>
				</>
			)}
		</div>
	)
}
