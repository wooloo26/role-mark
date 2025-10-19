import { Search } from "lucide-react"
import type { ReactNode } from "react"
import { Input } from "@/components/ui/input"

interface SearchBarProps {
	value: string
	onChange: (value: string) => void
	placeholder?: string
	actions?: ReactNode
}

export function SearchBar({
	value,
	onChange,
	placeholder = "Search...",
	actions,
}: SearchBarProps) {
	return (
		<div className="flex flex-col sm:flex-row gap-4">
			<div className="relative flex-1">
				<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
				<Input
					placeholder={placeholder}
					value={value}
					onChange={(e) => onChange(e.target.value)}
					className="pl-10"
				/>
			</div>
			{actions}
		</div>
	)
}
