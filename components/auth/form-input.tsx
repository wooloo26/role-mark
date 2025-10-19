import type { LucideIcon } from "lucide-react"
import React from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface FormInputProps {
	label: string
	icon: LucideIcon
	type: string
	placeholder: string
	value: string
	onChange: (value: string) => void
	required?: boolean
	disabled?: boolean
	helperText?: string
}

export function FormInput({
	label,
	icon: Icon,
	type,
	placeholder,
	value,
	onChange,
	required = false,
	disabled = false,
	helperText,
}: FormInputProps) {
	const inputId = React.useId()

	return (
		<div className="space-y-2">
			<Label htmlFor={inputId} className="text-sm font-medium">
				{label}
			</Label>
			<div className="relative">
				<Icon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
				<Input
					id={inputId}
					type={type}
					placeholder={placeholder}
					value={value}
					onChange={(e) => onChange(e.target.value)}
					required={required}
					disabled={disabled}
					className="pl-10 h-11"
				/>
			</div>
			{helperText && (
				<p className="text-xs text-muted-foreground">{helperText}</p>
			)}
		</div>
	)
}
