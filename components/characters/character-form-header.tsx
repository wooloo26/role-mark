import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { AnimatedGradientText } from "@/components/ui/animated-gradient-text"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface CharacterFormHeaderProps {
	backUrl: string
	backLabel: string
	gradientText: string
	title: string
	description: string
}

export function CharacterFormHeader({
	backUrl,
	backLabel,
	gradientText,
	title,
	description,
}: CharacterFormHeaderProps) {
	return (
		<div className="mb-8">
			<Button variant="ghost" asChild className="mb-4">
				<Link href={backUrl}>
					<ArrowLeft className="h-4 w-4 mr-2" />
					{backLabel}
				</Link>
			</Button>

			<div className="text-center space-y-4">
				<AnimatedGradientText className="inline-flex items-center gap-2">
					<span
						className={cn(
							"inline animate-gradient bg-gradient-to-r from-[#ffaa40] via-[#9c40ff] to-[#ffaa40] bg-[length:var(--bg-size)_100%] bg-clip-text text-transparent",
						)}
					>
						{gradientText}
					</span>
				</AnimatedGradientText>
				<h1 className="text-3xl font-bold">{title}</h1>
				<p className="text-muted-foreground">{description}</p>
			</div>
		</div>
	)
}
