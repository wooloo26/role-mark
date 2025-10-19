"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
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
import { trpc } from "@/lib/trpc/client"

const formSchema = z.object({
	name: z.string().min(1, "Name is required").max(100).optional(),
	slug: z
		.string()
		.min(1, "Slug is required")
		.max(100)
		.regex(
			/^[a-z0-9-]+$/,
			"Slug must contain only lowercase letters, numbers, and hyphens",
		)
		.optional(),
	groupId: z.string().nullable().optional(),
})

type FormValues = z.infer<typeof formSchema>

interface EditTagDialogProps {
	tagId: string
	open: boolean
	onOpenChange: (open: boolean) => void
}

export function EditTagDialog({
	tagId,
	open,
	onOpenChange,
}: EditTagDialogProps) {
	const utils = trpc.useUtils()

	// Fetch the tag data
	const { data: tag, isLoading } = trpc.tag.getById.useQuery(
		{ id: tagId },
		{ enabled: open },
	)

	// Fetch tag groups for the same scope
	const { data: tagGroups } = trpc.tag.listGroups.useQuery(
		{ scope: tag?.scope },
		{ enabled: !!tag },
	)

	const form = useForm<FormValues>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			name: "",
			slug: "",
			groupId: null,
		},
	})

	// Update form when tag data is loaded
	useEffect(() => {
		if (tag) {
			form.reset({
				name: tag.name,
				slug: tag.slug,
				groupId: tag.groupId,
			})
		}
	}, [tag, form])

	const updateMutation = trpc.tag.update.useMutation({
		onSuccess: () => {
			utils.tag.getGroupedTags.invalidate()
			utils.tag.search.invalidate()
			utils.tag.getById.invalidate({ id: tagId })
			onOpenChange(false)
		},
	})

	const onSubmit = (values: FormValues) => {
		updateMutation.mutate({
			id: tagId,
			...values,
		})
	}

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-[500px]">
				<DialogHeader>
					<DialogTitle>Edit Tag</DialogTitle>
					<DialogDescription>
						Update the tag details. The scope cannot be changed after creation.
					</DialogDescription>
				</DialogHeader>

				{isLoading ? (
					<div className="py-8 text-center text-muted-foreground">
						Loading...
					</div>
				) : (
					<Form {...form}>
						<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
							<FormField
								control={form.control}
								name="name"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Name</FormLabel>
										<FormControl>
											<Input placeholder="e.g., Fantasy Character" {...field} />
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
								name="groupId"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Tag Group (Optional)</FormLabel>
										<Select
											onValueChange={(value) =>
												field.onChange(value === "none" ? null : value)
											}
											value={field.value || "none"}
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

							<div className="bg-muted p-3 rounded-md">
								<p className="text-sm text-muted-foreground">
									<strong>Scope:</strong> {tag?.scope}
								</p>
								<p className="text-xs text-muted-foreground mt-1">
									The scope cannot be changed after creation
								</p>
							</div>

							<DialogFooter>
								<Button
									type="button"
									variant="outline"
									onClick={() => onOpenChange(false)}
								>
									Cancel
								</Button>
								<Button type="submit" disabled={updateMutation.isPending}>
									{updateMutation.isPending ? "Saving..." : "Save Changes"}
								</Button>
							</DialogFooter>
						</form>
					</Form>
				)}
			</DialogContent>
		</Dialog>
	)
}
