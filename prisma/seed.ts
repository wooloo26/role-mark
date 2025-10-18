import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
	console.log("🌱 Starting database seeding...")

	// Create a demo user
	const hashedPassword = await bcrypt.hash("demo123", 10)
	const user = await prisma.user.upsert({
		where: { email: "demo@example.com" },
		update: {},
		create: {
			email: "demo@example.com",
			name: "Demo User",
			password: hashedPassword,
			settings: {
				theme: "light",
				showNSFW: false,
			},
		},
	})

	console.log("✅ Created demo user:", user.email)

	// Create sample characters
	const character1 = await prisma.character.create({
		data: {
			name: "Alice",
			info: "A brave and kind-hearted adventurer.",
			staticTags: {
				height: 165,
				weight: 52,
				birthday: "2000-03-15",
			},
			dynamicTags: ["brave", "kind", "adventurer"],
		},
	})

	const character2 = await prisma.character.create({
		data: {
			name: "Bob",
			info: "A mysterious mage with ancient knowledge.",
			staticTags: {
				height: 178,
				weight: 68,
				birthday: "1998-08-22",
			},
			dynamicTags: ["mysterious", "mage", "wise"],
		},
	})

	console.log("✅ Created sample characters:", character1.name, character2.name)

	// Create a character relationship
	await prisma.characterRelation.create({
		data: {
			fromCharacterId: character1.id,
			toCharacterId: character2.id,
			relationType: "friends",
			isBidirectional: true,
		},
	})

	console.log("✅ Created character relationship")

	// Create a sample resource
	const resource = await prisma.resource.create({
		data: {
			title: "Character Portrait Collection",
			fileUrl: "/uploads/portraits/collection-1.jpg",
			mimeType: "image/jpeg",
			uploaderId: user.id,
			dynamicTags: ["portrait", "artwork"],
			characters: {
				create: [
					{ characterId: character1.id },
					{ characterId: character2.id },
				],
			},
		},
	})

	console.log("✅ Created sample resource:", resource.title)

	// Create a sample wiki page
	const wikiPage = await prisma.wikiPage.create({
		data: {
			title: "Getting Started Guide",
			content: `# Welcome to Role Mark

This is a sample wiki page written in **Markdown**.

## Features

- Character management
- Resource library
- Wiki system with version history

Start exploring and creating your own content!`,
			authorId: user.id,
			aiSuggestionEnabled: false,
			characters: {
				create: [{ characterId: character1.id }],
			},
			versions: {
				create: {
					title: "Getting Started Guide",
					content: "# Welcome to Role Mark\n\nInitial version.",
					version: 1,
				},
			},
		},
	})

	console.log("✅ Created sample wiki page:", wikiPage.title)

	// Create a sample comment
	await prisma.comment.create({
		data: {
			content: "Alice is such an interesting character!",
			authorId: user.id,
			characters: {
				create: [{ characterId: character1.id }],
			},
		},
	})

	console.log("✅ Created sample comment")

	console.log("\n🎉 Database seeding completed successfully!")
	console.log("\n📝 Demo credentials:")
	console.log("   Email: demo@example.com")
	console.log("   Password: demo123")
}

main()
	.then(async () => {
		await prisma.$disconnect()
	})
	.catch(async (e) => {
		console.error("❌ Error during seeding:", e)
		await prisma.$disconnect()
		process.exit(1)
	})
