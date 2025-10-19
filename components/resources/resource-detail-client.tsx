"use client"

import { Edit, Trash2 } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { trpc } from "@/lib/trpc/client"

interface ResourceDetailClientProps {
	resourceId: string
	resourceTitle: string
}

export function ResourceDetailClient({
	resourceId,
	resourceTitle,
}: ResourceDetailClientProps) {
	const router = useRouter()
	const [showDeleteDialog, setShowDeleteDialog] = useState(false)

	const deleteMutation = trpc.resource.delete.useMutation({
		onSuccess: () => {
			router.push("/resources")
		},
	})

	const handleDelete = () => {
		deleteMutation.mutate({ id: resourceId })
	}

	return (
		<>
			<div className="flex items-center justify-between mb-8">
				<h1 className="text-3xl font-bold">{resourceTitle}</h1>
				<div className="flex gap-2">
					<Button asChild variant="outline">
						<Link href={`/resources/${resourceId}/edit`}>
							<Edit className="h-4 w-4 mr-2" />
							Edit
						</Link>
					</Button>
					<Button
						variant="destructive"
						onClick={() => setShowDeleteDialog(true)}
					>
						<Trash2 className="h-4 w-4 mr-2" />
						Delete
					</Button>
				</div>
			</div>

			<AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Are you sure?</AlertDialogTitle>
						<AlertDialogDescription>
							This will permanently delete the resource "{resourceTitle}" and
							all associated files. This action cannot be undone.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>Cancel</AlertDialogCancel>
						<AlertDialogAction
							onClick={handleDelete}
							className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
						>
							Delete
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</>
	)
}
