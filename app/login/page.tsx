"use client"

import { Loader2, Lock, LogIn, Mail } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { signIn } from "next-auth/react"
import React from "react"
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
import { cn } from "@/lib/utils"

export default function LoginPage() {
	const router = useRouter()
	const [email, setEmail] = React.useState("")
	const [password, setPassword] = React.useState("")
	const [isLoading, setIsLoading] = React.useState(false)
	const [error, setError] = React.useState("")

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		setIsLoading(true)
		setError("")

		try {
			const result = await signIn("credentials", {
				email,
				password,
				redirect: false,
			})

			if (result?.error) {
				setError("Invalid email or password")
			} else {
				router.push("/")
				router.refresh()
			}
		} catch (error) {
			setError("An error occurred. Please try again.")
			console.error(error)
		} finally {
			setIsLoading(false)
		}
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
						<LogIn className="h-8 w-8 text-primary" />
					</div>
					<CardTitle className="text-3xl font-bold tracking-tight">
						Welcome Back
					</CardTitle>
					<CardDescription className="text-base">
						Enter your credentials to access your account
					</CardDescription>
				</CardHeader>
				<form onSubmit={handleSubmit}>
					<CardContent className="space-y-5">
						{error && (
							<div className="p-4 text-sm font-medium text-destructive bg-destructive/10 border border-destructive/20 rounded-lg">
								{error}
							</div>
						)}
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
									disabled={isLoading}
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
									disabled={isLoading}
									className="pl-10 h-11"
								/>
							</div>
						</div>
					</CardContent>
					<CardFooter className="flex flex-col space-y-4 pt-6">
						<ShimmerButton
							type="submit"
							className="w-full h-11 shadow-lg"
							disabled={isLoading}
							shimmerSize="0.15em"
						>
							{isLoading ? (
								<>
									<Loader2 className="mr-2 h-4 w-4 animate-spin" />
									Signing In...
								</>
							) : (
								<>
									<LogIn className="mr-2 h-4 w-4" />
									Sign In
								</>
							)}
						</ShimmerButton>
						<p className="text-sm text-center text-muted-foreground">
							Don't have an account?{" "}
							<Link
								href="/register"
								className="font-medium text-primary hover:underline underline-offset-4"
							>
								Create one
							</Link>
						</p>
					</CardFooter>
				</form>
			</Card>
		</div>
	)
}
