"use client";

import type { ThemeProviderProps } from "next-themes";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { useEffect } from "react";
import {
	applyColorPalette,
	applyComponentTheme,
	getStoredThemeSettings,
} from "@/lib/theme-config";

function ThemeInitializer() {
	useEffect(() => {
		// Apply component theme on mount
		const settings = getStoredThemeSettings();
		applyComponentTheme(settings.componentTheme);

		// Listen for theme changes (light/dark mode toggle)
		const observer = new MutationObserver((mutations) => {
			mutations.forEach((mutation) => {
				if (
					mutation.type === "attributes" &&
					mutation.attributeName === "class"
				) {
					// Reapply color palette when theme changes
					const currentSettings = getStoredThemeSettings();
					applyColorPalette(currentSettings.componentTheme.colorPalette);
				}
			});
		});

		observer.observe(document.documentElement, {
			attributes: true,
			attributeFilter: ["class"],
		});

		return () => observer.disconnect();
	}, []);

	return null;
}

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
	return (
		<NextThemesProvider {...props}>
			<ThemeInitializer />
			{children}
		</NextThemesProvider>
	);
}
