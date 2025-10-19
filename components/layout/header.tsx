"use client"

import { LogIn, LogOut, Settings, User } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { signOut, useSession } from "next-auth/react"
import { ThemeToggle } from "@/components/theme/theme-toggle"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const navigation = [
	{ name: "Characters", href: "/characters" },
	{ name: "Resources", href: "/resources" },
	{ name: "Wiki", href: "/wiki" },
	{ name: "Tags", href: "/tags" },
	{ name: "Attributes", href: "/static-tags" },
	{ name: "Relations", href: "/relations" },
]

export function Header() {
	const pathname = usePathname()
	const { data: session, status } = useSession()

	return (
		<header className="sticky top-0 z-50 w-full border-b-1 border-border/40 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60 ">
			<div className="container mx-auto flex h-16 items-center px-4">
				<div className="mr-4 flex">
					<Link
						href="/"
						className="mr-8 flex items-center space-x-2 group transition-all"
					>
						<span className="font-bold text-xl bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent group-hover:from-primary/80 group-hover:to-primary/40 transition-all">
							Role Mark
						</span>
					</Link>
					<nav className="hidden md:flex items-center space-x-1 text-sm font-medium">
						{navigation.map((item) => (
							<Link
								key={item.href}
								href={item.href}
								className={`px-4 py-2 rounded-md transition-all ${
									pathname === item.href
										? "text-foreground bg-secondary"
										: "text-foreground/60 hover:text-foreground hover:bg-secondary/50"
								}`}
							>
								{item.name}
							</Link>
						))}
					</nav>
				</div>
				<div className="ml-auto flex items-center space-x-2">
					<ThemeToggle />
					{status === "loading" ? (
						<div className="h-10 w-10 rounded-full bg-secondary/50 animate-pulse" />
					) : session ? (
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<Button
									variant="ghost"
									className="relative h-10 w-10 rounded-full"
								>
									<Avatar className="h-10 w-10">
										<AvatarImage
											src={session.user?.image ?? undefined}
											alt={session.user?.name ?? "User"}
										/>
										<AvatarFallback>
											{session.user?.name?.[0]?.toUpperCase() ?? "U"}
										</AvatarFallback>
									</Avatar>
								</Button>
							</DropdownMenuTrigger>
							<DropdownMenuContent className="w-56" align="end" forceMount>
								<DropdownMenuLabel className="font-normal">
									<div className="flex flex-col space-y-1">
										<p className="text-sm font-medium leading-none">
											{session.user?.name}
										</p>
										<p className="text-xs leading-none text-muted-foreground">
											{session.user?.email}
										</p>
									</div>
								</DropdownMenuLabel>
								<DropdownMenuSeparator />
								<DropdownMenuItem asChild>
									<Link href="/profile" className="cursor-pointer">
										<User className="mr-2 h-4 w-4" />
										<span>Profile</span>
									</Link>
								</DropdownMenuItem>
								<DropdownMenuItem asChild>
									<Link href="/settings" className="cursor-pointer">
										<Settings className="mr-2 h-4 w-4" />
										<span>Settings</span>
									</Link>
								</DropdownMenuItem>
								<DropdownMenuSeparator />
								<DropdownMenuItem
									className="cursor-pointer"
									onClick={() => signOut({ callbackUrl: "/" })}
								>
									<LogOut className="mr-2 h-4 w-4" />
									<span>Log out</span>
								</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>
					) : (
						<Button asChild>
							<Link href="/login">
								<LogIn className="mr-2 h-4 w-4" />
								Login
							</Link>
						</Button>
					)}
				</div>
			</div>
		</header>
	)
}
