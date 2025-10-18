"use client";

import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function SettingsPage() {
	const { data: session, status } = useSession();
	const router = useRouter();
	const [showNSFW, setShowNSFW] = useState(false);
	const [isSaving, setIsSaving] = useState(false);

	useEffect(() => {
		if (status === "unauthenticated") {
			router.push("/login");
		}
	}, [status, router]);

	useEffect(() => {
		// Load settings from localStorage or session
		const settings = localStorage.getItem("userSettings");
		if (settings) {
			const parsed = JSON.parse(settings);
			setShowNSFW(parsed.showNSFW ?? false);
		}
	}, []);

	const handleSaveSettings = async () => {
		setIsSaving(true);
		try {
			// Save to localStorage
			localStorage.setItem(
				"userSettings",
				JSON.stringify({
					showNSFW,
				}),
			);

			// In a real app, you'd also save to the database via tRPC
			// await updateSettings.mutateAsync({ showNSFW });

			setTimeout(() => {
				setIsSaving(false);
			}, 500);
		} catch (error) {
			console.error("Error saving settings:", error);
			setIsSaving(false);
		}
	};

	if (status === "loading") {
		return (
			<div className="container flex items-center justify-center min-h-[calc(100vh-200px)]">
				<Loader2 className="h-8 w-8 animate-spin text-primary" />
			</div>
		);
	}

	if (!session) {
		return null;
	}

	return (
		<div className="container py-8">
			<div className="max-w-3xl mx-auto">
				<h1 className="text-3xl font-bold tracking-tight mb-6">Settings</h1>

				<Tabs defaultValue="general" className="w-full">
					<TabsList className="grid w-full grid-cols-3">
						<TabsTrigger value="general">General</TabsTrigger>
						<TabsTrigger value="appearance">Appearance</TabsTrigger>
						<TabsTrigger value="privacy">Privacy</TabsTrigger>
					</TabsList>

					<TabsContent value="general" className="space-y-4">
						<Card>
							<CardHeader>
								<CardTitle>Content Filters</CardTitle>
								<CardDescription>
									Manage what content you want to see
								</CardDescription>
							</CardHeader>
							<CardContent className="space-y-4">
								<div className="flex items-center justify-between">
									<div className="space-y-0.5">
										<Label htmlFor="nsfw-toggle">Show NSFW Content</Label>
										<p className="text-sm text-muted-foreground">
											Display content marked as NSFW
										</p>
									</div>
									<Switch checked={showNSFW} onCheckedChange={setShowNSFW} />
								</div>
							</CardContent>
						</Card>
					</TabsContent>

					<TabsContent value="appearance" className="space-y-4">
						<Card>
							<CardHeader>
								<CardTitle>Theme</CardTitle>
								<CardDescription>
									Customize the appearance of the application
								</CardDescription>
							</CardHeader>
							<CardContent>
								<p className="text-sm text-muted-foreground">
									Use the theme toggle in the header to switch between light and
									dark modes.
								</p>
							</CardContent>
						</Card>
					</TabsContent>

					<TabsContent value="privacy" className="space-y-4">
						<Card>
							<CardHeader>
								<CardTitle>Privacy Settings</CardTitle>
								<CardDescription>
									Manage your privacy preferences
								</CardDescription>
							</CardHeader>
							<CardContent>
								<p className="text-sm text-muted-foreground">
									Privacy settings coming soon
								</p>
							</CardContent>
						</Card>
					</TabsContent>
				</Tabs>

				<div className="mt-6">
					<Button onClick={handleSaveSettings} disabled={isSaving}>
						{isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
						Save Settings
					</Button>
				</div>
			</div>
		</div>
	);
}
