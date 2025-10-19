"use client"

import { Plus } from "lucide-react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { CreateRelationTypeDialog } from "./create-relation-type-dialog"

interface RelationsPageClientProps {
	initialSearch?: string
}

export function RelationsPageClient({
	initialSearch = "",
}: RelationsPageClientProps) {
	const [createDialogOpen, setCreateDialogOpen] = useState(false)
	const [search, setSearch] = useState(initialSearch)

	const handleSearchChange = (value: string) => {
		setSearch(value)
		// Update URL params
		const params = new URLSearchParams(window.location.search)
		if (value) {
			params.set("search", value)
		} else {
			params.delete("search")
		}
		const newUrl = `${window.location.pathname}${params.toString() ? `?${params.toString()}` : ""}`
		window.history.replaceState({}, "", newUrl)
	}

	return (
		<>
			<div className="flex flex-col sm:flex-row gap-4 mb-6">
				<div className="flex-1">
					<Input
						type="search"
						placeholder="Search relation types..."
						value={search}
						onChange={(e) => handleSearchChange(e.target.value)}
						className="w-full"
					/>
				</div>
				<Button onClick={() => setCreateDialogOpen(true)}>
					<Plus className="h-4 w-4 mr-2" />
					Create Relation Type
				</Button>
			</div>

			<CreateRelationTypeDialog
				open={createDialogOpen}
				onOpenChange={setCreateDialogOpen}
			/>
		</>
	)
}
