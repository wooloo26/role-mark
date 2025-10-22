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
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"

const formSchema = z.object({
	relationTypeId: z.string().min(1, "Please select a relation type"),
	isBidirectional: z.boolean(),
})

type FormValues = z.infer<typeof formSchema>

interface EditCharacterRelationDialogProps {
	relationId: string
	characterId: string
	open: boolean
	onOpenChange: (open: boolean) => void
}

export function EditCharacterRelationDialog({
	relationId,
	characterId,
	open,
	onOpenChange,
}: EditCharacterRelationDialogProps) {
	const utils = trpc.useUtils()

	const form = useForm<FormValues>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			relationTypeId: "",
			isBidirectional: false,
		},
	})

	// Fetch relation data
	const { data: relation } = trpc.relation.getById.useQuery(
		{ id: relationId },
		{ enabled: open && !!relationId },
	)

	// Fetch relation types
	const { data: relationTypes } = trpc.relation.getAllTypes.useQuery()

	// Populate form when data loads
	useEffect(() => {
		if (relation) {
			form.reset({
				relationTypeId: relation.relationType.id,
				isBidirectional: relation.isBidirectional,
			})
		}
	}, [relation, form])

	const updateMutation = trpc.relation.update.useMutation({
		onSuccess: () => {
			utils.relation.getRelations.invalidate({ characterId })
			utils.character.getById.invalidate({ id: characterId })
			onOpenChange(false)
			toast.success("Character relation updated successfully")
		},
		onError: (error) => {
			form.setError("root", {
				message: error.message,
			})
			toast.error(error.message || "Failed to update relation")
		},
	})

	const onSubmit = (values: FormValues) => {
		updateMutation.mutate({
			id: relationId,
			relationTypeId: values.relationTypeId,
			isBidirectional: values.isBidirectional,
		})
	}

	if (!relation) return null

	const isOutgoing = relation.fromCharacter.id === characterId
	const otherCharacter = isOutgoing
		? relation.toCharacter
		: relation.fromCharacter

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-[500px]">
				<DialogHeader>
					<DialogTitle>Edit Character Relation</DialogTitle>
					<DialogDescription>
						Update the relationship with {otherCharacter.name}.
					</DialogDescription>
				</DialogHeader>

				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
						{/* Relation Type Selection */}
						<FormField
							control={form.control}
							name="relationTypeId"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Relation Type</FormLabel>
									<Select onValueChange={field.onChange} value={field.value}>
										<FormControl>
											<SelectTrigger>
												<SelectValue placeholder="Select a relation type" />
											</SelectTrigger>
										</FormControl>
										<SelectContent>
											{relationTypes?.map((type) => (
												<SelectItem key={type.id} value={type.id}>
													<div className="flex flex-col">
														<span className="font-medium">{type.name}</span>
														{type.description && (
															<span className="text-xs text-muted-foreground">
																{type.description}
															</span>
														)}
													</div>
												</SelectItem>
											))}
										</SelectContent>
									</Select>
									<FormDescription>
										The type of relationship between the characters.
									</FormDescription>
									<FormMessage />
								</FormItem>
							)}
						/>

						{/* Bidirectional Toggle */}
						<FormField
							control={form.control}
							name="isBidirectional"
							render={({ field }) => (
								<FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
									<div className="space-y-0.5">
										<FormLabel className="text-base">Bidirectional</FormLabel>
										<FormDescription>
											This relationship applies in both directions.
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

						{form.formState.errors.root && (
							<div className="text-sm text-destructive">
								{form.formState.errors.root.message}
							</div>
						)}

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
