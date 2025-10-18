import { Github, Heart } from "lucide-react"
import Link from "next/link"

const footerLinks = {
	product: [
		{ name: "Characters", href: "/characters" },
		{ name: "Resources", href: "/resources" },
		{ name: "Wiki", href: "/wiki" },
	],
	company: [
		{ name: "About", href: "/about" },
		{ name: "Settings", href: "/settings" },
		{ name: "Profile", href: "/profile" },
	],
}

export function Footer() {
	return (
		<footer className="border-t border-border/40 bg-secondary/20 mx-auto">
			<div className="container px-4 py-12">
				<div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
					{/* Brand */}
					<div className="space-y-4">
						<Link href="/" className="inline-block">
							<span className="font-bold text-2xl bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
								Role Mark
							</span>
						</Link>
						<p className="text-sm text-muted-foreground max-w-xs">
							A comprehensive platform for managing characters, resources, and
							wiki content.
						</p>
					</div>

					{/* Product Links */}
					<div>
						<h3 className="font-semibold mb-4">Product</h3>
						<ul className="space-y-3">
							{footerLinks.product.map((link) => (
								<li key={link.href}>
									<Link
										href={link.href}
										className="text-sm text-muted-foreground hover:text-foreground transition-colors"
									>
										{link.name}
									</Link>
								</li>
							))}
						</ul>
					</div>

					{/* Company Links */}
					<div>
						<h3 className="font-semibold mb-4">Company</h3>
						<ul className="space-y-3">
							{footerLinks.company.map((link) => (
								<li key={link.href}>
									<Link
										href={link.href}
										className="text-sm text-muted-foreground hover:text-foreground transition-colors"
									>
										{link.name}
									</Link>
								</li>
							))}
						</ul>
					</div>

					{/* Tech Stack */}
					<div>
						<h3 className="font-semibold mb-4">Built With</h3>
						<ul className="space-y-3">
							<li>
								<Link
									href="https://nextjs.org"
									target="_blank"
									rel="noreferrer"
									className="text-sm text-muted-foreground hover:text-foreground transition-colors"
								>
									Next.js
								</Link>
							</li>
							<li>
								<Link
									href="https://trpc.io"
									target="_blank"
									rel="noreferrer"
									className="text-sm text-muted-foreground hover:text-foreground transition-colors"
								>
									tRPC
								</Link>
							</li>
							<li>
								<Link
									href="https://ui.shadcn.com"
									target="_blank"
									rel="noreferrer"
									className="text-sm text-muted-foreground hover:text-foreground transition-colors"
								>
									shadcn/ui
								</Link>
							</li>
							<li>
								<Link
									href="https://magicui.design"
									target="_blank"
									rel="noreferrer"
									className="text-sm text-muted-foreground hover:text-foreground transition-colors"
								>
									Magic UI
								</Link>
							</li>
						</ul>
					</div>
				</div>

				{/* Bottom Bar */}
				<div className="pt-8 border-t border-border/40 flex flex-col md:flex-row items-center justify-between gap-4">
					<p className="text-sm text-muted-foreground flex items-center gap-1">
						© {new Date().getFullYear()} Role Mark. Made with{" "}
						<Heart className="h-3 w-3 text-red-500 fill-red-500" /> by the
						community.
					</p>
					<div className="flex items-center gap-4">
						<Link
							href="https://github.com"
							target="_blank"
							rel="noreferrer"
							className="text-muted-foreground hover:text-foreground transition-colors"
						>
							<Github className="h-5 w-5" />
						</Link>
					</div>
				</div>
			</div>
		</footer>
	)
}
