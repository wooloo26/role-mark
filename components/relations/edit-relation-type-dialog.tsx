"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useEffect } from "react"
import { useForm } from "react-hook-form"
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
import { Textarea } from "@/components/ui/textarea"

const formSchema = z.object({
	name: z.string().min(1, "Name is required").max(100),
	description: z.string().max(500).nullable().optional().or(z.literal("")),
})

type FormValues = z.infer<typeof formSchema>

interface EditRelationTypeDialogProps {
	relationType: {
		id: string
		name: string
		description: string | null
	}
	open: boolean
	onOpenChange: (open: boolean) => void
}

export function EditRelationTypeDialog({
	relationType,
	open,
	onOpenChange,
}: EditRelationTypeDialogProps) {
	const utils = trpc.useUtils()

	const form = useForm<FormValues>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			name: relationType.name,
			description: relationType.description || "",
		},
	})

	// Update form values when relationType changes
	useEffect(() => {
		form.reset({
			name: relationType.name,
			description: relationType.description || "",
		})
	}, [relationType, form])

	const updateMutation = trpc.relation.updateType.useMutation({
		onSuccess: () => {
			utils.relation.getAllTypes.invalidate()
			onOpenChange(false)
		},
		onError: (error) => {
			if (error.message.includes("already exists")) {
				form.setError("name", {
					message: "A relation type with this name already exists",
				})
			}
		},
	})

	const onSubmit = (values: FormValues) => {
		updateMutation.mutate({
			id: relationType.id,
			...values,
		})
	}

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-[500px]">
				<DialogHeader>
					<DialogTitle>Edit Relation Type</DialogTitle>
					<DialogDescription>
						Update the details of this relation type.
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
											placeholder="e.g., friends, rivals, siblings"
											{...field}
										/>
									</FormControl>
									<FormDescription>
										A unique identifier for this relation type (lowercase).
									</FormDescription>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="description"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Description (Optional)</FormLabel>
									<FormControl>
										<Textarea
											placeholder="Describe this type of relationship..."
											rows={3}
											{...field}
											value={field.value || ""}
										/>
									</FormControl>
									<FormDescription>
										A brief explanation of what this relation type represents.
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
								disabled={updateMutation.isPending}
							>
								Cancel
							</Button>
							<Button type="submit" disabled={updateMutation.isPending}>
								{updateMutation.isPending ? "Saving..." : "Save Changes"}
							</Button>
						</DialogFooter>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	)
}
