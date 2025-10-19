"use client"

import { Lock, LogIn, Mail } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { signIn } from "next-auth/react"
import React from "react"
import { AuthCard } from "@/components/auth/auth-card"
import { ErrorMessage } from "@/components/auth/error-message"
import { FormInput } from "@/components/auth/form-input"
import { SubmitButton } from "@/components/auth/submit-button"

export function LoginForm() {
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
		<AuthCard
			icon={LogIn}
			title="Welcome Back"
			description="Enter your credentials to access your account"
			onSubmit={handleSubmit}
			footer={
				<>
					<SubmitButton
						isLoading={isLoading}
						loadingText="Signing In..."
						icon={LogIn}
					>
						Sign In
					</SubmitButton>
					<p className="text-sm text-center text-muted-foreground">
						Don't have an account?{" "}
						<Link
							href="/register"
							className="font-medium text-primary hover:underline underline-offset-4"
						>
							Create one
						</Link>
					</p>
				</>
			}
		>
			<div className="space-y-5">
				<ErrorMessage message={error} />
				<FormInput
					label="Email Address"
					icon={Mail}
					type="email"
					placeholder="your.email@example.com"
					value={email}
					onChange={setEmail}
					required
					disabled={isLoading}
				/>
				<FormInput
					label="Password"
					icon={Lock}
					type="password"
					placeholder="••••••••"
					value={password}
					onChange={setPassword}
					required
					disabled={isLoading}
				/>
			</div>
		</AuthCard>
	)
}
