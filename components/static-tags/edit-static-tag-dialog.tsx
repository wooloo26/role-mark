"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { StaticTagDataType } from "@prisma/client"
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
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"

const formSchema = z.object({
	name: z
		.string()
		.min(1, "Name is required")
		.max(100)
		.regex(
			/^[a-z0-9_]+$/,
			"Name must contain only lowercase letters, numbers, and underscores",
		),
	displayName: z.string().min(1, "Display name is required").max(100),
	dataType: z.nativeEnum(StaticTagDataType),
	unit: z.string().max(20).optional(),
	description: z.string().max(500).optional(),
	isRequired: z.boolean(),
})

type FormValues = z.infer<typeof formSchema>

interface EditStaticTagDialogProps {
	open: boolean
	onOpenChange: (open: boolean) => void
	tag: {
		id: string
		name: string
		displayName: string
		dataType: StaticTagDataType
		unit?: string | null
		description?: string | null
		isRequired: boolean
	}
}

export function EditStaticTagDialog({
	open,
	onOpenChange,
	tag,
}: EditStaticTagDialogProps) {
	const utils = trpc.useUtils()

	const form = useForm<FormValues>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			name: tag.name,
			displayName: tag.displayName,
			dataType: tag.dataType,
			unit: tag.unit || "",
			description: tag.description || "",
			isRequired: tag.isRequired,
		},
	})

	// Reset form when tag changes
	useEffect(() => {
		form.reset({
			name: tag.name,
			displayName: tag.displayName,
			dataType: tag.dataType,
			unit: tag.unit || "",
			description: tag.description || "",
			isRequired: tag.isRequired,
		})
	}, [tag, form])

	const updateMutation = trpc.staticTag.update.useMutation({
		onSuccess: () => {
			utils.staticTag.list.invalidate()
			utils.staticTag.getGroupedByDataType.invalidate()
			utils.staticTag.getStats.invalidate()
			onOpenChange(false)
			toast.success("Static tag updated successfully")
		},
		onError: (error) => {
			if (error.message.includes("already exists")) {
				form.setError("name", {
					message: "A static tag with this name already exists",
				})
				toast.error("A static tag with this name already exists")
			} else {
				toast.error("Failed to update static tag")
			}
		},
	})

	const onSubmit = (values: FormValues) => {
		updateMutation.mutate({
			id: tag.id,
			...values,
		})
	}

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
				<DialogHeader>
					<DialogTitle>Edit Static Tag Definition</DialogTitle>
					<DialogDescription>
						Update the definition for this character attribute.
					</DialogDescription>
				</DialogHeader>

				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
						<FormField
							control={form.control}
							name="displayName"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Display Name</FormLabel>
									<FormControl>
										<Input placeholder="Height" {...field} />
									</FormControl>
									<FormDescription>
										The human-readable name shown in the UI
									</FormDescription>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="name"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Internal Name</FormLabel>
									<FormControl>
										<Input placeholder="height" {...field} />
									</FormControl>
									<FormDescription>
										Lowercase letters, numbers, and underscores only. Used in
										code.
									</FormDescription>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="dataType"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Data Type</FormLabel>
									<Select
										onValueChange={field.onChange}
										defaultValue={field.value}
									>
										<FormControl>
											<SelectTrigger>
												<SelectValue />
											</SelectTrigger>
										</FormControl>
										<SelectContent>
											<SelectItem value={StaticTagDataType.STRING}>
												String (Text)
											</SelectItem>
											<SelectItem value={StaticTagDataType.NUMBER}>
												Number
											</SelectItem>
											<SelectItem value={StaticTagDataType.DATE}>
												Date
											</SelectItem>
											<SelectItem value={StaticTagDataType.BOOLEAN}>
												Boolean (Yes/No)
											</SelectItem>
										</SelectContent>
									</Select>
									<FormDescription>
										The type of data this attribute will store
									</FormDescription>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="unit"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Unit (Optional)</FormLabel>
									<FormControl>
										<Input placeholder="cm, kg, years..." {...field} />
									</FormControl>
									<FormDescription>
										The unit of measurement (e.g., "cm" for height, "kg" for
										weight)
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
											placeholder="Additional information about this attribute..."
											{...field}
										/>
									</FormControl>
									<FormDescription>
										Help text to explain what this attribute represents
									</FormDescription>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="isRequired"
							render={({ field }) => (
								<FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
									<div className="space-y-0.5">
										<FormLabel className="text-base">Required Field</FormLabel>
										<FormDescription>
											Mark this as a required field for all characters
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
							<Button type="submit" disabled={updateMutation.isPending}>
								{updateMutation.isPending ? "Updating..." : "Update"}
							</Button>
						</DialogFooter>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	)
}
