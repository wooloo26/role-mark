"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card"
import {
	Form,
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { trpc } from "@/lib/trpc/client"

const characterSchema = z.object({
	name: z.string().min(1, "Name is required").max(100),
	info: z.string().max(500).optional(),
	avatarUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
	dynamicTags: z.string().optional(),
})

type CharacterFormData = z.infer<typeof characterSchema>

export default function NewCharacterPage() {
	const router = useRouter()
	const utils = trpc.useUtils()

	const form = useForm<CharacterFormData>({
		resolver: zodResolver(characterSchema),
		defaultValues: {
			name: "",
			info: "",
			avatarUrl: "",
			dynamicTags: "",
		},
	})

	const createCharacter = trpc.character.create.useMutation({
		onSuccess: (data) => {
			utils.character.search.invalidate()
			router.push(`/characters/${data.id}`)
		},
	})

	const onSubmit = (data: CharacterFormData) => {
		const tags = data.dynamicTags
			? data.dynamicTags
					.split(",")
					.map((tag) => tag.trim())
					.filter(Boolean)
			: []

		createCharacter.mutate({
			name: data.name,
			info: data.info || undefined,
			avatarUrl: data.avatarUrl || undefined,
			dynamicTags: tags.length > 0 ? tags : undefined,
		})
	}

	return (
		<div className="container max-w-2xl py-8 mx-auto">
			<Card>
				<CardHeader>
					<CardTitle>Create New Character</CardTitle>
					<CardDescription>
						Add a new character to your database
					</CardDescription>
				</CardHeader>
				<CardContent>
					<Form {...form}>
						<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
							<FormField
								control={form.control}
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
								control={form.control}
								name="info"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Description</FormLabel>
										<FormControl>
											<Textarea
												placeholder="Brief description of the character..."
												className="resize-none"
												rows={4}
												{...field}
											/>
										</FormControl>
										<FormDescription>
											Optional character description (max 500 characters)
										</FormDescription>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="avatarUrl"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Avatar URL</FormLabel>
										<FormControl>
											<Input
												type="url"
												placeholder="https://example.com/avatar.jpg"
												{...field}
											/>
										</FormControl>
										<FormDescription>
											Optional URL to an image for the character
										</FormDescription>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="dynamicTags"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Tags</FormLabel>
										<FormControl>
											<Input placeholder="tag1, tag2, tag3" {...field} />
										</FormControl>
										<FormDescription>
											Optional comma-separated tags
										</FormDescription>
										<FormMessage />
									</FormItem>
								)}
							/>

							<div className="flex gap-4">
								<Button
									type="submit"
									disabled={createCharacter.isPending}
									className="flex-1"
								>
									{createCharacter.isPending ? (
										<>
											<Loader2 className="mr-2 h-4 w-4 animate-spin" />
											Creating...
										</>
									) : (
										"Create Character"
									)}
								</Button>
								<Button
									type="button"
									variant="outline"
									onClick={() => router.back()}
									disabled={createCharacter.isPending}
								>
									Cancel
								</Button>
							</div>

							{createCharacter.error && (
								<p className="text-sm text-destructive">
									{createCharacter.error.message}
								</p>
							)}
						</form>
					</Form>
				</CardContent>
			</Card>
		</div>
	)
}
