"use client"

import { ResourceType } from "@prisma/client"
import { Plus, Trash2 } from "lucide-react"
import type { Control, UseFormWatch } from "react-hook-form"
import { useFieldArray } from "react-hook-form"
import type { ResourceFormValues } from "@/components/resources/resource-form-schemas"
import { Button } from "@/components/ui/button"
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card"
import {
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"

interface ResourceFilesFormProps {
	control: Control<ResourceFormValues>
	watch: UseFormWatch<ResourceFormValues>
}

export function ResourceFilesForm({ control, watch }: ResourceFilesFormProps) {
	const { fields, append, remove } = useFieldArray({
		control,
		name: "files",
	})

	const resourceType = watch("type")
	const isSingleFile = resourceType === ResourceType.SINGLE_FILE

	const addFile = () => {
		append({
			fileName: "",
			fileUrl: "",
			mimeType: "",
			fileSize: undefined,
			order: fields.length,
		})
	}

	return (
		<Card>
			<CardHeader>
				<CardTitle>Files</CardTitle>
				<CardDescription>
					{isSingleFile
						? "Add the file for this resource"
						: "Add files for this resource"}
				</CardDescription>
			</CardHeader>
			<CardContent className="space-y-4">
				{fields.length === 0 && (
					<div className="text-center py-8 text-muted-foreground">
						No files added yet. Click "Add File" to begin.
					</div>
				)}

				{fields.map((field, index) => (
					<div
						key={field.id}
						className="border rounded-lg p-4 space-y-3 relative"
					>
						{!isSingleFile && (
							<Button
								type="button"
								variant="ghost"
								size="sm"
								className="absolute top-2 right-2"
								onClick={() => remove(index)}
							>
								<Trash2 className="h-4 w-4" />
							</Button>
						)}

						<h4 className="font-medium text-sm">
							File {index + 1}
							{isSingleFile && " (Required)"}
						</h4>

						<div className="grid gap-3">
							<FormField
								control={control}
								name={`files.${index}.fileName`}
								render={({ field }) => (
									<FormItem>
										<FormLabel>File Name</FormLabel>
										<FormControl>
											<Input placeholder="example.jpg" {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={control}
								name={`files.${index}.fileUrl`}
								render={({ field }) => (
									<FormItem>
										<FormLabel>File URL</FormLabel>
										<FormControl>
											<Input
												placeholder="https://example.com/file.jpg"
												{...field}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<div className="grid grid-cols-2 gap-3">
								<FormField
									control={control}
									name={`files.${index}.mimeType`}
									render={({ field }) => (
										<FormItem>
											<FormLabel>MIME Type</FormLabel>
											<FormControl>
												<Input placeholder="image/jpeg" {...field} />
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>

								<FormField
									control={control}
									name={`files.${index}.fileSize`}
									render={({ field }) => (
										<FormItem>
											<FormLabel>File Size (bytes)</FormLabel>
											<FormControl>
												<Input
													type="number"
													placeholder="1024"
													{...field}
													value={field.value || ""}
													onChange={(e) =>
														field.onChange(
															e.target.value
																? Number.parseInt(e.target.value)
																: undefined,
														)
													}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
							</div>
						</div>
					</div>
				))}

				{(!isSingleFile || fields.length === 0) && (
					<Button
						type="button"
						variant="outline"
						onClick={addFile}
						className="w-full gap-2"
						disabled={isSingleFile && fields.length >= 1}
					>
						<Plus className="h-4 w-4" />
						Add File
					</Button>
				)}
			</CardContent>
		</Card>
	)
}
