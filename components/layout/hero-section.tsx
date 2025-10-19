import type { ReactNode } from "react"
import { AnimatedGradientText } from "@/components/ui/animated-gradient-text"
import { DotPattern } from "@/components/ui/dot-pattern"
import { Particles } from "@/components/ui/particles"
import { cn } from "@/lib/utils"

interface HeroSectionProps {
	badge: string
	title: string
	description: string
	children?: ReactNode
}

export function HeroSection({
	badge,
	title,
	description,
	children,
}: HeroSectionProps) {
	return (
		<section className="relative px-4 py-16 text-center overflow-hidden">
			<DotPattern
				className={cn(
					"[mask-image:radial-gradient(400px_circle_at_center,white,transparent)]",
				)}
			/>
			<Particles
				className="absolute inset-0 pointer-events-none"
				quantity={50}
				ease={80}
				color="#888888"
				refresh
			/>

			<div className="relative z-10 max-w-4xl mx-auto space-y-6">
				<AnimatedGradientText className="inline-flex items-center gap-2 mb-4">
					<span
						className={cn(
							"inline animate-gradient bg-gradient-to-r from-[#ffaa40] via-[#9c40ff] to-[#ffaa40] bg-[length:var(--bg-size)_100%] bg-clip-text text-transparent",
						)}
					>
						{badge}
					</span>
				</AnimatedGradientText>

				<h1 className="text-4xl font-bold tracking-tight sm:text-5xl bg-clip-text text-transparent bg-gradient-to-b from-foreground to-foreground/60">
					{title}
				</h1>

				<p className="text-muted-foreground text-lg max-w-2xl mx-auto">
					{description}
				</p>

				{children}
			</div>
		</section>
	)
}
