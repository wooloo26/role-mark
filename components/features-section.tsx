import { Database, Link2, Sparkles } from "lucide-react"
import { FeatureCard } from "./feature-card"

const features = [
	{
		icon: Link2,
		title: "Character Relationships",
		description:
			"Define and visualize complex relationships between characters",
	},
	{
		icon: Database,
		title: "Type-Safe APIs",
		description: "Built with tRPC for end-to-end type safety and great DX",
	},
	{
		icon: Sparkles,
		title: "AI Assistance",
		description: "Optional AI-powered suggestions for wiki content enhancement",
	},
]

export function FeaturesSection() {
	return (
		<section className="container px-4 py-20 mx-auto">
			<div className="text-center space-y-4 mb-16">
				<h2 className="text-4xl font-bold tracking-tight">Features</h2>
				<p className="text-lg text-muted-foreground max-w-2xl mx-auto">
					Powerful features to organize and manage your creative content
				</p>
			</div>

			<div className="grid gap-6 md:grid-cols-3 mt-16 max-w-6xl mx-auto">
				{features.map((feature) => (
					<FeatureCard
						key={feature.title}
						icon={feature.icon}
						title={feature.title}
						description={feature.description}
					/>
				))}
			</div>
		</section>
	)
}
