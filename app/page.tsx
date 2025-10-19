import { FeaturesSection } from "@/components/features-section"
import { HomeHero } from "@/components/home-hero"

export default function Home() {
	return (
		<div className="flex flex-col">
			<HomeHero />
			<FeaturesSection />
		</div>
	)
}
