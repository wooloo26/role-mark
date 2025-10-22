"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { TagScope } from "@prisma/client"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { z } from "zod"
import { trpc } from "@/client/trpc"
import { Button } from "@/components/ui/button"
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog"
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
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"

const formSchema = z.object({
	name: z.string().min(1, "Name is required").max(100),
	slug: z
		.string()
		.min(1, "Slug is required")
		.max(100)
		.regex(
			/^[a-z0-9-]+$/,
			"Slug must contain only lowercase letters, numbers, and hyphens",
		),
	scope: z.nativeEnum(TagScope),
	groupId: z.string().optional(),
	pinned: z.boolean().optional(),
})

type FormValues = z.infer<typeof formSchema>

interface CreateTagDialogProps {
	open: boolean
	onOpenChange: (open: boolean) => void
	defaultScope?: TagScope
}

export function CreateTagDialog({
	open,
	onOpenChange,
	defaultScope = TagScope.CHARACTER,
}: CreateTagDialogProps) {
	const utils = trpc.useUtils()

	const form = useForm<FormValues>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			name: "",
			slug: "",
			scope: defaultScope,
			groupId: undefined,
			pinned: false,
		},
	})

	// Fetch tag groups for the selected scope
	const selectedScope = form.watch("scope")
	const { data: tagGroups } = trpc.tag.listGroups.useQuery({
		scope: selectedScope,
	})

	const createMutation = trpc.tag.create.useMutation({
		onSuccess: () => {
			utils.tag.getGroupedTags.invalidate()
			utils.tag.search.invalidate()
			form.reset()
			onOpenChange(false)
			toast.success("Tag created successfully")
		},
		onError: (error) => {
			toast.error(error.message || "Failed to create tag")
		},
	})

	const onSubmit = (values: FormValues) => {
		createMutation.mutate(values)
	}

	// Auto-generate slug from name
	const handleNameChange = (name: string) => {
		form.setValue("name", name)
		if (!form.formState.dirtyFields.slug) {
			const slug = name
				.toLowerCase()
				.replace(/[^a-z0-9\s-]/g, "")
				.replace(/\s+/g, "-")
				.replace(/-+/g, "-")
				.trim()
			form.setValue("slug", slug)
		}
	}

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-[500px]">
				<DialogHeader>
					<DialogTitle>Create New Tag</DialogTitle>
					<DialogDescription>
						Add a new tag to organize your content. Tags can be grouped for
						better organization.
					</DialogDescription>
				</DialogHeader>

				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
						<FormField
							control={form.control}
							name="name"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Name</FormLabel>
									<FormControl>
										<Input
											placeholder="e.g., Fantasy Character"
											{...field}
											onChange={(e) => handleNameChange(e.target.value)}
										/>
									</FormControl>
									<FormDescription>
										The display name for this tag
									</FormDescription>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="slug"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Slug</FormLabel>
									<FormControl>
										<Input placeholder="e.g., fantasy-character" {...field} />
									</FormControl>
									<FormDescription>
										URL-friendly identifier (lowercase, numbers, hyphens only)
									</FormDescription>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="scope"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Scope</FormLabel>
									<Select
										onValueChange={field.onChange}
										defaultValue={field.value}
									>
										<FormControl>
											<SelectTrigger>
												<SelectValue placeholder="Select scope" />
											</SelectTrigger>
										</FormControl>
										<SelectContent>
											<SelectItem value={TagScope.CHARACTER}>
												Character
											</SelectItem>
											<SelectItem value={TagScope.RESOURCE}>
												Resource
											</SelectItem>
										</SelectContent>
									</Select>
									<FormDescription>Where this tag can be used</FormDescription>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="groupId"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Tag Group (Optional)</FormLabel>
									<Select
										onValueChange={field.onChange}
										defaultValue={field.value}
									>
										<FormControl>
											<SelectTrigger>
												<SelectValue placeholder="No group (ungrouped)" />
											</SelectTrigger>
										</FormControl>
										<SelectContent>
											<SelectItem value="none">No group</SelectItem>
											{tagGroups?.map((group) => (
												<SelectItem key={group.id} value={group.id}>
													{group.name}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
									<FormDescription>
										Optionally organize this tag into a group
									</FormDescription>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="pinned"
							render={({ field }) => (
								<FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
									<div className="space-y-0.5">
										<FormLabel>Pinned</FormLabel>
										<FormDescription>
											Pin this tag to show it at the top of lists
										</FormDescription>
									</div>
									<FormControl>
										<Switch
											checked={field.value}
											onCheckedChange={field.onChange}
										/>
									</FormControl>
								</FormItem>
							)}
						/>

						<DialogFooter>
							<Button
								type="button"
								variant="outline"
								onClick={() => onOpenChange(false)}
							>
								Cancel
							</Button>
							<Button type="submit" disabled={createMutation.isPending}>
								{createMutation.isPending ? "Creating..." : "Create Tag"}
							</Button>
						</DialogFooter>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	)
}
