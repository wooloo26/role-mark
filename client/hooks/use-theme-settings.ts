"use client"

import { useEffect, useState } from "react"
import type { ComponentTheme, ThemeSettings } from "@/client/theme-config"
import {
	applyComponentTheme,
	defaultThemeSettings,
	getStoredThemeSettings,
	saveThemeSettings,
} from "@/client/theme-config"

export function useThemeSettings() {
	const [settings, setSettings] = useState<ThemeSettings>(defaultThemeSettings)
	const [isLoaded, setIsLoaded] = useState(false)

	// Load settings on mount
	useEffect(() => {
		const stored = getStoredThemeSettings()
		setSettings(stored)
		applyComponentTheme(stored.componentTheme)
		setIsLoaded(true)
	}, [])

	// Update component theme
	const updateComponentTheme = (updates: Partial<ComponentTheme>): void => {
		const newSettings: ThemeSettings = {
			...settings,
			componentTheme: {
				...settings.componentTheme,
				...updates,
			},
		}
		setSettings(newSettings)
		saveThemeSettings(newSettings)
		applyComponentTheme(newSettings.componentTheme)
	}

	// Reset to defaults
	const resetToDefaults = (): void => {
		setSettings(defaultThemeSettings)
		saveThemeSettings(defaultThemeSettings)
		applyComponentTheme(defaultThemeSettings.componentTheme)
	}

	return {
		settings,
		isLoaded,
		updateComponentTheme,
		resetToDefaults,
		componentTheme: settings.componentTheme,
	}
}
