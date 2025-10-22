"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useEffect } from "react"
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
import { Switch } from "@/components/ui/switch"

const formSchema = z.object({
	name: z.string().min(1, "Name is required").max(100).optional(),
	pinned: z.boolean().optional(),
})

type FormValues = z.infer<typeof formSchema>

interface EditTagGroupDialogProps {
	groupId: string
	open: boolean
	onOpenChange: (open: boolean) => void
}

export function EditTagGroupDialog({
	groupId,
	open,
	onOpenChange,
}: EditTagGroupDialogProps) {
	const utils = trpc.useUtils()

	// Fetch the tag group data
	const { data: group, isLoading } = trpc.tag.getGroupById.useQuery(
		{ id: groupId },
		{ enabled: open },
	)

	const form = useForm<FormValues>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			name: "",
			pinned: false,
		},
	})

	// Update form when group data is loaded
	useEffect(() => {
		if (group) {
			form.reset({
				name: group.name,
				pinned: group.pinned,
			})
		}
	}, [group, form])

	const updateMutation = trpc.tag.updateGroup.useMutation({
		onSuccess: () => {
			utils.tag.listGroups.invalidate()
			utils.tag.getGroupedTags.invalidate()
			utils.tag.getGroupById.invalidate({ id: groupId })
			onOpenChange(false)
			toast.success("Tag group updated successfully")
		},
		onError: (error) => {
			toast.error(error.message || "Failed to update tag group")
		},
	})

	const onSubmit = (values: FormValues) => {
		updateMutation.mutate({
			id: groupId,
			...values,
		})
	}

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-[500px]">
				<DialogHeader>
					<DialogTitle>Edit Tag Group</DialogTitle>
					<DialogDescription>
						Update the tag group details. The scope cannot be changed after
						creation.
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
											<Input placeholder="e.g., Character Types" {...field} />
										</FormControl>
										<FormDescription>
											The display name for this tag group
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
												Pin this tag group to show it at the top of lists
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

							<div className="bg-muted p-3 rounded-md">
								<p className="text-sm text-muted-foreground">
									<strong>Scope:</strong> {group?.scope}
								</p>
								<p className="text-xs text-muted-foreground mt-1">
									The scope cannot be changed after creation
								</p>
								{group && group.tags.length > 0 && (
									<p className="text-xs text-muted-foreground mt-1">
										Contains {group.tags.length} tag(s)
									</p>
								)}
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
