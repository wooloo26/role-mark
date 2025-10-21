"use client"

import { Plus } from "lucide-react"
import { useState } from "react"
import { trpc } from "@/client/trpc"
import { CharacterRelationCard } from "@/components/characters/character-relation-card"
import { CreateCharacterRelationDialog } from "@/components/characters/create-character-relation-dialog"
import { DeleteCharacterRelationDialog } from "@/components/characters/delete-character-relation-dialog"
import { EditCharacterRelationDialog } from "@/components/characters/edit-character-relation-dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface CharacterRelationsTabProps {
	characterId: string
	isOwner?: boolean
}

export function CharacterRelationsTab({
	characterId,
	isOwner = false,
}: CharacterRelationsTabProps) {
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

	// Fetch character relations
	const { data: relations, isLoading } = trpc.relation.getRelations.useQuery({
		characterId,
		includeIncoming: true,
		includeOutgoing: true,
	})

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

	if (isLoading) {
		return (
			<Card>
				<CardContent className="text-center py-8 text-muted-foreground">
					Loading relations...
				</CardContent>
			</Card>
		)
	}

	const hasOutgoing = relations?.outgoing && relations.outgoing.length > 0
	const hasIncoming = relations?.incoming && relations.incoming.length > 0
	const hasRelations = hasOutgoing || hasIncoming

	return (
		<div className="space-y-4">
			{/* Header with Create Button */}
			{isOwner && (
				<div className="flex justify-between items-center">
					<div>
						<h3 className="text-lg font-semibold">Character Relations</h3>
						<p className="text-sm text-muted-foreground">
							Manage relationships with other characters
						</p>
					</div>
					<Button onClick={() => setCreateDialogOpen(true)}>
						<Plus className="h-4 w-4 mr-2" />
						Add Relation
					</Button>
				</div>
			)}

			{/* Relations Display */}
			{!hasRelations ? (
				<Card>
					<CardContent className="text-center py-12 text-muted-foreground">
						<p>No relationships defined for this character</p>
						{isOwner && (
							<Button
								variant="outline"
								onClick={() => setCreateDialogOpen(true)}
								className="mt-4"
							>
								<Plus className="h-4 w-4 mr-2" />
								Create First Relation
							</Button>
						)}
					</CardContent>
				</Card>
			) : (
				<Tabs defaultValue="all" className="w-full">
					<TabsList className="grid w-full grid-cols-3">
						<TabsTrigger value="all">
							All (
							{(relations?.outgoing.length || 0) +
								(relations?.incoming.length || 0)}
							)
						</TabsTrigger>
						<TabsTrigger value="outgoing">
							Outgoing ({relations?.outgoing.length || 0})
						</TabsTrigger>
						<TabsTrigger value="incoming">
							Incoming ({relations?.incoming.length || 0})
						</TabsTrigger>
					</TabsList>

					<TabsContent value="all" className="mt-4">
						{hasOutgoing && (
							<div className="space-y-3">
								<h4 className="text-sm font-semibold text-muted-foreground">
									Outgoing Relations
								</h4>
								<div className="grid grid-cols-1 md:grid-cols-3 gap-3">
									{relations?.outgoing.map((relation) => (
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
								</div>
							</div>
						)}

						{hasOutgoing && hasIncoming && <Separator className="my-6" />}

						{hasIncoming && (
							<div className="space-y-3">
								<h4 className="text-sm font-semibold text-muted-foreground">
									Incoming Relations
								</h4>
								<div className="grid grid-cols-1 md:grid-cols-3 gap-3">
									{relations?.incoming.map((relation) => (
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
								</div>
							</div>
						)}
					</TabsContent>

					<TabsContent value="outgoing" className="mt-4">
						{hasOutgoing ? (
							<div className="grid grid-cols-1 md:grid-cols-3 gap-3">
								{relations?.outgoing.map((relation) => (
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
							</div>
						) : (
							<Card>
								<CardContent className="text-center py-8 text-muted-foreground">
									No outgoing relations
								</CardContent>
							</Card>
						)}
					</TabsContent>

					<TabsContent value="incoming" className="mt-4">
						{hasIncoming ? (
							<div className="grid grid-cols-1 md:grid-cols-3 gap-3">
								{relations?.incoming.map((relation) => (
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
							</div>
						) : (
							<Card>
								<CardContent className="text-center py-8 text-muted-foreground">
									No incoming relations
								</CardContent>
							</Card>
						)}
					</TabsContent>
				</Tabs>
			)}

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
