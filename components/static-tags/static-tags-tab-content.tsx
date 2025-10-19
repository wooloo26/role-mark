"use client"

import type { StaticTagDataType } from "@prisma/client"
import { StaticTagCard } from "./static-tag-card"
import { StaticTagGrid } from "./static-tag-grid"

interface StaticTag {
	id: string
	name: string
	displayName: string
	dataType: StaticTagDataType
	unit?: string | null
	description?: string | null
	isRequired: boolean
	_count: {
		characterStaticTags: number
	}
}

interface StaticTagsTabContentProps {
	staticTags: StaticTag[]
	groupedByDataType: Record<StaticTagDataType, StaticTag[]>
}

export function StaticTagsTabContent({
	staticTags,
	groupedByDataType,
}: StaticTagsTabContentProps) {
	if (staticTags.length === 0) {
		return (
			<div className="text-center py-12">
				<p className="text-muted-foreground">
					No static tag definitions found. Create one to get started.
				</p>
			</div>
		)
	}

	return (
		<div className="space-y-8">
			{/* All Tags Grid */}
			<div>
				<h3 className="text-xl font-semibold mb-4">All Attributes</h3>
				<StaticTagGrid>
					{staticTags.map((tag) => (
						<StaticTagCard key={tag.id} tag={tag} />
					))}
				</StaticTagGrid>
			</div>

			{/* Grouped by Data Type */}
			{Object.entries(groupedByDataType).map(([dataType, tags]) => {
				if (tags.length === 0) return null
				return (
					<div key={dataType}>
						<h3 className="text-xl font-semibold mb-4 capitalize">
							{dataType} Attributes
						</h3>
						<StaticTagGrid>
							{tags.map((tag) => (
								<StaticTagCard key={tag.id} tag={tag} />
							))}
						</StaticTagGrid>
					</div>
				)
			})}
		</div>
	)
}
