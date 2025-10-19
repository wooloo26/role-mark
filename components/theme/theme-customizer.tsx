"use client"

import { useCallback, useEffect, useId, useState } from "react"
import { CustomPaletteEditor } from "@/components/theme/custom-palette-editor"
import { Button } from "@/components/ui/button"
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { useThemeSettings } from "@/lib/hooks/use-theme-settings"
import { getAllPalettes, isCustomPalette } from "@/lib/theme-config"

export function ThemeCustomizer() {
	const { componentTheme, updateComponentTheme, resetToDefaults, isLoaded } =
		useThemeSettings()
	const [availablePalettes, setAvailablePalettes] = useState<
		Record<string, string>
	>({})

	const radiusId = useId()
	const fontSizeId = useId()
	const cardStyleId = useId()
	const colorPaletteId = useId()
	const reducedMotionId = useId()

	const loadPalettes = useCallback(() => {
		const allPalettes = getAllPalettes()
		const paletteLabels: Record<string, string> = {}

		// Built-in palettes with nice labels
		paletteLabels.default = "Default (Neutral)"
		paletteLabels.festive = "Festive (Red & Green)"

		// Add custom palettes
		Object.keys(allPalettes).forEach((name) => {
			if (isCustomPalette(name)) {
				paletteLabels[name] = `${name} (Custom)`
			}
		})

		setAvailablePalettes(paletteLabels)
	}, [])

	// Load available palettes
	useEffect(() => {
		loadPalettes()
	}, [loadPalettes])

	const handlePaletteCreated = (paletteName: string) => {
		loadPalettes()
		// Automatically switch to the newly created palette
		updateComponentTheme({ colorPalette: paletteName })
	}

	if (!isLoaded) {
		return <div className="text-sm text-muted-foreground">Loading...</div>
	}

	return (
		<div className="space-y-6">
			{/* Color Palette */}
			<Card>
				<CardHeader>
					<CardTitle>Color Theme</CardTitle>
					<CardDescription>
						Choose a color palette (works with both light and dark modes)
					</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="space-y-4">
						<div className="flex items-center justify-between">
							<Label htmlFor={colorPaletteId}>Color Palette</Label>
							<Select
								value={componentTheme.colorPalette}
								onValueChange={(value) =>
									updateComponentTheme({
										colorPalette: value as typeof componentTheme.colorPalette,
									})
								}
							>
								<SelectTrigger id={colorPaletteId} className="w-[180px]">
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									{Object.entries(availablePalettes).map(([value, label]) => (
										<SelectItem key={value} value={value}>
											{label}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>

						{/* Custom Palette Button */}
						<CustomPaletteEditor onPaletteCreated={handlePaletteCreated} />

						{/* Preview */}
						<div className="pt-4 space-y-2">
							<p className="text-sm font-medium">Preview:</p>
							<div className="grid grid-cols-3 gap-2">
								<div className="h-16 bg-primary rounded-md flex items-center justify-center">
									<span className="text-xs text-primary-foreground font-medium">
										Primary
									</span>
								</div>
								<div className="h-16 bg-secondary rounded-md flex items-center justify-center">
									<span className="text-xs text-secondary-foreground font-medium">
										Secondary
									</span>
								</div>
								<div className="h-16 bg-accent rounded-md flex items-center justify-center">
									<span className="text-xs text-accent-foreground font-medium">
										Accent
									</span>
								</div>
							</div>
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Border Radius */}
			<Card>
				<CardHeader>
					<CardTitle>Border Radius</CardTitle>
					<CardDescription>
						Adjust the roundness of UI components
					</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="space-y-4">
						<div className="flex items-center justify-between">
							<Label htmlFor={radiusId}>Corner Style</Label>
							<Select
								value={componentTheme.radius}
								onValueChange={(value) =>
									updateComponentTheme({
										radius: value as typeof componentTheme.radius,
									})
								}
							>
								<SelectTrigger id={radiusId} className="w-[180px]">
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="none">Sharp (0px)</SelectItem>
									<SelectItem value="sm">Small (4px)</SelectItem>
									<SelectItem value="md">Medium (10px)</SelectItem>
									<SelectItem value="lg">Large (16px)</SelectItem>
									<SelectItem value="xl">Extra Large (24px)</SelectItem>
								</SelectContent>
							</Select>
						</div>

						{/* Preview */}
						<div className="flex items-center gap-4 pt-4">
							<div className="flex-1 space-y-2">
								<p className="text-sm font-medium">Preview:</p>
								<div className="flex gap-2">
									<div className="h-16 w-16 bg-primary rounded-[var(--radius)]" />
									<div className="h-16 w-24 bg-secondary rounded-[calc(var(--radius)-2px)] border-1 border-border" />
								</div>
							</div>
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Font Size */}
			<Card>
				<CardHeader>
					<CardTitle>Font Size</CardTitle>
					<CardDescription>Adjust the base text size</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="space-y-4">
						<div className="flex items-center justify-between">
							<Label htmlFor={fontSizeId}>Text Scale</Label>
							<Select
								value={componentTheme.fontSize}
								onValueChange={(value) =>
									updateComponentTheme({
										fontSize: value as typeof componentTheme.fontSize,
									})
								}
							>
								<SelectTrigger id={fontSizeId} className="w-[180px]">
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="xs">Extra Small</SelectItem>
									<SelectItem value="sm">Small</SelectItem>
									<SelectItem value="base">Normal</SelectItem>
									<SelectItem value="lg">Large</SelectItem>
									<SelectItem value="xl">Extra Large</SelectItem>
								</SelectContent>
							</Select>
						</div>

						{/* Preview */}
						<div className="pt-4 space-y-2">
							<p className="text-sm font-medium">Preview:</p>
							<div className="space-y-1 p-4 border rounded-lg">
								<p className="text-xs">Extra small text example</p>
								<p className="text-sm">Small text example</p>
								<p className="text-base">Normal text example</p>
								<p className="text-lg">Large text example</p>
							</div>
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Card Style */}
			<Card>
				<CardHeader>
					<CardTitle>Card Style</CardTitle>
					<CardDescription>
						Choose the appearance style for cards and panels
					</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="space-y-4">
						<div className="flex items-center justify-between">
							<Label htmlFor={cardStyleId}>Card Appearance</Label>
							<Select
								value={componentTheme.cardStyle}
								onValueChange={(value) =>
									updateComponentTheme({
										cardStyle: value as typeof componentTheme.cardStyle,
									})
								}
							>
								<SelectTrigger id={cardStyleId} className="w-[180px]">
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="flat">Flat</SelectItem>
									<SelectItem value="bordered">Bordered</SelectItem>
									<SelectItem value="elevated">Elevated (Shadow)</SelectItem>
								</SelectContent>
							</Select>
						</div>

						{/* Preview */}
						<div className="pt-4 space-y-2">
							<p className="text-sm font-medium">Preview:</p>
							<div className="grid grid-cols-3 gap-2">
								<div
									className={`h-20 rounded-lg ${
										componentTheme.cardStyle === "flat"
											? "bg-card ring-2 ring-primary"
											: "bg-card"
									} ${componentTheme.cardStyle === "bordered" ? "border-1" : ""} ${
										componentTheme.cardStyle === "elevated" ? "shadow-lg" : ""
									}`}
								>
									<div className="p-3">
										<p className="text-xs font-medium">Card</p>
									</div>
								</div>
							</div>
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Reduced Motion */}
			<Card>
				<CardHeader>
					<CardTitle>Animations</CardTitle>
					<CardDescription>Control animation preferences</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="flex items-center justify-between">
						<div className="space-y-0.5">
							<Label htmlFor={reducedMotionId}>Reduce Motion</Label>
							<p className="text-sm text-muted-foreground">
								Minimize animations for better accessibility
							</p>
						</div>
						<Switch
							id={reducedMotionId}
							checked={componentTheme.reducedMotion}
							onCheckedChange={(checked) =>
								updateComponentTheme({ reducedMotion: checked })
							}
						/>
					</div>
				</CardContent>
			</Card>

			{/* Reset Button */}
			<div className="flex justify-end">
				<Button variant="outline" onClick={resetToDefaults}>
					Reset to Defaults
				</Button>
			</div>
		</div>
	)
}
