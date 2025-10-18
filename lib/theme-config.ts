/**
 * Theme Configuration System
 * Supports color themes (light/dark/custom) and component-level customization
 */

export type ColorTheme = "light" | "dark" | "system";

export interface ComponentTheme {
	// Border radius settings
	radius: "none" | "sm" | "md" | "lg" | "xl";
	// Font size scale
	fontSize: "xs" | "sm" | "base" | "lg" | "xl";
	// Card styling
	cardStyle: "flat" | "bordered" | "elevated";
	// Animation preferences
	reducedMotion: boolean;
}

export const defaultComponentTheme: ComponentTheme = {
	radius: "md",
	fontSize: "base",
	cardStyle: "elevated",
	reducedMotion: false,
};

export interface ThemeSettings {
	colorTheme: ColorTheme;
	componentTheme: ComponentTheme;
}

export const defaultThemeSettings: ThemeSettings = {
	colorTheme: "system",
	componentTheme: defaultComponentTheme,
};

// Radius value mappings
export const radiusValues: Record<ComponentTheme["radius"], string> = {
	none: "0rem",
	sm: "0.25rem",
	md: "0.625rem",
	lg: "1rem",
	xl: "1.5rem",
};

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
};

/**
 * Get theme settings from localStorage
 */
export function getStoredThemeSettings(): ThemeSettings {
	if (typeof window === "undefined") {
		return defaultThemeSettings;
	}

	try {
		const stored = localStorage.getItem("themeSettings");
		if (stored) {
			const parsed = JSON.parse(stored);
			return {
				colorTheme: parsed.colorTheme || defaultThemeSettings.colorTheme,
				componentTheme: {
					...defaultComponentTheme,
					...parsed.componentTheme,
				},
			};
		}
	} catch (error) {
		console.error("Error loading theme settings:", error);
	}

	return defaultThemeSettings;
}

/**
 * Save theme settings to localStorage
 */
export function saveThemeSettings(settings: ThemeSettings): void {
	if (typeof window === "undefined") return;

	try {
		localStorage.setItem("themeSettings", JSON.stringify(settings));
	} catch (error) {
		console.error("Error saving theme settings:", error);
	}
}

/**
 * Apply component theme to document root
 */
export function applyComponentTheme(theme: ComponentTheme): void {
	if (typeof document === "undefined") return;

	const root = document.documentElement;

	// Apply radius
	root.style.setProperty("--radius", radiusValues[theme.radius]);

	// Apply font size
	const fontSize = fontSizeValues[theme.fontSize];
	root.style.fontSize = fontSize.base;
	root.style.setProperty("--font-scale", fontSize.scale.toString());

	// Apply card style class
	root.setAttribute("data-card-style", theme.cardStyle);

	// Apply reduced motion preference
	if (theme.reducedMotion) {
		root.style.setProperty("--animation-duration", "0.01ms");
	} else {
		root.style.removeProperty("--animation-duration");
	}
}
