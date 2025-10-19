"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { TagScope } from "@prisma/client"
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
	name: z.string().min(1, "Name is required").max(100),
	scope: z.nativeEnum(TagScope),
})

type FormValues = z.infer<typeof formSchema>

interface CreateTagGroupDialogProps {
	open: boolean
	onOpenChange: (open: boolean) => void
	defaultScope?: TagScope
}

export function CreateTagGroupDialog({
	open,
	onOpenChange,
	defaultScope = TagScope.CHARACTER,
}: CreateTagGroupDialogProps) {
	const utils = trpc.useUtils()

	const form = useForm<FormValues>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			name: "",
			scope: defaultScope,
		},
	})

	const createMutation = trpc.tag.createGroup.useMutation({
		onSuccess: () => {
			utils.tag.listGroups.invalidate()
			utils.tag.getGroupedTags.invalidate()
			form.reset()
			onOpenChange(false)
		},
	})

	const onSubmit = (values: FormValues) => {
		createMutation.mutate(values)
	}

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-[500px]">
				<DialogHeader>
					<DialogTitle>Create New Tag Group</DialogTitle>
					<DialogDescription>
						Create a group to organize related tags together.
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
									<FormDescription>
										Where tags in this group can be used
									</FormDescription>
									<FormMessage />
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
								{createMutation.isPending ? "Creating..." : "Create Group"}
							</Button>
						</DialogFooter>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	)
}
