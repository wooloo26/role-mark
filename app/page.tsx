"use client"

import { BookOpen, FolderOpen, Settings2, Tag, Users } from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import { ThemeCustomizer } from "@/components/theme/theme-customizer"
import { Button } from "@/components/ui/button"
import {
	Card,
	CardContent,
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

export default function Home() {
	const [isCustomizerOpen, setIsCustomizerOpen] = useState(false)
	return (
		<div className="flex flex-col min-h-screen">
			{/* Hero Section */}
			<section className="flex flex-col items-center justify-center px-4 py-20 text-center space-y-6 bg-gradient-to-b from-background to-secondary/20">
				<h1 className="text-4xl font-bold tracking-tight sm:text-6xl bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60">
					Role Mark
				</h1>
				<p className="max-w-2xl text-xl text-muted-foreground">
					A comprehensive platform for managing characters, resources, and wiki
					content with powerful tagging and organization features.
				</p>
				<div className="flex gap-4">
					<Button asChild size="lg">
						<Link href="/characters">Explore Characters</Link>
					</Button>
					<Button asChild variant="outline" size="lg">
						<Link href="/wiki">Browse Wiki</Link>
					</Button>
				</div>
				<div className="mt-6">
					<Dialog open={isCustomizerOpen} onOpenChange={setIsCustomizerOpen}>
						<DialogTrigger asChild>
							<Button variant="ghost" size="sm">
								<Settings2 className="mr-2 h-4 w-4" />
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
			</section>

			{/* Features Section */}
			<section className="container px-4 py-20">
				<h2 className="text-3xl font-bold text-center mb-12">Core Features</h2>
				<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
					<Card className="group hover:shadow-lg transition-shadow">
						<CardHeader>
							<Users className="h-12 w-12 mb-4 text-primary group-hover:scale-110 transition-transform" />
							<CardTitle>Character Database</CardTitle>
							<CardDescription>
								Comprehensive character profiles with avatars, portraits, and
								detailed information
							</CardDescription>
						</CardHeader>
						<CardContent>
							<ul className="space-y-2 text-sm text-muted-foreground">
								<li>• Static & dynamic tags</li>
								<li>• Character relationships</li>
								<li>• Advanced search & filtering</li>
								<li>• Statistical charts</li>
							</ul>
						</CardContent>
					</Card>

					<Card className="group hover:shadow-lg transition-shadow">
						<CardHeader>
							<FolderOpen className="h-12 w-12 mb-4 text-primary group-hover:scale-110 transition-transform" />
							<CardTitle>Resource Library</CardTitle>
							<CardDescription>
								Organize images, videos, audio, and other media files
							</CardDescription>
						</CardHeader>
						<CardContent>
							<ul className="space-y-2 text-sm text-muted-foreground">
								<li>• Multi-format support</li>
								<li>• Character associations</li>
								<li>• Tag-based indexing</li>
								<li>• Fast retrieval</li>
							</ul>
						</CardContent>
					</Card>

					<Card className="group hover:shadow-lg transition-shadow">
						<CardHeader>
							<BookOpen className="h-12 w-12 mb-4 text-primary group-hover:scale-110 transition-transform" />
							<CardTitle>Wiki System</CardTitle>
							<CardDescription>
								Rich Markdown-based wiki pages with version history
							</CardDescription>
						</CardHeader>
						<CardContent>
							<ul className="space-y-2 text-sm text-muted-foreground">
								<li>• Markdown support</li>
								<li>• AI-assisted editing</li>
								<li>• Version control</li>
								<li>• Character linking</li>
							</ul>
						</CardContent>
					</Card>

					<Card className="group hover:shadow-lg transition-shadow">
						<CardHeader>
							<Tag className="h-12 w-12 mb-4 text-primary group-hover:scale-110 transition-transform" />
							<CardTitle>Tagging System</CardTitle>
							<CardDescription>
								Powerful organization with static and dynamic tags
							</CardDescription>
						</CardHeader>
						<CardContent>
							<ul className="space-y-2 text-sm text-muted-foreground">
								<li>• Custom tag creation</li>
								<li>• Tag-based filtering</li>
								<li>• Tag aggregation</li>
								<li>• Smart search</li>
							</ul>
						</CardContent>
					</Card>
				</div>
			</section>

			{/* CTA Section */}
			<section className="container px-4 py-20">
				<div className="rounded-lg bg-primary/5 border p-8 text-center space-y-4">
					<h2 className="text-3xl font-bold">Ready to get started?</h2>
					<p className="text-lg text-muted-foreground max-w-2xl mx-auto">
						Sign up now to start organizing your characters, resources, and wiki
						content.
					</p>
					<div className="flex justify-center gap-4">
						<Button asChild size="lg">
							<Link href="/register">Create Account</Link>
						</Button>
						<Button asChild variant="outline" size="lg">
							<Link href="/login">Sign In</Link>
						</Button>
					</div>
				</div>
			</section>
		</div>
	)
}
