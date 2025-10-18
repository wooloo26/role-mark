"use client";

import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";

export default function ProfilePage() {
	const { data: session, status } = useSession();
	const router = useRouter();

	useEffect(() => {
		if (status === "unauthenticated") {
			router.push("/login");
		}
	}, [status, router]);

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
				<h1 className="text-3xl font-bold tracking-tight mb-6">Profile</h1>

				<Card>
					<CardHeader>
						<CardTitle>Account Information</CardTitle>
						<CardDescription>Your account details</CardDescription>
					</CardHeader>
					<CardContent className="space-y-6">
						<div className="flex items-center gap-4">
							<Avatar className="h-20 w-20">
								<AvatarImage
									src={session.user?.image ?? undefined}
									alt={session.user?.name ?? "User"}
								/>
								<AvatarFallback className="text-2xl">
									{session.user?.name?.[0]?.toUpperCase() ?? "U"}
								</AvatarFallback>
							</Avatar>
							<div>
								<h2 className="text-2xl font-semibold">{session.user?.name}</h2>
								<p className="text-muted-foreground">{session.user?.email}</p>
							</div>
						</div>

						<div className="pt-4 border-t">
							<p className="text-sm text-muted-foreground">
								Profile editing features coming soon
							</p>
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
