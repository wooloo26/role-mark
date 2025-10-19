import { CheckCircle2, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

interface SaveSettingsBarProps {
	isSaving: boolean
	onSave: () => void
}

export function SaveSettingsBar({ isSaving, onSave }: SaveSettingsBarProps) {
	return (
		<Card className="border-1 border-primary/20 bg-primary/5">
			<CardContent className="pt-6">
				<div className="flex flex-col sm:flex-row items-center justify-between gap-4">
					<div className="flex items-center gap-3">
						{isSaving ? (
							<Loader2 className="h-5 w-5 animate-spin text-primary" />
						) : (
							<CheckCircle2 className="h-5 w-5 text-primary" />
						)}
						<p className="text-sm font-medium">
							{isSaving
								? "Saving your preferences..."
								: "Ready to save changes"}
						</p>
					</div>
					<Button
						onClick={onSave}
						disabled={isSaving}
						size="lg"
						className="shadow-lg min-w-[140px]"
					>
						{isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
						Save Settings
					</Button>
				</div>
			</CardContent>
		</Card>
	)
}
