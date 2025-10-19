"use client"

import { RelationTypeCard } from "./relation-type-card"
import { RelationTypeGrid } from "./relation-type-grid"

interface RelationType {
	id: string
	name: string
	description: string | null
	_count: {
		relations: number
	}
}

interface RelationTypesTabContentProps {
	relationTypes: RelationType[]
}

export function RelationTypesTabContent({
	relationTypes,
}: RelationTypesTabContentProps) {
	if (relationTypes.length === 0) {
		return (
			<div className="text-center py-12">
				<p className="text-muted-foreground">
					No relation types found. Create one to get started.
				</p>
			</div>
		)
	}

	return (
		<div className="space-y-8">
			<div>
				<h3 className="text-xl font-semibold mb-4">All Relation Types</h3>
				<RelationTypeGrid>
					{relationTypes.map((type) => (
						<RelationTypeCard key={type.id} relationType={type} />
					))}
				</RelationTypeGrid>
			</div>
		</div>
	)
}
