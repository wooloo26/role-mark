import type { Control } from "react-hook-form"
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card"
import {
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import type { CharacterFormValues } from "./form-schemas"

interface CharacterBasicInfoFormProps {
	control: Control<CharacterFormValues>
}

export function CharacterBasicInfoForm({
	control,
}: CharacterBasicInfoFormProps) {
	return (
		<Card>
			<CardHeader>
				<CardTitle>Basic Information</CardTitle>
				<CardDescription>Essential details about the character</CardDescription>
			</CardHeader>
			<CardContent className="space-y-4">
				<FormField
					control={control}
					name="name"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Name *</FormLabel>
							<FormControl>
								<Input placeholder="Character name" {...field} />
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				<FormField
					control={control}
					name="info"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Description</FormLabel>
							<FormControl>
								<Textarea
									placeholder="Brief description of the character..."
									className="min-h-[120px]"
									{...field}
								/>
							</FormControl>
							<FormDescription>
								Markdown formatting is supported
							</FormDescription>
							<FormMessage />
						</FormItem>
					)}
				/>
			</CardContent>
		</Card>
	)
}
