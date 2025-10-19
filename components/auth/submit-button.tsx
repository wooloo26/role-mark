import type { LucideIcon } from "lucide-react"
import { Loader2 } from "lucide-react"
import { ShimmerButton } from "@/components/ui/shimmer-button"

interface SubmitButtonProps {
	isLoading: boolean
	loadingText: string
	icon: LucideIcon
	children: string
}

export function SubmitButton({
	isLoading,
	loadingText,
	icon: Icon,
	children,
}: SubmitButtonProps) {
	return (
		<ShimmerButton
			type="submit"
			className="w-full h-11 shadow-lg"
			disabled={isLoading}
			shimmerSize="0.15em"
		>
			{isLoading ? (
				<>
					<Loader2 className="mr-2 h-4 w-4 animate-spin" />
					{loadingText}
				</>
			) : (
				<>
					<Icon className="mr-2 h-4 w-4" />
					{children}
				</>
			)}
		</ShimmerButton>
	)
}
