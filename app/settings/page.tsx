"use client"

import {
	CheckCircle2,
	Eye,
	Loader2,
	Palette,
	Settings,
	Shield,
} from "lucide-react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { useTheme } from "next-themes"
import React, { useEffect, useState } from "react"
import { ThemeCustomizer } from "@/components/theme/theme-customizer"
import { ThemeToggle } from "@/components/theme/theme-toggle"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card"
import { DotPattern } from "@/components/ui/dot-pattern"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useThemeSettings } from "@/lib/hooks/use-theme-settings"
import { trpc } from "@/lib/trpc/client"
import { cn } from "@/lib/utils"

export default function SettingsPage() {
	const { data: session, status } = useSession()
	const router = useRouter()
	const { theme } = useTheme()
	const { componentTheme } = useThemeSettings()
	const [showNSFW, setShowNSFW] = useState(false)
	const [isSaving, setIsSaving] = useState(false)
	const switchId = React.useId()

	const updateSettingsMutation = trpc.user.updateSettings.useMutation()

	useEffect(() => {
		if (status === "unauthenticated") {
			router.push("/login")
		}
	}, [status, router])

	useEffect(() => {
		// Load settings from localStorage or session
		const settings = localStorage.getItem("userSettings")
		if (settings) {
			const parsed = JSON.parse(settings)
			setShowNSFW(parsed.showNSFW ?? false)
		}
	}, [])

	const handleSaveSettings = async () => {
		setIsSaving(true)
		try {
			// Save to localStorage
			localStorage.setItem(
				"userSettings",
				JSON.stringify({
					showNSFW,
				}),
			)

			// Save to database via tRPC
			if (session) {
				await updateSettingsMutation.mutateAsync({
					showNSFW,
					theme: {
						colorTheme: (theme as "light" | "dark" | "system") || "system",
						componentTheme,
					},
				})
			}

			setTimeout(() => {
				setIsSaving(false)
			}, 500)
		} catch (error) {
			console.error("Error saving settings:", error)
			setIsSaving(false)
		}
	}

	if (status === "loading") {
		return (
			<div className="flex items-center justify-center min-h-[calc(100vh-500px)]">
				<Loader2 className="h-8 w-8 animate-spin text-primary" />
			</div>
		)
	}

	if (!session) {
		return null
	}

	return (
		<div className="container relative py-8 overflow-hidden mx-auto">
			<DotPattern
				className={cn(
					"[mask-image:radial-gradient(600px_circle_at_center,white,transparent)]",
					"absolute inset-0 -z-10",
				)}
			/>
			<div className="max-w-6xl mx-auto space-y-6">
				<div className="space-y-2">
					<h1 className="text-4xl font-bold tracking-tight">Settings</h1>
					<p className="text-lg text-muted-foreground">
						Customize your experience and manage preferences
					</p>
				</div>

				<Tabs defaultValue="general" className="w-full">
					<TabsList className="grid w-full grid-cols-3 h-12 bg-muted/50 p-1">
						<TabsTrigger
							value="general"
							className="gap-2 data-[state=active]:shadow-md"
						>
							<Settings className="h-4 w-4" />
							<span className="hidden sm:inline">General</span>
						</TabsTrigger>
						<TabsTrigger
							value="appearance"
							className="gap-2 data-[state=active]:shadow-md"
						>
							<Palette className="h-4 w-4" />
							<span className="hidden sm:inline">Appearance</span>
						</TabsTrigger>
						<TabsTrigger
							value="privacy"
							className="gap-2 data-[state=active]:shadow-md"
						>
							<Shield className="h-4 w-4" />
							<span className="hidden sm:inline">Privacy</span>
						</TabsTrigger>
					</TabsList>

					<TabsContent value="general" className="space-y-4 mt-6">
						<Card className="border-1 shadow-lg">
							<CardHeader>
								<div className="flex items-center gap-3">
									<div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
										<Eye className="h-5 w-5 text-primary" />
									</div>
									<div>
										<CardTitle className="text-xl">Content Filters</CardTitle>
										<CardDescription className="text-base">
											Manage what content you want to see
										</CardDescription>
									</div>
								</div>
							</CardHeader>
							<CardContent className="space-y-6">
								<Separator />
								<div className="flex items-start justify-between gap-4">
									<div className="space-y-1 flex-1">
										<div className="flex items-center gap-2">
											<Label
												htmlFor={switchId}
												className="text-base font-semibold"
											>
												Show NSFW Content
											</Label>
											<Badge variant={showNSFW ? "default" : "secondary"}>
												{showNSFW ? "Enabled" : "Disabled"}
											</Badge>
										</div>
										<p className="text-sm text-muted-foreground leading-relaxed">
											Display content marked as NSFW (Not Safe For Work) in your
											browsing experience
										</p>
									</div>
									<Switch
										id={switchId}
										checked={showNSFW}
										onCheckedChange={setShowNSFW}
										className="mt-1"
									/>
								</div>
							</CardContent>
						</Card>
					</TabsContent>

					<TabsContent value="appearance" className="space-y-4 mt-6">
						<Card className="border-1 shadow-lg">
							<CardHeader>
								<div className="flex items-center gap-3">
									<div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
										<Palette className="h-5 w-5 text-primary" />
									</div>
									<div>
										<CardTitle className="text-xl">Color Theme</CardTitle>
										<CardDescription className="text-base">
											Switch between light, dark, and system themes
										</CardDescription>
									</div>
								</div>
							</CardHeader>
							<CardContent className="space-y-6">
								<Separator />
								<div className="flex items-center justify-between">
									<div className="space-y-1">
										<p className="text-sm font-medium">Theme Mode</p>
										<p className="text-sm text-muted-foreground">
											Choose your preferred color scheme
										</p>
									</div>
									<ThemeToggle />
								</div>
							</CardContent>
						</Card>

						<Card className="border-1 shadow-lg">
							<CardHeader>
								<div className="flex items-center gap-3">
									<div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
										<Settings className="h-5 w-5 text-primary" />
									</div>
									<div>
										<CardTitle className="text-xl">
											Component Customization
										</CardTitle>
										<CardDescription className="text-base">
											Customize component styling independently
										</CardDescription>
									</div>
								</div>
							</CardHeader>
							<CardContent>
								<Separator className="mb-6" />
								<ThemeCustomizer />
							</CardContent>
						</Card>
					</TabsContent>

					<TabsContent value="privacy" className="space-y-4 mt-6">
						<Card className="border-1 shadow-lg">
							<CardHeader>
								<div className="flex items-center gap-3">
									<div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
										<Shield className="h-5 w-5 text-primary" />
									</div>
									<div>
										<CardTitle className="text-xl">Privacy Settings</CardTitle>
										<CardDescription className="text-base">
											Manage your privacy preferences
										</CardDescription>
									</div>
								</div>
							</CardHeader>
							<CardContent>
								<Separator className="mb-6" />
								<div className="text-center py-12">
									<div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
										<Shield className="h-8 w-8 text-muted-foreground" />
									</div>
									<p className="text-muted-foreground">
										🚧 Privacy settings coming soon
									</p>
								</div>
							</CardContent>
						</Card>
					</TabsContent>
				</Tabs>

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
								onClick={handleSaveSettings}
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
			</div>
		</div>
	)
}
