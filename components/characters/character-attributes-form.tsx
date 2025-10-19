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
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import type { CharacterFormValues } from "./form-schemas"

interface CharacterAttributesFormProps {
	control: Control<CharacterFormValues>
}

export function CharacterAttributesForm({
	control,
}: CharacterAttributesFormProps) {
	return (
		<Card>
			<CardHeader>
				<CardTitle>Attributes</CardTitle>
				<CardDescription>Static character attributes</CardDescription>
			</CardHeader>
			<CardContent className="space-y-4">
				<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
					<FormField
						control={control}
						name="height"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Height (cm)</FormLabel>
								<FormControl>
									<Input type="number" placeholder="170" {...field} />
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>

					<FormField
						control={control}
						name="weight"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Weight (kg)</FormLabel>
								<FormControl>
									<Input type="number" placeholder="65" {...field} />
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
				</div>

				<FormField
					control={control}
					name="birthday"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Birthday</FormLabel>
							<FormControl>
								<Input type="date" {...field} />
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
			</CardContent>
		</Card>
	)
}
