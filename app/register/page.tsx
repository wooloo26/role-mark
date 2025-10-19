"use client"

import { Lock, Mail, User, UserPlus } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { AuthCard } from "@/components/auth/auth-card"
import { AuthLayout } from "@/components/auth/auth-layout"
import { ErrorMessage } from "@/components/auth/error-message"
import { FormInput } from "@/components/auth/form-input"
import { SubmitButton } from "@/components/auth/submit-button"
import { trpc } from "@/lib/trpc/client"

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
		<AuthLayout>
			<AuthCard
				icon={UserPlus}
				title="Create Account"
				description="Sign up to start managing your characters and resources"
				onSubmit={handleSubmit}
				footer={
					<>
						<SubmitButton
							isLoading={registerMutation.isPending}
							loadingText="Creating Account..."
							icon={UserPlus}
						>
							Create Account
						</SubmitButton>
						<p className="text-sm text-center text-muted-foreground">
							Already have an account?{" "}
							<Link
								href="/login"
								className="font-medium text-primary hover:underline underline-offset-4"
							>
								Sign In
							</Link>
						</p>
					</>
				}
			>
				<div className="space-y-4">
					<ErrorMessage message={error} />
					<FormInput
						label="Full Name"
						icon={User}
						type="text"
						placeholder="John Doe"
						value={name}
						onChange={setName}
						required
						disabled={registerMutation.isPending}
					/>
					<FormInput
						label="Email Address"
						icon={Mail}
						type="email"
						placeholder="your.email@example.com"
						value={email}
						onChange={setEmail}
						required
						disabled={registerMutation.isPending}
					/>
					<FormInput
						label="Password"
						icon={Lock}
						type="password"
						placeholder="••••••••"
						value={password}
						onChange={setPassword}
						required
						disabled={registerMutation.isPending}
						helperText="Must be at least 6 characters"
					/>
					<FormInput
						label="Confirm Password"
						icon={Lock}
						type="password"
						placeholder="••••••••"
						value={confirmPassword}
						onChange={setConfirmPassword}
						required
						disabled={registerMutation.isPending}
					/>
				</div>
			</AuthCard>
		</AuthLayout>
	)
}
