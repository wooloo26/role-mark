import { PrismaClient, TagScope } from "@prisma/client"
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

	// Create tag groups for characters
	const personalityGroup = await prisma.tagGroup.create({
		data: {
			name: "Personality",
			scope: TagScope.CHARACTER,
		},
	})

	const roleGroup = await prisma.tagGroup.create({
		data: {
			name: "Role",
			scope: TagScope.CHARACTER,
		},
	})

	console.log("✅ Created character tag groups")

	// Create tag groups for resources
	const resourceTypeGroup = await prisma.tagGroup.create({
		data: {
			name: "Type",
			scope: TagScope.RESOURCE,
		},
	})

	console.log("✅ Created resource tag groups")

	// Create character tags
	const braveTag = await prisma.tag.create({
		data: {
			name: "Brave",
			slug: "brave",
			scope: TagScope.CHARACTER,
			groupId: personalityGroup.id,
		},
	})

	const kindTag = await prisma.tag.create({
		data: {
			name: "Kind",
			slug: "kind",
			scope: TagScope.CHARACTER,
			groupId: personalityGroup.id,
		},
	})

	const adventurerTag = await prisma.tag.create({
		data: {
			name: "Adventurer",
			slug: "adventurer",
			scope: TagScope.CHARACTER,
			groupId: roleGroup.id,
		},
	})

	const mysteriousTag = await prisma.tag.create({
		data: {
			name: "Mysterious",
			slug: "mysterious",
			scope: TagScope.CHARACTER,
			groupId: personalityGroup.id,
		},
	})

	const mageTag = await prisma.tag.create({
		data: {
			name: "Mage",
			slug: "mage",
			scope: TagScope.CHARACTER,
			groupId: roleGroup.id,
		},
	})

	const wiseTag = await prisma.tag.create({
		data: {
			name: "Wise",
			slug: "wise",
			scope: TagScope.CHARACTER,
			groupId: personalityGroup.id,
		},
	})

	console.log("✅ Created character tags")

	// Create resource tags
	const portraitTag = await prisma.tag.create({
		data: {
			name: "Portrait",
			slug: "portrait",
			scope: TagScope.RESOURCE,
			groupId: resourceTypeGroup.id,
		},
	})

	const artworkTag = await prisma.tag.create({
		data: {
			name: "Artwork",
			slug: "artwork",
			scope: TagScope.RESOURCE,
			groupId: resourceTypeGroup.id,
		},
	})

	console.log("✅ Created resource tags")

	// Create sample characters with tags
	const character1 = await prisma.character.create({
		data: {
			name: "Alice",
			info: "A brave and kind-hearted adventurer.",
			staticTags: {
				height: 165,
				weight: 52,
				birthday: "2000-03-15",
			},
			tags: {
				create: [
					{ tagId: braveTag.id },
					{ tagId: kindTag.id },
					{ tagId: adventurerTag.id },
				],
			},
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
			tags: {
				create: [
					{ tagId: mysteriousTag.id },
					{ tagId: mageTag.id },
					{ tagId: wiseTag.id },
				],
			},
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

	// Create a sample resource with tags
	const resource = await prisma.resource.create({
		data: {
			title: "Character Portrait Collection",
			fileUrl: "/uploads/portraits/collection-1.jpg",
			mimeType: "image/jpeg",
			uploaderId: user.id,
			tags: {
				create: [{ tagId: portraitTag.id }, { tagId: artworkTag.id }],
			},
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
