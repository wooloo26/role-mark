"use client"

import { Network, TrendingUp, Users } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DotPattern } from "@/components/ui/dot-pattern"
import { cn } from "@/lib/utils"

interface RelationStatsCardsProps {
	totalRelations: number
	outgoingCount: number
	incomingCount: number
	bidirectionalCount: number
}

export function RelationStatsCards({
	totalRelations,
	outgoingCount,
	incomingCount,
	bidirectionalCount,
}: RelationStatsCardsProps) {
	return (
		<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
			<Card className="relative overflow-hidden">
				<DotPattern
					className={cn(
						"[mask-image:radial-gradient(300px_circle_at_center,white,transparent)]",
					)}
				/>
				<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
					<CardTitle className="text-sm font-medium">Total Relations</CardTitle>
					<Network className="h-4 w-4 text-muted-foreground" />
				</CardHeader>
				<CardContent>
					<div className="text-2xl font-bold">{totalRelations}</div>
					<p className="text-xs text-muted-foreground">
						All character relationships
					</p>
				</CardContent>
			</Card>

			<Card className="relative overflow-hidden">
				<DotPattern
					className={cn(
						"[mask-image:radial-gradient(300px_circle_at_center,white,transparent)]",
					)}
				/>
				<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
					<CardTitle className="text-sm font-medium">Outgoing</CardTitle>
					<TrendingUp className="h-4 w-4 text-muted-foreground" />
				</CardHeader>
				<CardContent>
					<div className="text-2xl font-bold">{outgoingCount}</div>
					<p className="text-xs text-muted-foreground">
						Relations initiated by this character
					</p>
				</CardContent>
			</Card>

			<Card className="relative overflow-hidden">
				<DotPattern
					className={cn(
						"[mask-image:radial-gradient(300px_circle_at_center,white,transparent)]",
					)}
				/>
				<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
					<CardTitle className="text-sm font-medium">Incoming</CardTitle>
					<Users className="h-4 w-4 text-muted-foreground" />
				</CardHeader>
				<CardContent>
					<div className="text-2xl font-bold">{incomingCount}</div>
					<p className="text-xs text-muted-foreground">
						Relations from other characters
					</p>
				</CardContent>
			</Card>

			<Card className="relative overflow-hidden">
				<DotPattern
					className={cn(
						"[mask-image:radial-gradient(300px_circle_at_center,white,transparent)]",
					)}
				/>
				<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
					<CardTitle className="text-sm font-medium">Bidirectional</CardTitle>
					<Network className="h-4 w-4 text-muted-foreground" />
				</CardHeader>
				<CardContent>
					<div className="text-2xl font-bold">{bidirectionalCount}</div>
					<p className="text-xs text-muted-foreground">Mutual relationships</p>
				</CardContent>
			</Card>
		</div>
	)
}
