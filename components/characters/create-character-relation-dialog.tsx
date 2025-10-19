"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { Check, ChevronsUpDown } from "lucide-react"
import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
} from "@/components/ui/command"
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
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover"
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { trpc } from "@/lib/trpc/client"
import { cn } from "@/lib/utils"

const formSchema = z.object({
	toCharacterId: z.string().min(1, "Please select a character"),
	relationTypeId: z.string().min(1, "Please select a relation type"),
	isBidirectional: z.boolean(),
})

type FormValues = z.infer<typeof formSchema>

interface CreateCharacterRelationDialogProps {
	fromCharacterId: string
	open: boolean
	onOpenChange: (open: boolean) => void
}

export function CreateCharacterRelationDialog({
	fromCharacterId,
	open,
	onOpenChange,
}: CreateCharacterRelationDialogProps) {
	const [characterSearchOpen, setCharacterSearchOpen] = useState(false)
	const [characterSearch, setCharacterSearch] = useState("")
	const utils = trpc.useUtils()

	const form = useForm<FormValues>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			toCharacterId: "",
			relationTypeId: "",
			isBidirectional: false,
		},
	})

	// Fetch relation types
	const { data: relationTypes } = trpc.relation.getAllTypes.useQuery()

	// Fetch characters for selection
	const { data: charactersData } = trpc.character.search.useQuery({
		name: characterSearch,
		limit: 50,
	})

	// Filter out the current character
	const availableCharacters =
		charactersData?.characters.filter((c) => c.id !== fromCharacterId) || []

	const createMutation = trpc.relation.create.useMutation({
		onSuccess: () => {
			utils.relation.getRelations.invalidate({ characterId: fromCharacterId })
			utils.character.getById.invalidate({ id: fromCharacterId })
			form.reset()
			onOpenChange(false)
		},
		onError: (error) => {
			if (error.message.includes("already exists")) {
				form.setError("root", {
					message: "This relation already exists",
				})
			}
		},
	})

	const onSubmit = (values: FormValues) => {
		createMutation.mutate({
			fromCharacterId,
			toCharacterId: values.toCharacterId,
			relationTypeId: values.relationTypeId,
			isBidirectional: values.isBidirectional,
		})
	}

	// Reset form when dialog closes
	useEffect(() => {
		if (!open) {
			form.reset()
			setCharacterSearch("")
		}
	}, [open, form])

	const selectedCharacter = availableCharacters.find(
		(c) => c.id === form.watch("toCharacterId"),
	)

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-[500px]">
				<DialogHeader>
					<DialogTitle>Create Character Relation</DialogTitle>
					<DialogDescription>
						Define a relationship between this character and another.
					</DialogDescription>
				</DialogHeader>

				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
						{/* Character Selection */}
						<FormField
							control={form.control}
							name="toCharacterId"
							render={({ field }) => (
								<FormItem className="flex flex-col">
									<FormLabel>Target Character</FormLabel>
									<Popover
										open={characterSearchOpen}
										onOpenChange={setCharacterSearchOpen}
									>
										<PopoverTrigger asChild>
											<FormControl>
												<Button
													variant="outline"
													role="combobox"
													className={cn(
														"justify-between",
														!field.value && "text-muted-foreground",
													)}
												>
													{selectedCharacter ? (
														<div className="flex items-center gap-2">
															<Avatar className="h-6 w-6">
																<AvatarImage
																	src={selectedCharacter.avatarUrl || undefined}
																/>
																<AvatarFallback>
																	{selectedCharacter.name
																		.charAt(0)
																		.toUpperCase()}
																</AvatarFallback>
															</Avatar>
															<span>{selectedCharacter.name}</span>
														</div>
													) : (
														"Select character"
													)}
													<ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
												</Button>
											</FormControl>
										</PopoverTrigger>
										<PopoverContent className="w-[400px] p-0">
											<Command>
												<CommandInput
													placeholder="Search characters..."
													value={characterSearch}
													onValueChange={setCharacterSearch}
												/>
												<CommandList>
													<CommandEmpty>No characters found.</CommandEmpty>
													<CommandGroup>
														{availableCharacters.map((character) => (
															<CommandItem
																key={character.id}
																value={character.id}
																onSelect={() => {
																	form.setValue("toCharacterId", character.id)
																	setCharacterSearchOpen(false)
																}}
															>
																<div className="flex items-center gap-2 flex-1">
																	<Avatar className="h-8 w-8">
																		<AvatarImage
																			src={character.avatarUrl || undefined}
																		/>
																		<AvatarFallback>
																			{character.name.charAt(0).toUpperCase()}
																		</AvatarFallback>
																	</Avatar>
																	<span>{character.name}</span>
																</div>
																<Check
																	className={cn(
																		"ml-auto h-4 w-4",
																		character.id === field.value
																			? "opacity-100"
																			: "opacity-0",
																	)}
																/>
															</CommandItem>
														))}
													</CommandGroup>
												</CommandList>
											</Command>
										</PopoverContent>
									</Popover>
									<FormDescription>
										Select the character to create a relationship with.
									</FormDescription>
									<FormMessage />
								</FormItem>
							)}
						/>

						{/* Relation Type Selection */}
						<FormField
							control={form.control}
							name="relationTypeId"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Relation Type</FormLabel>
									<Select
										onValueChange={field.onChange}
										defaultValue={field.value}
									>
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
