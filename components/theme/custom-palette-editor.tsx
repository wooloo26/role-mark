"use client";

import { Plus, Trash2 } from "lucide-react";
import { useId, useState } from "react";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
	addCustomPalette,
	deleteCustomPalette,
	getCustomPalettes,
	type PaletteColors,
} from "@/lib/theme-config";

interface CustomPaletteEditorProps {
	onPaletteCreated?: (name: string) => void;
}

const defaultLightColors = {
	background: "oklch(0.98 0.01 0)",
	foreground: "oklch(0.2 0.04 0)",
	card: "oklch(1 0 0)",
	cardForeground: "oklch(0.2 0.04 0)",
	popover: "oklch(1 0 0)",
	popoverForeground: "oklch(0.2 0.04 0)",
	primary: "oklch(0.5 0.15 240)",
	primaryForeground: "oklch(0.98 0.01 0)",
	secondary: "oklch(0.92 0.02 0)",
	secondaryForeground: "oklch(0.3 0.06 0)",
	muted: "oklch(0.94 0.015 0)",
	mutedForeground: "oklch(0.5 0.04 0)",
	accent: "oklch(0.88 0.04 160)",
	accentForeground: "oklch(0.3 0.06 0)",
	border: "oklch(0.88 0.02 0)",
	input: "oklch(0.88 0.02 0)",
	ring: "oklch(0.5 0.15 240)",
};

const defaultDarkColors = {
	background: "oklch(0.15 0.015 0)",
	foreground: "oklch(0.95 0.01 0)",
	card: "oklch(0.2 0.02 0)",
	cardForeground: "oklch(0.95 0.01 0)",
	popover: "oklch(0.2 0.02 0)",
	popoverForeground: "oklch(0.95 0.01 0)",
	primary: "oklch(0.65 0.18 240)",
	primaryForeground: "oklch(0.15 0.015 0)",
	secondary: "oklch(0.3 0.035 0)",
	secondaryForeground: "oklch(0.95 0.01 0)",
	muted: "oklch(0.3 0.035 0)",
	mutedForeground: "oklch(0.7 0.05 0)",
	accent: "oklch(0.4 0.07 160)",
	accentForeground: "oklch(0.95 0.01 0)",
	border: "oklch(0.3 0.035 0)",
	input: "oklch(0.35 0.045 0)",
	ring: "oklch(0.65 0.18 240)",
};

export function CustomPaletteEditor({
	onPaletteCreated,
}: CustomPaletteEditorProps) {
	const paletteNameId = useId();
	const [isOpen, setIsOpen] = useState(false);
	const [paletteName, setPaletteName] = useState("");
	const [lightColors, setLightColors] = useState(defaultLightColors);
	const [darkColors, setDarkColors] = useState(defaultDarkColors);
	const [customPalettes, setCustomPalettes] = useState<
		Record<string, PaletteColors>
	>({});

	const loadCustomPalettes = () => {
		setCustomPalettes(getCustomPalettes());
	};

	const handleOpen = (open: boolean) => {
		setIsOpen(open);
		if (open) {
			loadCustomPalettes();
			// Reset form
			setPaletteName("");
			setLightColors(defaultLightColors);
			setDarkColors(defaultDarkColors);
		}
	};

	const handleSave = () => {
		if (!paletteName.trim()) {
			alert("Please enter a palette name");
			return;
		}

		// Validate palette name (alphanumeric and hyphens only)
		const validName = paletteName.toLowerCase().replace(/[^a-z0-9-]/g, "-");

		const newPalette: PaletteColors = {
			light: lightColors,
			dark: darkColors,
		};

		addCustomPalette(validName, newPalette);
		setIsOpen(false);
		onPaletteCreated?.(validName);
	};

	const handleDelete = (name: string) => {
		if (confirm(`Are you sure you want to delete the "${name}" palette?`)) {
			deleteCustomPalette(name);
			loadCustomPalettes();
		}
	};

	const updateLightColor = (key: keyof typeof lightColors, value: string) => {
		setLightColors((prev) => ({ ...prev, [key]: value }));
	};

	const updateDarkColor = (key: keyof typeof darkColors, value: string) => {
		setDarkColors((prev) => ({ ...prev, [key]: value }));
	};

	return (
		<Dialog open={isOpen} onOpenChange={handleOpen}>
			<DialogTrigger asChild>
				<Button variant="outline" size="sm" className="w-full">
					<Plus className="h-4 w-4 mr-2" />
					Create Custom Palette
				</Button>
			</DialogTrigger>
			<DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
				<DialogHeader>
					<DialogTitle>Custom Color Palette</DialogTitle>
					<DialogDescription>
						Create your own color palette using OKLCH color values. The palette
						will be available for both light and dark modes.
					</DialogDescription>
				</DialogHeader>

				<div className="space-y-4">
					{/* Palette Name */}
					<div className="space-y-2">
						<Label htmlFor={paletteNameId}>Palette Name</Label>
						<Input
							id={paletteNameId}
							placeholder="my-custom-palette"
							value={paletteName}
							onChange={(e) => setPaletteName(e.target.value)}
						/>
						<p className="text-xs text-muted-foreground">
							Use lowercase letters, numbers, and hyphens only
						</p>
					</div>

					{/* Color Tabs */}
					<Tabs defaultValue="light" className="w-full">
						<TabsList className="grid w-full grid-cols-2">
							<TabsTrigger value="light">Light Mode</TabsTrigger>
							<TabsTrigger value="dark">Dark Mode</TabsTrigger>
						</TabsList>

						<TabsContent value="light" className="space-y-4">
							<div className="grid grid-cols-2 gap-4">
								{Object.entries(lightColors).map(([key, value]) => (
									<div key={key} className="space-y-2">
										<Label htmlFor={`light-${key}`} className="capitalize">
											{key.replace(/([A-Z])/g, " $1").trim()}
										</Label>
										<div className="flex gap-2">
											<Input
												id={`light-${key}`}
												value={value}
												onChange={(e) =>
													updateLightColor(
														key as keyof typeof lightColors,
														e.target.value,
													)
												}
												className="font-mono text-sm"
											/>
											<div
												className="w-10 h-10 rounded border border-border shrink-0"
												style={{ backgroundColor: value }}
											/>
										</div>
									</div>
								))}
							</div>
						</TabsContent>

						<TabsContent value="dark" className="space-y-4">
							<div className="grid grid-cols-2 gap-4">
								{Object.entries(darkColors).map(([key, value]) => (
									<div key={key} className="space-y-2">
										<Label htmlFor={`dark-${key}`} className="capitalize">
											{key.replace(/([A-Z])/g, " $1").trim()}
										</Label>
										<div className="flex gap-2">
											<Input
												id={`dark-${key}`}
												value={value}
												onChange={(e) =>
													updateDarkColor(
														key as keyof typeof darkColors,
														e.target.value,
													)
												}
												className="font-mono text-sm"
											/>
											<div
												className="w-10 h-10 rounded border border-border shrink-0"
												style={{ backgroundColor: value }}
											/>
										</div>
									</div>
								))}
							</div>
						</TabsContent>
					</Tabs>

					{/* Existing Custom Palettes */}
					{Object.keys(customPalettes).length > 0 && (
						<Card>
							<CardHeader>
								<CardTitle className="text-base">
									Saved Custom Palettes
								</CardTitle>
								<CardDescription>
									Manage your custom color palettes
								</CardDescription>
							</CardHeader>
							<CardContent>
								<div className="space-y-2">
									{Object.entries(customPalettes).map(([name]) => (
										<div
											key={name}
											className="flex items-center justify-between p-2 rounded border"
										>
											<span className="font-medium">{name}</span>
											<Button
												variant="ghost"
												size="sm"
												onClick={() => handleDelete(name)}
											>
												<Trash2 className="h-4 w-4 text-destructive" />
											</Button>
										</div>
									))}
								</div>
							</CardContent>
						</Card>
					)}
				</div>

				<DialogFooter>
					<Button variant="outline" onClick={() => setIsOpen(false)}>
						Cancel
					</Button>
					<Button onClick={handleSave}>Create Palette</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
