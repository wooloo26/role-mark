import type { Metadata } from "next"
import { ResourceCreateForm } from "@/components/resources/resource-create-form"

export const metadata: Metadata = {
	title: "Create Resource | Role Mark",
	description: "Upload and create a new resource",
}

export default function ResourceNewPage() {
	return (
		<div className="container max-w-4xl py-8 mx-auto">
			<div className="mb-8">
				<h1 className="text-3xl font-bold tracking-tight">Create Resource</h1>
				<p className="text-muted-foreground mt-2">
					Upload files and create a new resource. You can upload single files
					(each will create a separate resource) or folder archives.
				</p>
			</div>

			<ResourceCreateForm />
		</div>
	)
}
