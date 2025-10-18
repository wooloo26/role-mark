/**
 * Export all tRPC-related utilities for easier imports
 */

// Types
export type { AppRouter } from "@/server/routers/_app"
// Client-side hooks
export { trpc } from "./client"

// Provider component
export { TRPCProvider } from "./provider"
// Server-side caller
export { api } from "./server"
