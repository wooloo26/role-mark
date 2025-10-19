import { EditResourceForm } from "@/components/resources/edit-resource-form"

interface EditResourcePageProps {
	params: Promise<{ id: string }>
}

export default async function EditResourcePage({
	params,
}: EditResourcePageProps) {
	const { id } = await params

	return (
		<div className="container mx-auto px-4 py-8">
			<EditResourceForm resourceId={id} />
		</div>
	)
}
