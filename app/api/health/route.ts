/**
 * Example API route to test tRPC setup
 * Access at: http://localhost:3000/api/health
 */
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
	try {
		// Test database connection
		await prisma.$queryRaw`SELECT 1`

		return NextResponse.json({
			status: "ok",
			message: "tRPC API is running",
			timestamp: new Date().toISOString(),
			endpoints: {
				trpc: "/api/trpc",
				docs: "/docs/TRPC_GUIDE.md",
			},
		})
	} catch (error) {
		return NextResponse.json(
			{
				status: "error",
				message: "Database connection failed",
				error: error instanceof Error ? error.message : "Unknown error",
			},
			{ status: 500 },
		)
	}
}
