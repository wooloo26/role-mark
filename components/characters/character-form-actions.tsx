import type { LucideIcon } from "lucide-react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

interface CharacterFormActionsProps {
	isSubmitting: boolean
	submitLabel: string
	submittingLabel: string
	icon: LucideIcon
	error?: string | null
}

export function CharacterFormActions({
	isSubmitting,
	submitLabel,
	submittingLabel,
	icon: Icon,
	error,
}: CharacterFormActionsProps) {
	const router = useRouter()

	return (
		<>
			<div className="flex gap-4 justify-end">
				<Button type="button" variant="outline" onClick={() => router.back()}>
					Cancel
				</Button>
				<Button type="submit" disabled={isSubmitting} className="gap-2">
					{isSubmitting ? (
						submittingLabel
					) : (
						<>
							<Icon className="h-4 w-4" />
							{submitLabel}
						</>
					)}
				</Button>
			</div>

			{error && (
				<Card className="border-destructive">
					<CardContent className="pt-6">
						<p className="text-sm text-destructive">Error: {error}</p>
					</CardContent>
				</Card>
			)}
		</>
	)
}
