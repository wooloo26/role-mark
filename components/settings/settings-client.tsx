"use client"

import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { useTheme } from "next-themes"
import { createContext, useContext, useEffect, useState } from "react"
import { toast } from "sonner"
import { useThemeSettings } from "@/client/hooks/use-theme-settings"
import { trpc } from "@/client/trpc"
import { SaveSettingsBar } from "@/components/settings/save-settings-bar"

interface SettingsContextType {
	showNSFW: boolean
	setShowNSFW: (value: boolean) => void
}

const SettingsContext = createContext<SettingsContextType | undefined>(
	undefined,
)

export function useSettings() {
	const context = useContext(SettingsContext)
	if (!context) {
		throw new Error("useSettings must be used within SettingsClient")
	}
	return context
}

interface SettingsClientProps {
	initialShowNSFW: boolean
	children: React.ReactNode
}

export function SettingsClient({
	initialShowNSFW,
	children,
}: SettingsClientProps) {
	const { data: session, status } = useSession()
	const router = useRouter()
	const { theme } = useTheme()
	const { componentTheme } = useThemeSettings()
	const [showNSFW, setShowNSFW] = useState(initialShowNSFW)
	const [isSaving, setIsSaving] = useState(false)

	const updateSettingsMutation = trpc.user.updateSettings.useMutation()

	useEffect(() => {
		if (status === "unauthenticated") {
			router.push("/login")
		}
	}, [status, router])

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
		} catch {
			toast.error("Failed to save settings")
			setIsSaving(false)
		}
	}

	return (
		<SettingsContext.Provider value={{ showNSFW, setShowNSFW }}>
			{children}
			<SaveSettingsBar isSaving={isSaving} onSave={handleSaveSettings} />
		</SettingsContext.Provider>
	)
}
