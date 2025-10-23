import type { Metadata } from "next"
import { ResourceList } from "@/components/resources/resource-list"

export const metadata: Metadata = {
	title: "Resources | Role Mark",
	description: "Browse and search uploaded resources",
}

export default function ResourcesPage() {
	return (
		<div className="container py-8 mx-auto">
			<ResourceList />
		</div>
	)
}
