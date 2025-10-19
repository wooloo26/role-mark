import { Settings2, Sparkles } from "lucide-react"
import Link from "next/link"
import { ThemeCustomizer } from "@/components/theme/theme-customizer"
import { AnimatedGradientText } from "@/components/ui/animated-gradient-text"
import { Button } from "@/components/ui/button"
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog"
import { DotPattern } from "@/components/ui/dot-pattern"
import { Particles } from "@/components/ui/particles"
import { ShimmerButton } from "@/components/ui/shimmer-button"
import { cn } from "@/lib/utils"

export function HomeHero() {
	return (
		<section className="relative flex flex-col items-center justify-center px-4 py-32 text-center space-y-8 overflow-hidden">
			{/* Background Effects */}
			<DotPattern
				className={cn(
					"[mask-image:radial-gradient(600px_circle_at_center,white,transparent)]",
				)}
			/>
			<Particles
				className="absolute inset-0 pointer-events-none"
				quantity={100}
				ease={80}
				color="#888888"
				refresh
			/>

			{/* Hero Content */}
			<div className="relative z-10 space-y-8">
				<AnimatedGradientText className="inline-flex items-center gap-2 mb-4">
					<span
						className={cn(
							"inline animate-gradient bg-gradient-to-r from-[#ffaa40] via-[#9c40ff] to-[#ffaa40] bg-[length:var(--bg-size)_100%] bg-clip-text text-transparent",
						)}
					>
						Beautiful Character Management
					</span>
				</AnimatedGradientText>

				<h1 className="text-5xl font-bold tracking-tight sm:text-7xl bg-clip-text text-transparent bg-gradient-to-b from-foreground to-foreground/60">
					Role Mark
				</h1>

				<p className="max-w-2xl mx-auto text-lg sm:text-xl text-muted-foreground leading-relaxed">
					A comprehensive platform for managing characters, resources, and wiki
					content with powerful tagging and organization features.
				</p>

				<div className="flex flex-col sm:flex-row gap-4 justify-center items-center mt-8">
					<Link href="/characters">
						<ShimmerButton
							className="shadow-2xl flex items-center gap-2 px-6 py-3"
							shimmerSize="0.15em"
						>
							<Sparkles className="h-4 w-4" />
							<span>Explore Characters</span>
						</ShimmerButton>
					</Link>
					<Button asChild variant="outline" size="lg" className="px-8">
						<Link href="/wiki">Browse Wiki</Link>
					</Button>
				</div>

				<div className="mt-8">
					<Dialog>
						<DialogTrigger asChild>
							<Button variant="ghost" size="sm" className="gap-2">
								<Settings2 className="h-4 w-4" />
								Customize Appearance
							</Button>
						</DialogTrigger>
						<DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
							<DialogHeader>
								<DialogTitle>Appearance Settings</DialogTitle>
								<DialogDescription>
									Customize component styling to match your preferences. Theme
									toggle is available in the header.
								</DialogDescription>
							</DialogHeader>
							<ThemeCustomizer />
						</DialogContent>
					</Dialog>
				</div>
			</div>
		</section>
	)
}
