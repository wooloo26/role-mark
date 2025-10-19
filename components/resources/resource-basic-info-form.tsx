"use client"

import { ContentType, ResourceType } from "@prisma/client"
import type { Control, UseFormWatch } from "react-hook-form"
import type { ResourceFormValues } from "@/components/resources/resource-form-schemas"
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card"
import {
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
import { Textarea } from "@/components/ui/textarea"

interface ResourceBasicInfoFormProps {
	control: Control<ResourceFormValues>
	watch: UseFormWatch<ResourceFormValues>
}

export function ResourceBasicInfoForm({
	control,
	watch,
}: ResourceBasicInfoFormProps) {
	const resourceType = watch("type")
	return (
		<Card>
			<CardHeader>
				<CardTitle>Basic Information</CardTitle>
				<CardDescription>Essential details about the resource</CardDescription>
			</CardHeader>
			<CardContent className="space-y-4">
				<FormField
					control={control}
					name="title"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Title</FormLabel>
							<FormControl>
								<Input placeholder="Resource title" {...field} />
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				<FormField
					control={control}
					name="description"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Description</FormLabel>
							<FormControl>
								<Textarea placeholder="Describe this resource..." {...field} />
							</FormControl>
							<FormDescription>
								Optional description of the resource
							</FormDescription>
							<FormMessage />
						</FormItem>
					)}
				/>

				<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
					<FormField
						control={control}
						name="type"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Resource Type</FormLabel>
								<Select
									onValueChange={field.onChange}
									defaultValue={field.value}
								>
									<FormControl>
										<SelectTrigger>
											<SelectValue placeholder="Select type" />
										</SelectTrigger>
									</FormControl>
									<SelectContent>
										<SelectItem value={ResourceType.SINGLE_FILE}>
											Single File
										</SelectItem>
										<SelectItem value={ResourceType.FILE_ARRAY}>
											File Array
										</SelectItem>
										<SelectItem value={ResourceType.FOLDER}>Folder</SelectItem>
									</SelectContent>
								</Select>
								<FormDescription>Type of resource structure</FormDescription>
								<FormMessage />
							</FormItem>
						)}
					/>

					<FormField
						control={control}
						name="contentType"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Content Type</FormLabel>
								<Select
									onValueChange={field.onChange}
									value={field.value || undefined}
									disabled={resourceType === ResourceType.FOLDER}
								>
									<FormControl>
										<SelectTrigger>
											<SelectValue placeholder="Select content type" />
										</SelectTrigger>
									</FormControl>
									<SelectContent>
										<SelectItem value={ContentType.IMAGE}>Image</SelectItem>
										<SelectItem value={ContentType.VIDEO}>Video</SelectItem>
										<SelectItem value={ContentType.OTHER}>Other</SelectItem>
									</SelectContent>
								</Select>
								<FormDescription>
									{resourceType === ResourceType.FOLDER
										? "Not applicable for folder type"
										: "Content type for processing"}
								</FormDescription>
								<FormMessage />
							</FormItem>
						)}
					/>
				</div>

				<FormField
					control={control}
					name="thumbnailUrl"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Thumbnail URL</FormLabel>
							<FormControl>
								<Input
									placeholder="https://example.com/thumbnail.jpg"
									{...field}
								/>
							</FormControl>
							<FormDescription>Optional thumbnail image URL</FormDescription>
							<FormMessage />
						</FormItem>
					)}
				/>
			</CardContent>
		</Card>
	)
}
