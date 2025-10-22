import { Palette, Settings, Shield } from "lucide-react"
import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { PageHeader } from "@/components/layout/page-header"
import { PageLayout } from "@/components/layout/page-layout"
import { ContentFilters } from "@/components/settings/content-filters"
import { SettingsClient } from "@/components/settings/settings-client"
import { SettingsSection } from "@/components/settings/settings-section"
import { SettingsTabSwitcher } from "@/components/settings/settings-tab-switcher"
import { ThemeCustomizer } from "@/components/theme/theme-customizer"
import { ThemeToggle } from "@/components/theme/theme-toggle"
import { Separator } from "@/components/ui/separator"
import { TabsContent } from "@/components/ui/tabs"
import { authOptions } from "@/lib/auth"
import { api } from "@/server/api"

interface SettingsPageProps {
	searchParams: Promise<{
		tab?: string
	}>
}

export default async function SettingsPage({
	searchParams,
}: SettingsPageProps) {
	const session = await getServerSession(authOptions)

	if (!session) {
		redirect("/login")
	}

	const params = await searchParams
	const currentTab = params.tab || "general"

	// Fetch user profile with settings
	const userProfile = await (await api()).user.getProfile()
	const settings = (userProfile?.settings as { showNSFW?: boolean }) || {}
	const initialShowNSFW = settings.showNSFW ?? false

	return (
		<PageLayout>
			<PageHeader
				title="Settings"
				description="Customize your experience and manage preferences"
			/>

			<SettingsClient initialShowNSFW={initialShowNSFW}>
				<SettingsTabSwitcher initialTab={currentTab}>
					<TabsContent value="general" className="space-y-4 mt-6">
						<ContentFilters />
					</TabsContent>

					<TabsContent value="appearance" className="space-y-4 mt-6">
						<SettingsSection
							icon={Palette}
							title="Color Theme"
							description="Switch between light, dark, and system themes"
						>
							<Separator />
							<div className="flex items-center justify-between mt-4">
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
							<Separator className="mb-4" />
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
				</SettingsTabSwitcher>
			</SettingsClient>
		</PageLayout>
	)
}
