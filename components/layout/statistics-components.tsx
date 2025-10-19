import type { ReactNode } from "react"

interface StatCardProps {
	label: string
	value: number | string
	className?: string
}

export function StatCard({ label, value, className = "" }: StatCardProps) {
	return (
		<div className={`rounded-lg border bg-card p-6 ${className}`}>
			<h3 className="text-sm font-medium text-muted-foreground">{label}</h3>
			<p className="mt-2 text-3xl font-bold">{value}</p>
		</div>
	)
}

interface StatGridProps {
	children: ReactNode
	className?: string
}

export function StatGrid({
	children,
	className = "grid gap-6 md:grid-cols-2 lg:grid-cols-3",
}: StatGridProps) {
	return <div className={className}>{children}</div>
}

interface UsageCardProps {
	title: string
	subtitle?: string
	count: number
	countLabel?: string
}

export function UsageCard({
	title,
	subtitle,
	count,
	countLabel = "",
}: UsageCardProps) {
	return (
		<div className="flex items-center justify-between rounded-lg border bg-card p-4">
			<div>
				<h4 className="font-medium">{title}</h4>
				{subtitle && (
					<p className="text-sm text-muted-foreground">{subtitle}</p>
				)}
			</div>
			<div className="text-right">
				<p className="text-2xl font-bold text-primary">{count}</p>
				{countLabel && (
					<p className="text-xs text-muted-foreground">{countLabel}</p>
				)}
			</div>
		</div>
	)
}

interface UsageListProps {
	title: string
	children: ReactNode
	emptyMessage?: string
	showEmpty?: boolean
}

export function UsageList({
	title,
	children,
	emptyMessage = "No data available.",
	showEmpty = false,
}: UsageListProps) {
	// Check if children is an array and empty, or falsy
	const isEmpty =
		!children ||
		(Array.isArray(children) && children.length === 0) ||
		(Array.isArray(children) && children.every((child) => !child))

	return (
		<div className="space-y-4">
			<h3 className="text-xl font-semibold">{title}</h3>
			<div className="space-y-2">
				{!isEmpty && children}
				{isEmpty && showEmpty && (
					<p className="text-center text-muted-foreground py-8">
						{emptyMessage}
					</p>
				)}
			</div>
		</div>
	)
}
