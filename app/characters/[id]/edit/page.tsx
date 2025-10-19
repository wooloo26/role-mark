"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { ArrowLeft, Save } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { use, useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { ImageUploadWithCrop } from "@/components/image-upload-with-crop"
import { TagSelector } from "@/components/tag-selector"
import { AnimatedGradientText } from "@/components/ui/animated-gradient-text"
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
import { cn } from "@/lib/utils"

const characterFormSchema = z.object({
	name: z.string().min(1, "Name is required").max(255),
	avatarUrl: z.url().optional().or(z.literal("")),
	portraitUrl: z.url().optional().or(z.literal("")),
	info: z.string().optional(),
	height: z.string().optional(),
	weight: z.string().optional(),
	birthday: z.string().optional(),
})

type CharacterFormValues = z.infer<typeof characterFormSchema>

interface CharacterEditPageProps {
	params: Promise<{ id: string }>
}

export default function CharacterEditPage({ params }: CharacterEditPageProps) {
	const { id } = use(params)
	const router = useRouter()
	const [selectedTags, setSelectedTags] = useState<string[]>([])

	const { data: character, isLoading } = trpc.character.getById.useQuery({ id })

	const form = useForm<CharacterFormValues>({
		resolver: zodResolver(characterFormSchema),
		defaultValues: {
			name: "",
			avatarUrl: "",
			portraitUrl: "",
			info: "",
			height: "",
			weight: "",
			birthday: "",
		},
	})

	// Populate form when data loads
	useEffect(() => {
		if (character) {
			const staticTagsMap = new Map(
				character.staticTags?.map((st) => [st.tagDefinition.name, st.value]) ||
					[],
			)

			form.reset({
				name: character.name,
				avatarUrl: character.avatarUrl || "",
				portraitUrl: character.portraitUrl || "",
				info: character.info || "",
				height: staticTagsMap.get("height") || "",
				weight: staticTagsMap.get("weight") || "",
				birthday: staticTagsMap.get("birthday")
					? new Date(staticTagsMap.get("birthday")!).toISOString().split("T")[0]
					: "",
			})

			setSelectedTags(character.tags?.map((ct) => ct.tag.id) || [])
		}
	}, [character, form])

	const updateMutation = trpc.character.update.useMutation({
		onSuccess: (data) => {
			router.push(`/characters/${data.id}`)
		},
	})

	const onSubmit = (values: CharacterFormValues) => {
		const staticTags: {
			height?: number
			weight?: number
			birthday?: string | Date
		} = {}

		if (values.height) {
			staticTags.height = Number.parseFloat(values.height)
		}
		if (values.weight) {
			staticTags.weight = Number.parseFloat(values.weight)
		}
		if (values.birthday) {
			staticTags.birthday = values.birthday
		}

		updateMutation.mutate({
			id,
			name: values.name,
			avatarUrl: values.avatarUrl || undefined,
			portraitUrl: values.portraitUrl || undefined,
			info: values.info || undefined,
			staticTags: Object.keys(staticTags).length > 0 ? staticTags : undefined,
			tagIds: selectedTags,
		})
	}

	if (isLoading) {
		return (
			<div className="container mx-auto px-4 py-8 max-w-4xl">
				<div className="animate-pulse space-y-8">
					<div className="h-8 bg-muted rounded w-48" />
					<div className="space-y-4">
						<div className="h-64 bg-muted rounded" />
						<div className="h-64 bg-muted rounded" />
					</div>
				</div>
			</div>
		)
	}

	if (!character) {
		return (
			<div className="container mx-auto px-4 py-16 text-center">
				<h1 className="text-2xl font-bold mb-4">Character not found</h1>
				<Button asChild>
					<Link href="/characters">
						<ArrowLeft className="h-4 w-4 mr-2" />
						Back to Characters
					</Link>
				</Button>
			</div>
		)
	}

	return (
		<div className="container mx-auto px-4 py-8 max-w-4xl">
			{/* Header */}
			<div className="mb-8">
				<Button variant="ghost" asChild className="mb-4">
					<Link href={`/characters/${id}`}>
						<ArrowLeft className="h-4 w-4 mr-2" />
						Back to Character
					</Link>
				</Button>

				<div className="text-center space-y-4">
					<AnimatedGradientText className="inline-flex items-center gap-2">
						<span
							className={cn(
								"inline animate-gradient bg-gradient-to-r from-[#ffaa40] via-[#9c40ff] to-[#ffaa40] bg-[length:var(--bg-size)_100%] bg-clip-text text-transparent",
							)}
						>
							Edit Character
						</span>
					</AnimatedGradientText>
					<h1 className="text-3xl font-bold">Edit {character.name}</h1>
					<p className="text-muted-foreground">
						Update the character details below
					</p>
				</div>
			</div>

			{/* Form */}
			<Form {...form}>
				<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
					{/* Basic Information */}
					<Card>
						<CardHeader>
							<CardTitle>Basic Information</CardTitle>
							<CardDescription>
								Essential details about the character
							</CardDescription>
						</CardHeader>
						<CardContent className="space-y-4">
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

					{/* Media */}
					<Card>
						<CardHeader>
							<CardTitle>Media</CardTitle>
							<CardDescription>Character images and avatars</CardDescription>
						</CardHeader>
						<CardContent className="space-y-4">
							<FormField
								control={form.control}
								name="avatarUrl"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Avatar</FormLabel>
										<FormControl>
											<ImageUploadWithCrop
												value={field.value}
												onChange={field.onChange}
												aspectRatio={1}
												cropShape="round"
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
								control={form.control}
								name="portraitUrl"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Portrait</FormLabel>
										<FormControl>
											<ImageUploadWithCrop
												value={field.value}
												onChange={field.onChange}
												aspectRatio={3 / 4}
												cropShape="rect"
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

					{/* Static Attributes */}
					<Card>
						<CardHeader>
							<CardTitle>Attributes</CardTitle>
							<CardDescription>Static character attributes</CardDescription>
						</CardHeader>
						<CardContent className="space-y-4">
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<FormField
									control={form.control}
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
									control={form.control}
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
								control={form.control}
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

					{/* Tags */}
					<Card>
						<CardHeader>
							<CardTitle>Tags</CardTitle>
							<CardDescription>
								Categorize the character with tags for better organization
							</CardDescription>
						</CardHeader>
						<CardContent>
							<TagSelector
								scope="CHARACTER"
								selectedTags={selectedTags}
								onTagsChange={setSelectedTags}
								placeholder="Select tags for this character..."
							/>
						</CardContent>
					</Card>

					{/* Submit */}
					<div className="flex gap-4 justify-end">
						<Button
							type="button"
							variant="outline"
							onClick={() => router.back()}
						>
							Cancel
						</Button>
						<Button
							type="submit"
							disabled={updateMutation.isPending}
							className="gap-2"
						>
							{updateMutation.isPending ? (
								"Saving..."
							) : (
								<>
									<Save className="h-4 w-4" />
									Save Changes
								</>
							)}
						</Button>
					</div>

					{updateMutation.error && (
						<Card className="border-destructive">
							<CardContent className="pt-6">
								<p className="text-sm text-destructive">
									Error: {updateMutation.error.message}
								</p>
							</CardContent>
						</Card>
					)}
				</form>
			</Form>
		</div>
	)
}
