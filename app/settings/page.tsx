"use client"

import { Eye, Loader2, Palette, Settings, Shield } from "lucide-react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { useTheme } from "next-themes"
import { useEffect, useState } from "react"
import { PageHeader } from "@/components/layout/page-header"
import { PageLayout } from "@/components/layout/page-layout"
import { SaveSettingsBar } from "@/components/settings/save-settings-bar"
import { SettingsSection } from "@/components/settings/settings-section"
import { SettingsToggle } from "@/components/settings/settings-toggle"
import { ThemeCustomizer } from "@/components/theme/theme-customizer"
import { ThemeToggle } from "@/components/theme/theme-toggle"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useThemeSettings } from "@/lib/hooks/use-theme-settings"
import { trpc } from "@/lib/trpc/client"

export default function SettingsPage() {
	const { data: session, status } = useSession()
	const router = useRouter()
	const { theme } = useTheme()
	const { componentTheme } = useThemeSettings()
	const [showNSFW, setShowNSFW] = useState(false)
	const [isSaving, setIsSaving] = useState(false)

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
		<PageLayout>
			<PageHeader
				title="Settings"
				description="Customize your experience and manage preferences"
			/>

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
					<SettingsSection
						icon={Eye}
						title="Content Filters"
						description="Manage what content you want to see"
					>
						<SettingsToggle
							label="Show NSFW Content"
							description="Display content marked as NSFW (Not Safe For Work) in your browsing experience"
							checked={showNSFW}
							onCheckedChange={setShowNSFW}
							badgeText={showNSFW ? "Enabled" : "Disabled"}
						/>
					</SettingsSection>
				</TabsContent>

				<TabsContent value="appearance" className="space-y-4 mt-6">
					<SettingsSection
						icon={Palette}
						title="Color Theme"
						description="Switch between light, dark, and system themes"
					>
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
					</SettingsSection>

					<SettingsSection
						icon={Settings}
						title="Component Customization"
						description="Customize component styling independently"
					>
						<Separator />
						<ThemeCustomizer />
					</SettingsSection>
				</TabsContent>

				<TabsContent value="privacy" className="space-y-4 mt-6">
					<SettingsSection
						icon={Shield}
						title="Privacy Settings"
						description="Manage your privacy preferences"
					>
						<Separator />
						<div className="text-center py-12">
							<div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
								<Shield className="h-8 w-8 text-muted-foreground" />
							</div>
							<p className="text-muted-foreground">
								🚧 Privacy settings coming soon
							</p>
						</div>
					</SettingsSection>
				</TabsContent>
			</Tabs>

			<SaveSettingsBar isSaving={isSaving} onSave={handleSaveSettings} />
		</PageLayout>
	)
}
