"use client"

import { TagSelector } from "@/components/tag-selector"
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card"

interface ResourceTagsFormProps {
	selectedTags: string[]
	onTagsChange: (tagIds: string[]) => void
	selectedCharacters: string[]
	onCharactersChange: (characterIds: string[]) => void
}

export function ResourceTagsForm({
	selectedTags,
	onTagsChange,
}: ResourceTagsFormProps) {
	return (
		<Card>
			<CardHeader>
				<CardTitle>Tags & Categories</CardTitle>
				<CardDescription>Organize and categorize this resource</CardDescription>
			</CardHeader>
			<CardContent>
				<div className="space-y-2">
					<p className="text-sm font-medium">Tags</p>
					<TagSelector
						selectedTags={selectedTags}
						onTagsChange={onTagsChange}
						scope="RESOURCE"
						placeholder="Search and select tags..."
					/>
				</div>
			</CardContent>
		</Card>
	)
}
