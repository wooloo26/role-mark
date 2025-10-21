import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { TRPCProvider } from "@/client/trpc"
import { Footer } from "@/components/layout/footer"
import { Header } from "@/components/layout/header"
import { SessionProvider } from "@/components/providers/session-provider"
import { ThemeProvider, ThemeScript } from "@/components/theme/theme-provider"
import "./globals.css"
import { Toaster } from "@/components/ui/sonner"

const geistSans = Geist({
	variable: "--font-geist-sans",
	subsets: ["latin"],
})

const geistMono = Geist_Mono({
	variable: "--font-geist-mono",
	subsets: ["latin"],
})

export const metadata: Metadata = {
	title: "Role Mark",
	description: "Character, Resource, and Wiki Management System",
}

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode
}>) {
	return (
		<html lang="en" suppressHydrationWarning>
			<body
				className={`${geistSans.variable} ${geistMono.variable} antialiased`}
			>
				<ThemeProvider
					attribute="class"
					defaultTheme="system"
					enableSystem
					disableTransitionOnChange
				>
					<ThemeScript />
					<SessionProvider>
						<TRPCProvider>
							<div className="relative flex min-h-screen flex-col bg-gradient-to-br from-background via-background to-muted/20">
								<Header />
								<main className="flex-1 w-full">{children}</main>
								<Footer />
								<Toaster />
							</div>
						</TRPCProvider>
					</SessionProvider>
				</ThemeProvider>
			</body>
		</html>
	)
}
