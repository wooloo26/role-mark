"use client"

import { Calendar, Loader2, User } from "lucide-react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { useEffect } from "react"
import { PageLayout } from "@/components/layout/page-layout"
import { ProfileHeader } from "@/components/profile/profile-header"
import { ProfileInfoCard } from "@/components/profile/profile-info-card"
import { Separator } from "@/components/ui/separator"

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

	const accountDetails = [
		{
			label: "Display Name",
			value: session.user?.name || "N/A",
		},
		{
			label: "Email Address",
			value: session.user?.email || "N/A",
		},
	]

	const activityDetails = [
		{
			label: "Member Since",
			value: new Date().toLocaleDateString("en-US", {
				month: "long",
				year: "numeric",
			}),
		},
		{
			label: "Last Login",
			value: new Date().toLocaleDateString(),
		},
	]

	return (
		<PageLayout maxWidth="6xl">
			<ProfileHeader
				name={session.user?.name || "User"}
				email={session.user?.email || ""}
				imageUrl={session.user?.image}
				userRole="Member"
			/>

			<Separator className="my-8" />

			<div className="grid gap-6 md:grid-cols-2">
				<ProfileInfoCard
					icon={User}
					title="Account Details"
					items={accountDetails}
				/>
				<ProfileInfoCard
					icon={Calendar}
					title="Activity"
					items={activityDetails}
				/>
			</div>

			<div className="mt-8 p-4 bg-muted/50 rounded-lg border">
				<p className="text-sm text-muted-foreground text-center">
					🚧 Profile editing features coming soon
				</p>
			</div>
		</PageLayout>
	)
}
