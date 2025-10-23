import type { Metadata } from "next"
import { ResourceEditForm } from "@/components/resources/resource-edit-form"

export const metadata: Metadata = {
	title: "Edit Resource | Role Mark",
	description: "Edit resource details",
}

export default function ResourceEditPage() {
	return (
		<div className="container max-w-4xl py-8 mx-auto">
			<div className="mb-8">
				<h1 className="text-3xl font-bold tracking-tight">Edit Resource</h1>
				<p className="text-muted-foreground mt-2">
					Update resource metadata. Note: Files and resource type cannot be
					changed.
				</p>
			</div>

			<ResourceEditForm />
		</div>
	)
}
