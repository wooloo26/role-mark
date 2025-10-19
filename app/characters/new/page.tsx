"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { ArrowLeft, Plus, Upload, X } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { AnimatedGradientText } from "@/components/ui/animated-gradient-text"
import { Badge } from "@/components/ui/badge"
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

export default function NewCharacterPage() {
	const router = useRouter()
	const [selectedTags, setSelectedTags] = useState<string[]>([])
	const [newTag, setNewTag] = useState("")

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

	const createMutation = trpc.character.create.useMutation({
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

		createMutation.mutate({
			name: values.name,
			avatarUrl: values.avatarUrl || undefined,
			portraitUrl: values.portraitUrl || undefined,
			info: values.info || undefined,
			staticTags: Object.keys(staticTags).length > 0 ? staticTags : undefined,
			tagIds: selectedTags,
		})
	}

	const handleAddTag = () => {
		if (newTag && !selectedTags.includes(newTag)) {
			setSelectedTags([...selectedTags, newTag])
			setNewTag("")
		}
	}

	const handleRemoveTag = (tag: string) => {
		setSelectedTags(selectedTags.filter((t) => t !== tag))
	}

	return (
		<div className="container mx-auto px-4 py-8 max-w-4xl">
			{/* Header */}
			<div className="mb-8">
				<Button variant="ghost" asChild className="mb-4">
					<Link href="/characters">
						<ArrowLeft className="h-4 w-4 mr-2" />
						Back to Characters
					</Link>
				</Button>

				<div className="text-center space-y-4">
					<AnimatedGradientText className="inline-flex items-center gap-2">
						<Plus className="h-4 w-4" />
						<hr className="mx-2 h-4 w-[1px] shrink-0 bg-gray-300" />
						<span
							className={cn(
								"inline animate-gradient bg-gradient-to-r from-[#ffaa40] via-[#9c40ff] to-[#ffaa40] bg-[length:var(--bg-size)_100%] bg-clip-text text-transparent",
							)}
						>
							New Character
						</span>
					</AnimatedGradientText>
					<h1 className="text-3xl font-bold">Create Character</h1>
					<p className="text-muted-foreground">
						Fill in the details below to create a new character
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
										<FormLabel>Avatar URL</FormLabel>
										<FormControl>
											<div className="flex gap-2">
												<Input
													placeholder="https://example.com/avatar.jpg"
													{...field}
												/>
												<Button type="button" variant="outline" size="icon">
													<Upload className="h-4 w-4" />
												</Button>
											</div>
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
										<FormLabel>Portrait URL</FormLabel>
										<FormControl>
											<div className="flex gap-2">
												<Input
													placeholder="https://example.com/portrait.jpg"
													{...field}
												/>
												<Button type="button" variant="outline" size="icon">
													<Upload className="h-4 w-4" />
												</Button>
											</div>
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
								Categorize the character with tags
							</CardDescription>
						</CardHeader>
						<CardContent className="space-y-4">
							<div className="flex gap-2">
								<Input
									placeholder="Add a tag..."
									value={newTag}
									onChange={(e) => setNewTag(e.target.value)}
									onKeyDown={(e) => {
										if (e.key === "Enter") {
											e.preventDefault()
											handleAddTag()
										}
									}}
								/>
								<Button type="button" variant="outline" onClick={handleAddTag}>
									<Plus className="h-4 w-4 mr-2" />
									Add
								</Button>
							</div>

							{selectedTags.length > 0 && (
								<div className="flex flex-wrap gap-2">
									{selectedTags.map((tag) => (
										<Badge key={tag} variant="secondary" className="gap-1">
											{tag}
											<button
												type="button"
												onClick={() => handleRemoveTag(tag)}
												className="ml-1 hover:text-destructive"
											>
												<X className="h-3 w-3" />
											</button>
										</Badge>
									))}
								</div>
							)}
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
							disabled={createMutation.isPending}
							className="gap-2"
						>
							{createMutation.isPending ? (
								"Creating..."
							) : (
								<>
									<Plus className="h-4 w-4" />
									Create Character
								</>
							)}
						</Button>
					</div>

					{createMutation.error && (
						<Card className="border-destructive">
							<CardContent className="pt-6">
								<p className="text-sm text-destructive">
									Error: {createMutation.error.message}
								</p>
							</CardContent>
						</Card>
					)}
				</form>
			</Form>
		</div>
	)
}
