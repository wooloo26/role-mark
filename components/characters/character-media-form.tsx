import type { Control } from "react-hook-form"
import { ImageUploadWithCrop } from "@/components/image-upload-with-crop"
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
import type { CharacterFormValues } from "./form-schemas"

interface CharacterMediaFormProps {
	control: Control<CharacterFormValues>
}

export function CharacterMediaForm({ control }: CharacterMediaFormProps) {
	return (
		<Card>
			<CardHeader>
				<CardTitle>Media</CardTitle>
				<CardDescription>Character images and avatars</CardDescription>
			</CardHeader>
			<CardContent className="space-y-4">
				<FormField
					control={control}
					name="avatarUrl"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Avatar</FormLabel>
							<FormControl>
								<ImageUploadWithCrop
									value={field.value}
									onChange={field.onChange}
									aspectRatio={1}
									previewClassName="w-24 h-24"
									label="Upload Avatar"
								/>
							</FormControl>
							<FormDescription>Square image recommended</FormDescription>
							<FormMessage />
						</FormItem>
					)}
				/>

				<FormField
					control={control}
					name="portraitUrl"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Portrait</FormLabel>
							<FormControl>
								<ImageUploadWithCrop
									value={field.value}
									onChange={field.onChange}
									previewClassName="w-32 h-40"
									label="Upload Portrait"
								/>
							</FormControl>
							<FormDescription>
								Full body or portrait image (3:4 ratio recommended)
							</FormDescription>
							<FormMessage />
						</FormItem>
					)}
				/>
			</CardContent>
		</Card>
	)
}
