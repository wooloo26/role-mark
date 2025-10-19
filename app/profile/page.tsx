"use client"

import { Calendar, Loader2, Mail, Shield, User } from "lucide-react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { useEffect } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DotPattern } from "@/components/ui/dot-pattern"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"

export default function ProfilePage() {
	const { data: session, status } = useSession()
	const router = useRouter()

	useEffect(() => {
		if (status === "unauthenticated") {
			router.push("/login")
		}
	}, [status, router])

	if (status === "loading") {
		return (
			<div className="flex items-center justify-center min-h-[calc(100vh-500px)]">
				<Loader2 className="h-8 w-8 animate-spin text-primary" />
			</div>
		)
	}

	if (!session) {
		return null
	}

	return (
		<div className="container relative py-8 overflow-hidden mx-auto">
			<DotPattern
				className={cn(
					"[mask-image:radial-gradient(600px_circle_at_center,white,transparent)]",
					"absolute inset-0 -z-10",
				)}
			/>
			<Card className="border-1 shadow-xl overflow-hidden">
				<div className="h-32 bg-primary" />
				<CardContent className="pt-0 -mt-16">
					<div className="flex flex-col sm:flex-row items-center sm:items-end gap-6 mb-8">
						<Avatar className="h-32 w-32 border-4 border-background shadow-xl">
							<AvatarImage
								src={session.user?.image ?? undefined}
								alt={session.user?.name ?? "User"}
							/>
							<AvatarFallback className="text-4xl font-bold">
								{session.user?.name?.[0]?.toUpperCase() ?? "U"}
							</AvatarFallback>
						</Avatar>
						<div className="flex-1 text-center sm:text-left space-y-2">
							<div className="flex flex-col sm:flex-row sm:items-center gap-3">
								<h2 className="text-3xl font-bold">{session.user?.name}</h2>
								<Badge variant="secondary" className="w-fit mx-auto sm:mx-0">
									<Shield className="h-3 w-3 mr-1" />
									Member
								</Badge>
							</div>
							<p className="text-muted-foreground flex items-center justify-center sm:justify-start gap-2">
								<Mail className="h-4 w-4" />
								{session.user?.email}
							</p>
						</div>
					</div>

					<Separator className="my-8" />

					<div className="grid gap-6 md:grid-cols-2">
						<Card className="border-muted">
							<CardHeader>
								<CardTitle className="flex items-center gap-2 text-lg">
									<User className="h-5 w-5 text-primary" />
									Account Details
								</CardTitle>
							</CardHeader>
							<CardContent className="space-y-4">
								<div className="space-y-1">
									<p className="text-sm font-medium text-muted-foreground">
										Display Name
									</p>
									<p className="text-base font-medium">{session.user?.name}</p>
								</div>
								<div className="space-y-1">
									<p className="text-sm font-medium text-muted-foreground">
										Email Address
									</p>
									<p className="text-base font-medium">{session.user?.email}</p>
								</div>
							</CardContent>
						</Card>

						<Card className="border-muted">
							<CardHeader>
								<CardTitle className="flex items-center gap-2 text-lg">
									<Calendar className="h-5 w-5 text-primary" />
									Activity
								</CardTitle>
							</CardHeader>
							<CardContent className="space-y-4">
								<div className="space-y-1">
									<p className="text-sm font-medium text-muted-foreground">
										Member Since
									</p>
									<p className="text-base font-medium">
										{new Date().toLocaleDateString("en-US", {
											month: "long",
											year: "numeric",
										})}
									</p>
								</div>
								<div className="space-y-1">
									<p className="text-sm font-medium text-muted-foreground">
										Last Login
									</p>
									<p className="text-base font-medium">
										{new Date().toLocaleDateString()}
									</p>
								</div>
							</CardContent>
						</Card>
					</div>

					<div className="mt-8 p-4 bg-muted/50 rounded-lg border">
						<p className="text-sm text-muted-foreground text-center">
							🚧 Profile editing features coming soon
						</p>
					</div>
				</CardContent>
			</Card>
		</div>
	)
}
