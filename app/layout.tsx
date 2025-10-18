import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";
import { SessionProvider } from "@/components/providers/session-provider";
import { ThemeProvider, ThemeScript } from "@/components/theme/theme-provider";
import { TRPCProvider } from "@/lib/trpc/provider";
import "./globals.css";

const geistSans = Geist({
	variable: "--font-geist-sans",
	subsets: ["latin"],
});

const geistMono = Geist_Mono({
	variable: "--font-geist-mono",
	subsets: ["latin"],
});

export const metadata: Metadata = {
	title: "Role Mark",
	description: "Character, Resource, and Wiki Management System",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
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
							<div className="relative flex min-h-screen flex-col">
								<Header />
								<main className="flex-1 container mx-auto px-4 py-8">
									{children}
								</main>
								<Footer />
							</div>
						</TRPCProvider>
					</SessionProvider>
				</ThemeProvider>
			</body>
		</html>
	);
}
