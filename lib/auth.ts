/**
 * NextAuth configuration
 * This is a placeholder - you'll need to configure your auth providers
 */

import { PrismaAdapter } from "@next-auth/prisma-adapter"
import { compare } from "bcryptjs"
import type { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { prisma } from "@/lib/prisma"

export const authOptions: NextAuthOptions = {
	adapter: PrismaAdapter(prisma),
	session: {
		strategy: "jwt",
	},
	pages: {
		signIn: "/login",
	},
	providers: [
		CredentialsProvider({
			name: "credentials",
			credentials: {
				email: { label: "Email", type: "email" },
				password: { label: "Password", type: "password" },
			},
			async authorize(credentials) {
				if (!credentials?.email || !credentials?.password) {
					return null
				}

				const user = await prisma.user.findUnique({
					where: {
						email: credentials.email,
					},
				})

				if (!user || !user.password) {
					return null
				}

				const isPasswordValid = await compare(
					credentials.password,
					user.password,
				)

				if (!isPasswordValid) {
					return null
				}

				return {
					id: user.id,
					email: user.email,
					name: user.name,
					image: user.image,
				}
			},
		}),
	],
	callbacks: {
		async session({ session, token }) {
			if (token && session.user) {
				session.user.id = token.id
				session.user.name = token.name
				session.user.email = token.email
				session.user.image = token.picture
			}

			return session
		},
		async jwt({ token, user }) {
			if (user) {
				token.id = user.id
			}

			return token
		},
	},
}
