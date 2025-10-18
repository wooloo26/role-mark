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
		// Apply component theme on mount (in case the script didn't run)
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

/**
 * Blocking script to prevent flash of unstyled theme
 * This should be injected in the <head> before any content renders
 */
export function ThemeScript() {
	// This script will be injected as a string and executed before hydration
	const themeScript = `
		(function() {
			try {
				const stored = localStorage.getItem('themeSettings');
				if (!stored) return;
				
				const settings = JSON.parse(stored);
				const theme = settings.componentTheme;
				if (!theme) return;
				
				const root = document.documentElement;
				
				// Radius values
				const radiusValues = {
					none: '0rem',
					sm: '0.25rem',
					md: '0.625rem',
					lg: '1rem',
					xl: '1.5rem'
				};
				
				// Font size values
				const fontSizeValues = {
					xs: { base: '14px', scale: 0.9 },
					sm: { base: '15px', scale: 0.95 },
					base: { base: '16px', scale: 1 },
					lg: { base: '17px', scale: 1.05 },
					xl: { base: '18px', scale: 1.1 }
				};
				
				// Color palettes (built-in only, custom palettes will flash once)
				const colorPalettes = {
					default: {
						light: { background: 'oklch(1 0 0)', foreground: 'oklch(0.145 0 0)', card: 'oklch(1 0 0)', cardForeground: 'oklch(0.145 0 0)', popover: 'oklch(1 0 0)', popoverForeground: 'oklch(0.145 0 0)', primary: 'oklch(0.205 0 0)', primaryForeground: 'oklch(0.985 0 0)', secondary: 'oklch(0.97 0 0)', secondaryForeground: 'oklch(0.205 0 0)', muted: 'oklch(0.97 0 0)', mutedForeground: 'oklch(0.556 0 0)', accent: 'oklch(0.97 0 0)', accentForeground: 'oklch(0.205 0 0)', border: 'oklch(0.922 0 0)', input: 'oklch(0.922 0 0)', ring: 'oklch(0.708 0 0)' },
						dark: { background: 'oklch(0.145 0 0)', foreground: 'oklch(0.985 0 0)', card: 'oklch(0.205 0 0)', cardForeground: 'oklch(0.985 0 0)', popover: 'oklch(0.205 0 0)', popoverForeground: 'oklch(0.985 0 0)', primary: 'oklch(0.922 0 0)', primaryForeground: 'oklch(0.205 0 0)', secondary: 'oklch(0.269 0 0)', secondaryForeground: 'oklch(0.985 0 0)', muted: 'oklch(0.269 0 0)', mutedForeground: 'oklch(0.708 0 0)', accent: 'oklch(0.269 0 0)', accentForeground: 'oklch(0.985 0 0)', border: 'oklch(1 0 0 / 10%)', input: 'oklch(1 0 0 / 15%)', ring: 'oklch(0.556 0 0)' }
					},
				};
				
				// Apply radius
				root.style.setProperty('--radius', radiusValues[theme.radius] || '0.625rem');
				
				// Apply font size
				const fontSize = fontSizeValues[theme.fontSize] || fontSizeValues.base;
				root.style.fontSize = fontSize.base;
				root.style.setProperty('--font-scale', fontSize.scale);
				
				// Apply card style
				root.setAttribute('data-card-style', theme.cardStyle || 'elevated');
				
				// Apply reduced motion
				if (theme.reducedMotion) {
					root.style.setProperty('--animation-duration', '0.01ms');
				}
				
				// Apply color palette
				if (theme.colorPalette) {
					const palette = colorPalettes[theme.colorPalette];
					if (palette) {
						// Check if dark mode (look for 'dark' class on html element)
						const isDark = root.classList.contains('dark');
						const colors = isDark ? palette.dark : palette.light;
						
						// Apply all color variables
						root.style.setProperty('--background', colors.background);
						root.style.setProperty('--foreground', colors.foreground);
						root.style.setProperty('--card', colors.card);
						root.style.setProperty('--card-foreground', colors.cardForeground);
						root.style.setProperty('--popover', colors.popover);
						root.style.setProperty('--popover-foreground', colors.popoverForeground);
						root.style.setProperty('--primary', colors.primary);
						root.style.setProperty('--primary-foreground', colors.primaryForeground);
						root.style.setProperty('--secondary', colors.secondary);
						root.style.setProperty('--secondary-foreground', colors.secondaryForeground);
						root.style.setProperty('--muted', colors.muted);
						root.style.setProperty('--muted-foreground', colors.mutedForeground);
						root.style.setProperty('--accent', colors.accent);
						root.style.setProperty('--accent-foreground', colors.accentForeground);
						root.style.setProperty('--border', colors.border);
						root.style.setProperty('--input', colors.input);
						root.style.setProperty('--ring', colors.ring);
					}
					root.setAttribute('data-color-palette', theme.colorPalette);
				}
			} catch (e) {
				// Silently fail - will use default theme
			}
		})();
	`;

	return (
		<script
			dangerouslySetInnerHTML={{ __html: themeScript }}
			suppressHydrationWarning
		/>
	);
}
