import {
	ContentType,
	PrismaClient,
	ResourceType,
	TagScope,
} from "@prisma/client"
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

	const animationTag = await prisma.tag.create({
		data: {
			name: "Animation",
			slug: "animation",
			scope: TagScope.RESOURCE,
			groupId: resourceTypeGroup.id,
		},
	})

	const modelTag = await prisma.tag.create({
		data: {
			name: "3D Model",
			slug: "3d-model",
			scope: TagScope.RESOURCE,
			groupId: resourceTypeGroup.id,
		},
	})

	console.log("✅ Created resource tags")

	// Create static tag definitions
	const heightDef = await prisma.staticTagDefinition.upsert({
		where: { name: "height" },
		update: {},
		create: {
			name: "height",
			displayName: "Height",
			dataType: "NUMBER",
			unit: "cm",
			description: "Character height in centimeters",
		},
	})

	const weightDef = await prisma.staticTagDefinition.upsert({
		where: { name: "weight" },
		update: {},
		create: {
			name: "weight",
			displayName: "Weight",
			dataType: "NUMBER",
			unit: "kg",
			description: "Character weight in kilograms",
		},
	})

	const birthdayDef = await prisma.staticTagDefinition.upsert({
		where: { name: "birthday" },
		update: {},
		create: {
			name: "birthday",
			displayName: "Birthday",
			dataType: "DATE",
			description: "Character's birthday",
		},
	})

	console.log("✅ Created static tag definitions")

	// Create sample characters with tags
	const character1 = await prisma.character.create({
		data: {
			name: "Alice",
			info: "A brave and kind-hearted adventurer.",
			staticTags: {
				create: [
					{ tagDefId: heightDef.id, value: "165" },
					{ tagDefId: weightDef.id, value: "52" },
					{ tagDefId: birthdayDef.id, value: "2000-03-15" },
				],
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
				create: [
					{ tagDefId: heightDef.id, value: "178" },
					{ tagDefId: weightDef.id, value: "68" },
					{ tagDefId: birthdayDef.id, value: "1998-08-22" },
				],
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

	// Create relation types
	const friendsRelationType = await prisma.relationType.upsert({
		where: { name: "friends" },
		update: {},
		create: {
			name: "friends",
			description: "Characters who are friends with each other",
		},
	})

	await prisma.relationType.upsert({
		where: { name: "rivals" },
		update: {},
		create: {
			name: "rivals",
			description: "Characters who compete or oppose each other",
		},
	})

	await prisma.relationType.upsert({
		where: { name: "siblings" },
		update: {},
		create: {
			name: "siblings",
			description: "Characters who are siblings",
		},
	})

	await prisma.relationType.upsert({
		where: { name: "mentor" },
		update: {},
		create: {
			name: "mentor",
			description: "One character mentors or teaches another",
		},
	})

	await prisma.relationType.upsert({
		where: { name: "allies" },
		update: {},
		create: {
			name: "allies",
			description: "Characters who work together toward common goals",
		},
	})

	await prisma.relationType.upsert({
		where: { name: "enemies" },
		update: {},
		create: {
			name: "enemies",
			description: "Characters who are adversaries",
		},
	})

	console.log("✅ Created relation types")

	// Create a character relationship
	await prisma.characterRelation.create({
		data: {
			fromCharacterId: character1.id,
			toCharacterId: character2.id,
			relationTypeId: friendsRelationType.id,
			isBidirectional: true,
		},
	})

	console.log("✅ Created character relationship")

	// Create a sample resource with tags (FILE_ARRAY with images)
	const resource1 = await prisma.resource.create({
		data: {
			title: "Character Portrait Collection",
			description: "A collection of character portraits",
			type: ResourceType.FILE_ARRAY,
			contentType: ContentType.IMAGE,
			thumbnailUrl: "/uploads/portraits/collection-1-thumb.jpg",
			uploaderId: user.id,
			files: {
				create: [
					{
						fileName: "portrait-1.jpg",
						fileUrl: "/uploads/portraits/portrait-1.jpg",
						mimeType: "image/jpeg",
						fileSize: 245600,
						order: 0,
						metadata: { width: 800, height: 1200 },
					},
					{
						fileName: "portrait-2.jpg",
						fileUrl: "/uploads/portraits/portrait-2.jpg",
						mimeType: "image/jpeg",
						fileSize: 189400,
						order: 1,
						metadata: { width: 800, height: 1200 },
					},
				],
			},
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

	console.log("✅ Created sample resource (FILE_ARRAY):", resource1.title)

	// Create a SINGLE_FILE video resource
	const resource2 = await prisma.resource.create({
		data: {
			title: "Character Animation Demo",
			description: "Animated showcase of character",
			type: ResourceType.SINGLE_FILE,
			contentType: ContentType.VIDEO,
			thumbnailUrl: "/uploads/videos/demo-thumb.jpg",
			uploaderId: user.id,
			files: {
				create: {
					fileName: "character-animation.mp4",
					fileUrl: "/uploads/videos/character-animation.mp4",
					mimeType: "video/mp4",
					fileSize: 5242880,
					order: 0,
					metadata: { duration: 120, width: 1920, height: 1080 },
				},
			},
			tags: {
				create: [{ tagId: animationTag.id }],
			},
			characters: {
				create: [{ characterId: character1.id }],
			},
		},
	})

	console.log(
		"✅ Created sample resource (SINGLE_FILE VIDEO):",
		resource2.title,
	)

	// Create a FOLDER resource (e.g., Live2D model bundle)
	const resource3 = await prisma.resource.create({
		data: {
			title: "Live2D Character Model",
			description: "Complete Live2D model with all dependencies",
			type: ResourceType.FOLDER,
			contentType: null,
			thumbnailUrl: "/uploads/models/live2d-thumb.jpg",
			uploaderId: user.id,
			files: {
				create: [
					{
						fileName: "model.json",
						fileUrl: "/uploads/models/live2d/model.json",
						mimeType: "application/json",
						fileSize: 2048,
						order: 0,
					},
					{
						fileName: "texture_00.png",
						fileUrl: "/uploads/models/live2d/texture_00.png",
						mimeType: "image/png",
						fileSize: 512000,
						order: 1,
					},
					{
						fileName: "motion.moc3",
						fileUrl: "/uploads/models/live2d/motion.moc3",
						mimeType: "application/octet-stream",
						fileSize: 102400,
						order: 2,
					},
				],
			},
			tags: {
				create: [{ tagId: modelTag.id }],
			},
			characters: {
				create: [{ characterId: character2.id }],
			},
		},
	})

	console.log("✅ Created sample resource (FOLDER):", resource3.title)

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
