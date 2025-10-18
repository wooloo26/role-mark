"use client"

import {
	BookOpen,
	Database,
	FolderOpen,
	Link2,
	Search,
	Settings2,
	Sparkles,
	Tag,
	Users,
} from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import { ThemeCustomizer } from "@/components/theme/theme-customizer"
import { AnimatedGradientText } from "@/components/ui/animated-gradient-text"
import { BentoCard, BentoGrid } from "@/components/ui/bento-grid"
import { Button } from "@/components/ui/button"
import {
	Card,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card"
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

export default function Home() {
	const [isCustomizerOpen, setIsCustomizerOpen] = useState(false)
	return (
		<div className="flex flex-col min-h-screen ">
			{/* Hero Section */}
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
						✨ <hr className="mx-2 h-4 w-[1px] shrink-0 bg-gray-300" />{" "}
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
						A comprehensive platform for managing characters, resources, and
						wiki content with powerful tagging and organization features.
					</p>

					<div className="flex flex-col sm:flex-row gap-4 justify-center items-center mt-8">
						<ShimmerButton className="shadow-2xl" shimmerSize="0.15em">
							<Link
								href="/characters"
								className="flex items-center gap-2 px-6 py-3"
							>
								<Sparkles className="h-4 w-4" />
								<span>Explore Characters</span>
							</Link>
						</ShimmerButton>

						<Button asChild variant="outline" size="lg" className="px-8">
							<Link href="/wiki">Browse Wiki</Link>
						</Button>
					</div>

					<div className="mt-8">
						<Dialog open={isCustomizerOpen} onOpenChange={setIsCustomizerOpen}>
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

			{/* Features Section */}
			<section className="container px-4 py-20">
				<div className="text-center space-y-4 mb-16">
					<h2 className="text-4xl font-bold tracking-tight">
						Everything You Need
					</h2>
					<p className="text-lg text-muted-foreground max-w-2xl mx-auto">
						Powerful features to organize and manage your creative content
					</p>
				</div>

				<BentoGrid className="max-w-6xl mx-auto">
					<BentoCard
						name="Character Database"
						className="col-span-3 lg:col-span-2"
						background={
							<div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-primary/5 to-transparent" />
						}
						Icon={Users}
						description="Comprehensive character profiles with avatars, portraits, and detailed information"
						href="/characters"
						cta="Explore"
					/>
					<BentoCard
						name="Resource Library"
						className="col-span-3 lg:col-span-1"
						background={
							<div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 via-blue-500/5 to-transparent" />
						}
						Icon={FolderOpen}
						description="Organize images, videos, audio, and other media files"
						href="/resources"
						cta="Browse"
					/>
					<BentoCard
						name="Wiki System"
						className="col-span-3 lg:col-span-1"
						background={
							<div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 via-purple-500/5 to-transparent" />
						}
						Icon={BookOpen}
						description="Rich Markdown-based wiki pages with version history"
						href="/wiki"
						cta="Read"
					/>
					<BentoCard
						name="Smart Tagging"
						className="col-span-3 lg:col-span-1"
						background={
							<div className="absolute inset-0 bg-gradient-to-br from-amber-500/20 via-amber-500/5 to-transparent" />
						}
						Icon={Tag}
						description="Powerful organization with static and dynamic tags"
						href="/characters"
						cta="Organize"
					/>
					<BentoCard
						name="Advanced Search"
						className="col-span-3 lg:col-span-1"
						background={
							<div className="absolute inset-0 bg-gradient-to-br from-green-500/20 via-green-500/5 to-transparent" />
						}
						Icon={Search}
						description="Full-text search, tag filtering, and range queries"
						href="/characters"
						cta="Search"
					/>
				</BentoGrid>

				{/* Additional Features Cards */}
				<div className="grid gap-6 md:grid-cols-3 mt-16 max-w-6xl mx-auto">
					<Card className="border-2 hover:border-primary/50 transition-colors">
						<CardHeader>
							<Link2 className="h-10 w-10 mb-3 text-primary" />
							<CardTitle>Character Relationships</CardTitle>
							<CardDescription>
								Define and visualize complex relationships between characters
							</CardDescription>
						</CardHeader>
					</Card>
					<Card className="border-2 hover:border-primary/50 transition-colors">
						<CardHeader>
							<Database className="h-10 w-10 mb-3 text-primary" />
							<CardTitle>Type-Safe APIs</CardTitle>
							<CardDescription>
								Built with tRPC for end-to-end type safety and great DX
							</CardDescription>
						</CardHeader>
					</Card>
					<Card className="border-2 hover:border-primary/50 transition-colors">
						<CardHeader>
							<Sparkles className="h-10 w-10 mb-3 text-primary" />
							<CardTitle>AI Assistance</CardTitle>
							<CardDescription>
								Optional AI-powered suggestions for wiki content enhancement
							</CardDescription>
						</CardHeader>
					</Card>
				</div>
			</section>

			{/* CTA Section */}
			<section className="container px-4 py-20">
				<div className="relative rounded-2xl bg-gradient-to-br from-primary/10 via-primary/5 to-background border-2 border-primary/20 p-12 text-center space-y-6 overflow-hidden">
					<DotPattern
						className={cn(
							"[mask-image:radial-gradient(400px_circle_at_center,white,transparent)]",
							"opacity-40",
						)}
					/>
					<div className="relative z-10">
						<h2 className="text-4xl font-bold mb-4">Ready to get started?</h2>
						<p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
							Sign up now to start organizing your characters, resources, and
							wiki content with our powerful management platform.
						</p>
						<div className="flex flex-col sm:flex-row justify-center gap-4">
							<ShimmerButton className="shadow-lg" shimmerSize="0.15em">
								<Link
									href="/register"
									className="flex items-center gap-2 px-8 py-3"
								>
									<Sparkles className="h-4 w-4" />
									<span>Create Account</span>
								</Link>
							</ShimmerButton>
							<Button asChild variant="outline" size="lg" className="px-8">
								<Link href="/login">Sign In</Link>
							</Button>
						</div>
					</div>
				</div>
			</section>
		</div>
	)
}
