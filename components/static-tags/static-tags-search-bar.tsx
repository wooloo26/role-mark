"use client"

import { StaticTagDataType } from "@prisma/client"
import { Plus, Search } from "lucide-react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select"
import { CreateStaticTagDialog } from "./create-static-tag-dialog"

interface StaticTagsSearchBarProps {
	initialSearch: string
	initialDataType?: StaticTagDataType
	onSearch: (search: string) => void
	onDataTypeChange: (dataType: StaticTagDataType | "all") => void
}

export function StaticTagsSearchBar({
	initialSearch,
	initialDataType,
	onSearch,
	onDataTypeChange,
}: StaticTagsSearchBarProps) {
	const [search, setSearch] = useState(initialSearch)
	const [createDialogOpen, setCreateDialogOpen] = useState(false)

	return (
		<>
			<div className="flex flex-col sm:flex-row gap-4 mb-6">
				<div className="relative flex-1">
					<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
					<Input
						placeholder="Search static tags..."
						value={search}
						onChange={(e) => {
							setSearch(e.target.value)
							onSearch(e.target.value)
						}}
						className="pl-10"
					/>
				</div>
				<Select
					value={initialDataType || "all"}
					onValueChange={(value) =>
						onDataTypeChange(value as StaticTagDataType | "all")
					}
				>
					<SelectTrigger className="w-full sm:w-[180px]">
						<SelectValue placeholder="All Types" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="all">All Types</SelectItem>
						<SelectItem value={StaticTagDataType.STRING}>String</SelectItem>
						<SelectItem value={StaticTagDataType.NUMBER}>Number</SelectItem>
						<SelectItem value={StaticTagDataType.DATE}>Date</SelectItem>
						<SelectItem value={StaticTagDataType.BOOLEAN}>Boolean</SelectItem>
					</SelectContent>
				</Select>
				<Button onClick={() => setCreateDialogOpen(true)}>
					<Plus />
					New Attribute
				</Button>
			</div>

			<CreateStaticTagDialog
				open={createDialogOpen}
				onOpenChange={setCreateDialogOpen}
			/>
		</>
	)
}
