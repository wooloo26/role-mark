"use client"

import { zodResolver } from "@hookform/resolvers/zod"
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
import { Textarea } from "@/components/ui/textarea"

const formSchema = z.object({
	name: z.string().min(1, "Name is required").max(100),
	description: z.string().max(500).optional().or(z.literal("")),
})

type FormValues = z.infer<typeof formSchema>

interface CreateRelationTypeDialogProps {
	open: boolean
	onOpenChange: (open: boolean) => void
}

export function CreateRelationTypeDialog({
	open,
	onOpenChange,
}: CreateRelationTypeDialogProps) {
	const utils = trpc.useUtils()

	const form = useForm<FormValues>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			name: "",
			description: "",
		},
	})

	const createMutation = trpc.relation.createType.useMutation({
		onSuccess: () => {
			utils.relation.getAllTypes.invalidate()
			form.reset()
			onOpenChange(false)
			toast.success("Relation type created successfully")
		},
		onError: (error) => {
			if (error.message.includes("already exists")) {
				form.setError("name", {
					message: "A relation type with this name already exists",
				})
				toast.error("A relation type with this name already exists")
			} else {
				toast.error(error.message || "Failed to create relation type")
			}
		},
	})

	const onSubmit = (values: FormValues) => {
		createMutation.mutate(values)
	}

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-[500px]">
				<DialogHeader>
					<DialogTitle>Create Relation Type</DialogTitle>
					<DialogDescription>
						Define a new type of relationship between characters.
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
								disabled={createMutation.isPending}
							>
								Cancel
							</Button>
							<Button type="submit" disabled={createMutation.isPending}>
								{createMutation.isPending ? "Creating..." : "Create"}
							</Button>
						</DialogFooter>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	)
}
