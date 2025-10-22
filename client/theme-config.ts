/**
 * Theme Configuration System
 * Supports color themes (light/dark/custom) and component-level customization
 */

export type ColorTheme = "light" | "dark" | "system"

// Available color palettes (each has light and dark variants)
export type ColorPalette = "default" | "festive" | string // Allow custom palette names

export interface ComponentTheme {
	// Border radius settings
	radius: "none" | "sm" | "md" | "lg" | "xl"
	// Font size scale
	fontSize: "xs" | "sm" | "base" | "lg" | "xl"
	// Card styling
	cardStyle: "flat" | "bordered" | "elevated"
	// Animation preferences
	reducedMotion: boolean
	// Color palette
	colorPalette: ColorPalette
}

export const defaultComponentTheme: ComponentTheme = {
	radius: "md",
	fontSize: "base",
	cardStyle: "elevated",
	reducedMotion: false,
	colorPalette: "default",
}

// Color palette definitions
export interface PaletteColors {
	light: {
		background: string
		foreground: string
		card: string
		cardForeground: string
		popover: string
		popoverForeground: string
		primary: string
		primaryForeground: string
		secondary: string
		secondaryForeground: string
		muted: string
		mutedForeground: string
		accent: string
		accentForeground: string
		border: string
		input: string
		ring: string
	}
	dark: {
		background: string
		foreground: string
		card: string
		cardForeground: string
		popover: string
		popoverForeground: string
		primary: string
		primaryForeground: string
		secondary: string
		secondaryForeground: string
		muted: string
		mutedForeground: string
		accent: string
		accentForeground: string
		border: string
		input: string
		ring: string
	}
}

export const colorPalettes: Record<ColorPalette, PaletteColors> = {
	default: {
		light: {
			background: "oklch(0.99 0 0)",
			foreground: "oklch(0.2 0 0)",
			card: "oklch(1 0 0)",
			cardForeground: "oklch(0.2 0 0)",
			popover: "oklch(1 0 0)",
			popoverForeground: "oklch(0.2 0 0)",
			primary: "oklch(0.68 0.154 221.72)",
			primaryForeground: "oklch(1 0 0)",
			secondary: "oklch(0.96 0.008 221.72)",
			secondaryForeground: "oklch(0.3 0 0)",
			muted: "oklch(0.96 0.004 240)",
			mutedForeground: "oklch(0.5 0.01 240)",
			accent: "oklch(0.68 0.154 221.72)",
			accentForeground: "oklch(1 0 0)",
			border: "oklch(0.9 0.008 240)",
			input: "oklch(0.9 0.008 240)",
			ring: "oklch(0.68 0.154 221.72)",
		},
		dark: {
			background: "oklch(0.15 0.01 240)",
			foreground: "oklch(0.95 0.008 240)",
			card: "oklch(0.18 0.012 240)",
			cardForeground: "oklch(0.95 0.008 240)",
			popover: "oklch(0.18 0.012 240)",
			popoverForeground: "oklch(0.95 0.008 240)",
			primary: "oklch(0.68 0.154 221.72)",
			primaryForeground: "oklch(0.98 0 0)",
			secondary: "oklch(0.25 0.02 240)",
			secondaryForeground: "oklch(0.95 0.008 240)",
			muted: "oklch(0.25 0.015 240)",
			mutedForeground: "oklch(0.6 0.015 240)",
			accent: "oklch(0.68 0.154 221.72)",
			accentForeground: "oklch(0.98 0 0)",
			border: "oklch(0.3 0.02 240)",
			input: "oklch(0.3 0.02 240)",
			ring: "oklch(0.68 0.154 221.72)",
		},
	},
	festive: {
		light: {
			background: "oklch(0.98 0.02 50)",
			foreground: "oklch(0.2 0.05 30)",
			card: "oklch(1 0.01 60)",
			cardForeground: "oklch(0.25 0.05 30)",
			popover: "oklch(1 0.01 60)",
			popoverForeground: "oklch(0.25 0.05 30)",
			primary: "oklch(0.55 0.22 25)",
			primaryForeground: "oklch(0.98 0.01 60)",
			secondary: "oklch(0.70 0.15 70)",
			secondaryForeground: "oklch(0.2 0.05 30)",
			muted: "oklch(0.95 0.03 50)",
			mutedForeground: "oklch(0.5 0.05 30)",
			accent: "oklch(0.65 0.18 60)",
			accentForeground: "oklch(0.15 0.05 30)",
			border: "oklch(0.88 0.05 50)",
			input: "oklch(0.88 0.05 50)",
			ring: "oklch(0.55 0.22 25)",
		},
		dark: {
			background: "oklch(0.15 0.04 20)",
			foreground: "oklch(0.95 0.03 50)",
			card: "oklch(0.20 0.05 25)",
			cardForeground: "oklch(0.95 0.03 50)",
			popover: "oklch(0.20 0.05 25)",
			popoverForeground: "oklch(0.95 0.03 50)",
			primary: "oklch(0.60 0.20 30)",
			primaryForeground: "oklch(0.98 0.01 60)",
			secondary: "oklch(0.65 0.15 65)",
			secondaryForeground: "oklch(0.15 0.04 20)",
			muted: "oklch(0.30 0.05 30)",
			mutedForeground: "oklch(0.70 0.05 50)",
			accent: "oklch(0.70 0.16 55)",
			accentForeground: "oklch(0.15 0.04 20)",
			border: "oklch(0.35 0.06 25)",
			input: "oklch(0.35 0.06 25)",
			ring: "oklch(0.60 0.20 30)",
		},
	},
}

export interface ThemeSettings {
	colorTheme: ColorTheme
	componentTheme: ComponentTheme
}

export const defaultThemeSettings: ThemeSettings = {
	colorTheme: "system",
	componentTheme: defaultComponentTheme,
}

// Radius value mappings
export const radiusValues: Record<ComponentTheme["radius"], string> = {
	none: "0rem",
	sm: "0.25rem",
	md: "0.625rem",
	lg: "1rem",
	xl: "1.5rem",
}

// Font size scale mappings
export const fontSizeValues: Record<
	ComponentTheme["fontSize"],
	{ base: string; scale: number }
> = {
	xs: { base: "14px", scale: 0.9 },
	sm: { base: "15px", scale: 0.95 },
	base: { base: "16px", scale: 1 },
	lg: { base: "17px", scale: 1.05 },
	xl: { base: "18px", scale: 1.1 },
}

/**
 * Get theme settings from localStorage
 */
export function getStoredThemeSettings(): ThemeSettings {
	if (typeof window === "undefined") {
		return defaultThemeSettings
	}

	try {
		const stored = localStorage.getItem("themeSettings")
		if (stored) {
			const parsed = JSON.parse(stored)
			return {
				colorTheme: parsed.colorTheme || defaultThemeSettings.colorTheme,
				componentTheme: {
					...defaultComponentTheme,
					...parsed.componentTheme,
				},
			}
		}
	} catch {
		// Silently fall back to defaults if localStorage fails
		// (e.g., in incognito mode or with strict privacy settings)
	}

	return defaultThemeSettings
}

/**
 * Save theme settings to localStorage
 */
export function saveThemeSettings(settings: ThemeSettings): void {
	if (typeof window === "undefined") return

	try {
		localStorage.setItem("themeSettings", JSON.stringify(settings))
	} catch {
		// Silently fail if localStorage is unavailable
	}
}

/**
 * Apply component theme to document root
 */
export function applyComponentTheme(theme: ComponentTheme): void {
	if (typeof document === "undefined") return

	const root = document.documentElement

	// Apply radius
	root.style.setProperty("--radius", radiusValues[theme.radius])

	// Apply font size
	const fontSize = fontSizeValues[theme.fontSize]
	root.style.fontSize = fontSize.base
	root.style.setProperty("--font-scale", fontSize.scale.toString())

	// Apply card style class
	root.setAttribute("data-card-style", theme.cardStyle)

	// Apply reduced motion preference
	if (theme.reducedMotion) {
		root.style.setProperty("--animation-duration", "0.01ms")
	} else {
		root.style.removeProperty("--animation-duration")
	}

	// Apply color palette
	applyColorPalette(theme.colorPalette)
}

/**
 * Apply color palette to document root
 */
export function applyColorPalette(palette: ColorPalette): void {
	if (typeof document === "undefined") return

	const root = document.documentElement
	const allPalettes = getAllPalettes()
	const colors = allPalettes[palette] || colorPalettes.default

	// Determine if dark mode is active
	const isDark = root.classList.contains("dark")
	const paletteColors = isDark ? colors.dark : colors.light

	// Apply each color variable
	root.style.setProperty("--background", paletteColors.background)
	root.style.setProperty("--foreground", paletteColors.foreground)
	root.style.setProperty("--card", paletteColors.card)
	root.style.setProperty("--card-foreground", paletteColors.cardForeground)
	root.style.setProperty("--popover", paletteColors.popover)
	root.style.setProperty(
		"--popover-foreground",
		paletteColors.popoverForeground,
	)
	root.style.setProperty("--primary", paletteColors.primary)
	root.style.setProperty(
		"--primary-foreground",
		paletteColors.primaryForeground,
	)
	root.style.setProperty("--secondary", paletteColors.secondary)
	root.style.setProperty(
		"--secondary-foreground",
		paletteColors.secondaryForeground,
	)
	root.style.setProperty("--muted", paletteColors.muted)
	root.style.setProperty("--muted-foreground", paletteColors.mutedForeground)
	root.style.setProperty("--accent", paletteColors.accent)
	root.style.setProperty("--accent-foreground", paletteColors.accentForeground)
	root.style.setProperty("--border", paletteColors.border)
	root.style.setProperty("--input", paletteColors.input)
	root.style.setProperty("--ring", paletteColors.ring)

	// Store the current palette for theme switching
	root.setAttribute("data-color-palette", palette)
}

/**
 * Get custom color palettes from localStorage
 */
export function getCustomPalettes(): Record<string, PaletteColors> {
	if (typeof window === "undefined") {
		return {}
	}

	try {
		const stored = localStorage.getItem("customPalettes")
		if (stored) {
			return JSON.parse(stored)
		}
	} catch {
		// Silently fall back to empty object if localStorage fails
	}

	return {}
}

/**
 * Save custom color palettes to localStorage
 */
export function saveCustomPalettes(
	palettes: Record<string, PaletteColors>,
): void {
	if (typeof window === "undefined") return

	try {
		localStorage.setItem("customPalettes", JSON.stringify(palettes))
	} catch {
		// Silently fail if localStorage is unavailable
	}
}

/**
 * Add a custom color palette
 */
export function addCustomPalette(name: string, colors: PaletteColors): void {
	const customPalettes = getCustomPalettes()
	customPalettes[name] = colors
	saveCustomPalettes(customPalettes)
}

/**
 * Delete a custom color palette
 */
export function deleteCustomPalette(name: string): void {
	const customPalettes = getCustomPalettes()
	delete customPalettes[name]
	saveCustomPalettes(customPalettes)
}

/**
 * Get all available palettes (built-in + custom)
 */
export function getAllPalettes(): Record<string, PaletteColors> {
	return {
		...colorPalettes,
		...getCustomPalettes(),
	}
}

/**
 * Check if a palette is custom (not built-in)
 */
export function isCustomPalette(paletteName: string): boolean {
	return !(paletteName in colorPalettes)
}
