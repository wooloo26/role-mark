import { PrismaClient } from "@prisma/client"

const globalForPrisma = globalThis as unknown as {
	prisma: PrismaClient | undefined
}

const basePrisma =
	globalForPrisma.prisma ??
	new PrismaClient({
		log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
	})

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = basePrisma

// Soft delete extension - automatically exclude soft-deleted records
export const prisma = basePrisma.$extends({
	name: "softDelete",
	query: {
		user: {
			async findUnique({ args, query }) {
				args.where = { ...args.where, deletedAt: null }
				return query(args)
			},
			async findFirst({ args, query }) {
				args.where = { ...args.where, deletedAt: null }
				return query(args)
			},
			async findMany({ args, query }) {
				args.where = { ...args.where, deletedAt: null }
				return query(args)
			},
			async update({ args, query }) {
				args.where = { ...args.where, deletedAt: null }
				return query(args)
			},
			async updateMany({ args, query }) {
				args.where = { ...args.where, deletedAt: null }
				return query(args)
			},
		},
		comment: {
			async findUnique({ args, query }) {
				args.where = { ...args.where, deletedAt: null }
				return query(args)
			},
			async findFirst({ args, query }) {
				args.where = { ...args.where, deletedAt: null }
				return query(args)
			},
			async findMany({ args, query }) {
				args.where = { ...args.where, deletedAt: null }
				return query(args)
			},
			async update({ args, query }) {
				args.where = { ...args.where, deletedAt: null }
				return query(args)
			},
			async updateMany({ args, query }) {
				args.where = { ...args.where, deletedAt: null }
				return query(args)
			},
		},
		character: {
			async findUnique({ args, query }) {
				args.where = { ...args.where, deletedAt: null }
				return query(args)
			},
			async findFirst({ args, query }) {
				args.where = { ...args.where, deletedAt: null }
				return query(args)
			},
			async findMany({ args, query }) {
				args.where = { ...args.where, deletedAt: null }
				return query(args)
			},
			async update({ args, query }) {
				args.where = { ...args.where, deletedAt: null }
				return query(args)
			},
			async updateMany({ args, query }) {
				args.where = { ...args.where, deletedAt: null }
				return query(args)
			},
		},
		resource: {
			async findUnique({ args, query }) {
				args.where = { ...args.where, deletedAt: null }
				return query(args)
			},
			async findFirst({ args, query }) {
				args.where = { ...args.where, deletedAt: null }
				return query(args)
			},
			async findMany({ args, query }) {
				args.where = { ...args.where, deletedAt: null }
				return query(args)
			},
			async update({ args, query }) {
				args.where = { ...args.where, deletedAt: null }
				return query(args)
			},
			async updateMany({ args, query }) {
				args.where = { ...args.where, deletedAt: null }
				return query(args)
			},
		},
		resourceFile: {
			async findUnique({ args, query }) {
				args.where = { ...args.where, deletedAt: null }
				return query(args)
			},
			async findFirst({ args, query }) {
				args.where = { ...args.where, deletedAt: null }
				return query(args)
			},
			async findMany({ args, query }) {
				args.where = { ...args.where, deletedAt: null }
				return query(args)
			},
			async update({ args, query }) {
				args.where = { ...args.where, deletedAt: null }
				return query(args)
			},
			async updateMany({ args, query }) {
				args.where = { ...args.where, deletedAt: null }
				return query(args)
			},
		},
		wikiPage: {
			async findUnique({ args, query }) {
				args.where = { ...args.where, deletedAt: null }
				return query(args)
			},
			async findFirst({ args, query }) {
				args.where = { ...args.where, deletedAt: null }
				return query(args)
			},
			async findMany({ args, query }) {
				args.where = { ...args.where, deletedAt: null }
				return query(args)
			},
			async update({ args, query }) {
				args.where = { ...args.where, deletedAt: null }
				return query(args)
			},
			async updateMany({ args, query }) {
				args.where = { ...args.where, deletedAt: null }
				return query(args)
			},
		},
	},
}) as typeof basePrisma
