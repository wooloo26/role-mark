import { Shield } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"

interface ProfileHeaderProps {
	name: string
	email: string
	imageUrl?: string | null
	userRole?: string
}

export function ProfileHeader({
	name,
	email,
	imageUrl,
	userRole = "Member",
}: ProfileHeaderProps) {
	return (
		<Card className="border-1 shadow-xl overflow-hidden">
			<div className="h-32 bg-primary" />
			<CardContent className="pt-0 -mt-16">
				<div className="flex flex-col sm:flex-row items-center sm:items-end gap-6 mb-8">
					<Avatar className="h-32 w-32 border-4 border-background shadow-xl">
						<AvatarImage src={imageUrl ?? undefined} alt={name} />
						<AvatarFallback className="text-4xl font-bold">
							{name?.[0]?.toUpperCase() ?? "U"}
						</AvatarFallback>
					</Avatar>
					<div className="flex-1 text-center sm:text-left space-y-2">
						<div className="flex flex-col sm:flex-row sm:items-center gap-3">
							<h2 className="text-3xl font-bold">{name}</h2>
							<Badge variant="secondary" className="w-fit mx-auto sm:mx-0">
								<Shield className="h-3 w-3 mr-1" />
								{userRole}
							</Badge>
						</div>
						<p className="text-muted-foreground">{email}</p>
					</div>
				</div>
			</CardContent>
		</Card>
	)
}
