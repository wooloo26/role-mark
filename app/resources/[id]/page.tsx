import type { Metadata } from "next"
import { ResourceDetail } from "@/components/resources/resource-detail"

export const metadata: Metadata = {
	title: "Resource Details | Role Mark",
	description: "View resource details",
}

export default function ResourceDetailPage() {
	return <ResourceDetail />
}
