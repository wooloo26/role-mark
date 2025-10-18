"use client";

import type { ThemeProviderProps } from "next-themes";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { useEffect } from "react";
import {
	applyComponentTheme,
	getStoredThemeSettings,
} from "@/lib/theme-config";

function ThemeInitializer() {
	useEffect(() => {
		// Apply component theme on mount
		const settings = getStoredThemeSettings();
		applyComponentTheme(settings.componentTheme);
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
