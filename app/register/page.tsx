"use client"

import { Loader2, Lock, Mail, User, UserPlus } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import React, { useState } from "react"
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card"
import { DotPattern } from "@/components/ui/dot-pattern"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ShimmerButton } from "@/components/ui/shimmer-button"
import { trpc } from "@/lib/trpc/client"
import { cn } from "@/lib/utils"

export default function RegisterPage() {
	const router = useRouter()
	const [name, setName] = useState("")
	const [email, setEmail] = useState("")
	const [password, setPassword] = useState("")
	const [confirmPassword, setConfirmPassword] = useState("")
	const [error, setError] = useState("")

	const registerMutation = trpc.user.register.useMutation({
		onSuccess: () => {
			router.push("/login?registered=true")
		},
		onError: (error: { message: string }) => {
			setError(error.message)
		},
	})

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		setError("")

		if (password !== confirmPassword) {
			setError("Passwords do not match")
			return
		}

		if (password.length < 6) {
			setError("Password must be at least 6 characters")
			return
		}

		registerMutation.mutate({
			name,
			email,
			password,
		})
	}

	return (
		<div className="container relative flex items-center justify-center min-h-[calc(100vh-200px)] mx-auto py-8 overflow-hidden">
			<DotPattern
				className={cn(
					"[mask-image:radial-gradient(500px_circle_at_center,white,transparent)]",
					"absolute inset-0",
				)}
			/>
			<Card className="w-full max-w-md relative z-10 border-1 shadow-2xl backdrop-blur-sm bg-background/95">
				<CardHeader className="space-y-1 text-center pb-6">
					<div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
						<UserPlus className="h-8 w-8 text-primary" />
					</div>
					<CardTitle className="text-3xl font-bold tracking-tight">
						Create Account
					</CardTitle>
					<CardDescription className="text-base">
						Sign up to start managing your characters and resources
					</CardDescription>
				</CardHeader>
				<form onSubmit={handleSubmit}>
					<CardContent className="space-y-4">
						{error && (
							<div className="p-4 text-sm font-medium text-destructive bg-destructive/10 border border-destructive/20 rounded-lg">
								{error}
							</div>
						)}
						<div className="space-y-2">
							<Label htmlFor="name" className="text-sm font-medium">
								Full Name
							</Label>
							<div className="relative">
								<User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
								<Input
									id={React.useId()}
									type="text"
									placeholder="John Doe"
									value={name}
									onChange={(e) => setName(e.target.value)}
									required
									disabled={registerMutation.isPending}
									className="pl-10 h-11"
								/>
							</div>
						</div>
						<div className="space-y-2">
							<Label htmlFor="email" className="text-sm font-medium">
								Email Address
							</Label>
							<div className="relative">
								<Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
								<Input
									id={React.useId()}
									type="email"
									placeholder="your.email@example.com"
									value={email}
									onChange={(e) => setEmail(e.target.value)}
									required
									disabled={registerMutation.isPending}
									className="pl-10 h-11"
								/>
							</div>
						</div>
						<div className="space-y-2">
							<Label htmlFor="password" className="text-sm font-medium">
								Password
							</Label>
							<div className="relative">
								<Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
								<Input
									id={React.useId()}
									type="password"
									placeholder="••••••••"
									value={password}
									onChange={(e) => setPassword(e.target.value)}
									required
									disabled={registerMutation.isPending}
									className="pl-10 h-11"
								/>
							</div>
							<p className="text-xs text-muted-foreground">
								Must be at least 6 characters
							</p>
						</div>
						<div className="space-y-2">
							<Label htmlFor="confirmPassword" className="text-sm font-medium">
								Confirm Password
							</Label>
							<div className="relative">
								<Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
								<Input
									id={React.useId()}
									type="password"
									placeholder="••••••••"
									value={confirmPassword}
									onChange={(e) => setConfirmPassword(e.target.value)}
									required
									disabled={registerMutation.isPending}
									className="pl-10 h-11"
								/>
							</div>
						</div>
					</CardContent>
					<CardFooter className="flex flex-col space-y-4 pt-6">
						<ShimmerButton
							type="submit"
							className="w-full h-11 shadow-lg"
							disabled={registerMutation.isPending}
							shimmerSize="0.15em"
						>
							{registerMutation.isPending ? (
								<>
									<Loader2 className="mr-2 h-4 w-4 animate-spin" />
									Creating Account...
								</>
							) : (
								<>
									<UserPlus className="mr-2 h-4 w-4" />
									Create Account
								</>
							)}
						</ShimmerButton>
						<p className="text-sm text-center text-muted-foreground">
							Already have an account?{" "}
							<Link
								href="/login"
								className="font-medium text-primary hover:underline underline-offset-4"
							>
								Sign In
							</Link>
						</p>
					</CardFooter>
				</form>
			</Card>
		</div>
	)
}
