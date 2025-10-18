import Link from "next/link";

export function Footer() {
	return (
		<footer className="border-t">
			<div className="container mx-auto flex flex-col items-center justify-between gap-4 py-10 md:h-24 md:flex-row md:py-0 px-4">
				<div className="flex flex-col items-center gap-4 md:flex-row md:gap-2">
					<p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
						Built with{" "}
						<Link
							href="https://nextjs.org"
							target="_blank"
							rel="noreferrer"
							className="font-medium underline underline-offset-4"
						>
							Next.js
						</Link>
						,{" "}
						<Link
							href="https://trpc.io"
							target="_blank"
							rel="noreferrer"
							className="font-medium underline underline-offset-4"
						>
							tRPC
						</Link>
						, and{" "}
						<Link
							href="https://ui.shadcn.com"
							target="_blank"
							rel="noreferrer"
							className="font-medium underline underline-offset-4"
						>
							shadcn/ui
						</Link>
						.
					</p>
				</div>
				<p className="text-center text-sm text-muted-foreground md:text-left">
					© {new Date().getFullYear()} Role Mark. All rights reserved.
				</p>
			</div>
		</footer>
	);
}
