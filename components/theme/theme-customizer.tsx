"use client";

import { useId } from "react";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useThemeSettings } from "@/lib/hooks/use-theme-settings";

export function ThemeCustomizer() {
	const { componentTheme, updateComponentTheme, resetToDefaults, isLoaded } =
		useThemeSettings();

	const radiusId = useId();
	const fontSizeId = useId();
	const cardStyleId = useId();
	const reducedMotionId = useId();

	if (!isLoaded) {
		return <div className="text-sm text-muted-foreground">Loading...</div>;
	}

	return (
		<div className="space-y-6">
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
									<div className="h-16 w-24 bg-secondary rounded-[calc(var(--radius)-2px)] border-2 border-border" />
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
									} ${componentTheme.cardStyle === "bordered" ? "border-2" : ""} ${
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
	);
}
