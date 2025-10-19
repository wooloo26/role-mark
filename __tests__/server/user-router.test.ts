/**
 * Unit tests demonstrating jest-mock-extended usage
 * Testing utility functions and service layer code with proper mocking
 */

import { beforeEach, describe, expect, it, jest } from "@jest/globals"
import { type MockProxy, mock } from "jest-mock-extended"

type UserService = {
	getUserById: (
		id: string,
	) => Promise<{ id: string; name: string; email: string } | null>
	createUser: (data: { name: string; email: string }) => Promise<{ id: string }>
	deleteUser: (id: string) => Promise<boolean>
	updateUser: (
		id: string,
		data: { name?: string },
	) => Promise<{ id: string; name: string }>
}

type EmailService = {
	sendEmail: (to: string, subject: string, body: string) => Promise<boolean>
	validateEmail: (email: string) => boolean
	sendBulkEmails: (emails: string[], subject: string) => Promise<number>
}

type FileService = {
	uploadFile: (filename: string, buffer: Buffer) => Promise<string>
	deleteFile: (path: string) => Promise<void>
	getFileUrl: (path: string) => string
}

describe("jest-mock-extended examples", () => {
	describe("UserService mocking", () => {
		let mockUserService: MockProxy<UserService>

		beforeEach(() => {
			// Create a mock of UserService
			mockUserService = mock<UserService>()
		})

		it("should mock getUserById successfully", async () => {
			const mockUser = {
				id: "user-123",
				name: "John Doe",
				email: "john@example.com",
			}

			// Setup the mock to return specific value
			mockUserService.getUserById.mockResolvedValue(mockUser)

			const result = await mockUserService.getUserById("user-123")

			expect(result).toEqual(mockUser)
			expect(mockUserService.getUserById).toHaveBeenCalledWith("user-123")
			expect(mockUserService.getUserById).toHaveBeenCalledTimes(1)
		})

		it("should mock getUserById returning null", async () => {
			mockUserService.getUserById.mockResolvedValue(null)

			const result = await mockUserService.getUserById("non-existent")

			expect(result).toBeNull()
		})

		it("should mock createUser", async () => {
			mockUserService.createUser.mockResolvedValue({ id: "new-user-id" })

			const newUser = {
				name: "Jane Doe",
				email: "jane@example.com",
			}

			const result = await mockUserService.createUser(newUser)

			expect(result).toEqual({ id: "new-user-id" })
			expect(mockUserService.createUser).toHaveBeenCalledWith(newUser)
		})

		it("should mock deleteUser with boolean return", async () => {
			mockUserService.deleteUser.mockResolvedValue(true)

			const result = await mockUserService.deleteUser("user-123")

			expect(result).toBe(true)
		})

		it("should verify mock was not called", () => {
			expect(mockUserService.getUserById).not.toHaveBeenCalled()
			expect(mockUserService.createUser).not.toHaveBeenCalled()
		})
	})

	describe("EmailService mocking", () => {
		let mockEmailService: MockProxy<EmailService>

		beforeEach(() => {
			mockEmailService = mock<EmailService>()
		})

		it("should mock sendEmail successfully", async () => {
			mockEmailService.sendEmail.mockResolvedValue(true)

			const result = await mockEmailService.sendEmail(
				"user@example.com",
				"Welcome",
				"Hello!",
			)

			expect(result).toBe(true)
			expect(mockEmailService.sendEmail).toHaveBeenCalledWith(
				"user@example.com",
				"Welcome",
				"Hello!",
			)
		})

		it("should mock sendEmail failure", async () => {
			mockEmailService.sendEmail.mockResolvedValue(false)

			const result = await mockEmailService.sendEmail(
				"invalid@example.com",
				"Test",
				"Body",
			)

			expect(result).toBe(false)
		})

		it("should mock validateEmail", () => {
			mockEmailService.validateEmail.mockReturnValue(true)

			const result = mockEmailService.validateEmail("valid@example.com")

			expect(result).toBe(true)
		})

		it("should mock validateEmail with different return values", () => {
			// Setup different behaviors for different inputs
			mockEmailService.validateEmail
				.mockReturnValueOnce(true)
				.mockReturnValueOnce(false)

			expect(mockEmailService.validateEmail("valid@example.com")).toBe(true)
			expect(mockEmailService.validateEmail("invalid")).toBe(false)
		})
	})

	describe("FileService mocking", () => {
		let mockFileService: MockProxy<FileService>

		beforeEach(() => {
			mockFileService = mock<FileService>()
		})

		it("should mock uploadFile", async () => {
			const buffer = Buffer.from("test content")
			mockFileService.uploadFile.mockResolvedValue("/uploads/file.txt")

			const result = await mockFileService.uploadFile("test.txt", buffer)

			expect(result).toBe("/uploads/file.txt")
			expect(mockFileService.uploadFile).toHaveBeenCalledWith(
				"test.txt",
				buffer,
			)
		})

		it("should mock deleteFile", async () => {
			mockFileService.deleteFile.mockResolvedValue(undefined)

			await mockFileService.deleteFile("/uploads/test.txt")

			expect(mockFileService.deleteFile).toHaveBeenCalledWith(
				"/uploads/test.txt",
			)
		})

		it("should mock getFileUrl", () => {
			mockFileService.getFileUrl.mockReturnValue(
				"https://cdn.example.com/file.txt",
			)

			const result = mockFileService.getFileUrl("/uploads/file.txt")

			expect(result).toBe("https://cdn.example.com/file.txt")
		})
	})

	describe("Complex mocking scenarios", () => {
		let mockUserService: MockProxy<UserService>

		beforeEach(() => {
			mockUserService = mock<UserService>()
		})

		it("should handle rejected promises", async () => {
			mockUserService.getUserById.mockRejectedValue(
				new Error("Database connection failed"),
			)

			await expect(mockUserService.getUserById("user-123")).rejects.toThrow(
				"Database connection failed",
			)
		})

		it("should use mockImplementation for complex logic", async () => {
			mockUserService.createUser.mockImplementation(async (data) => {
				if (data.email.includes("invalid")) {
					throw new Error("Invalid email")
				}
				return { id: `generated-id-for-${data.name}` }
			})

			const result = await mockUserService.createUser({
				name: "John",
				email: "john@example.com",
			})
			expect(result.id).toBe("generated-id-for-John")

			await expect(
				mockUserService.createUser({
					name: "Invalid",
					email: "invalid@test.com",
				}),
			).rejects.toThrow("Invalid email")
		})

		it("should verify call order with toHaveBeenNthCalledWith", async () => {
			mockUserService.getUserById
				.mockResolvedValueOnce({
					id: "1",
					name: "User 1",
					email: "user1@example.com",
				})
				.mockResolvedValueOnce({
					id: "2",
					name: "User 2",
					email: "user2@example.com",
				})

			await mockUserService.getUserById("1")
			await mockUserService.getUserById("2")

			expect(mockUserService.getUserById).toHaveBeenNthCalledWith(1, "1")
			expect(mockUserService.getUserById).toHaveBeenNthCalledWith(2, "2")
		})

		it("should verify exact call counts", async () => {
			mockUserService.deleteUser.mockResolvedValue(true)

			await mockUserService.deleteUser("user-1")
			await mockUserService.deleteUser("user-2")
			await mockUserService.deleteUser("user-3")

			expect(mockUserService.deleteUser).toHaveBeenCalledTimes(3)
		})

		it("should use mockReset to clear mock history", async () => {
			mockUserService.getUserById.mockResolvedValue({
				id: "1",
				name: "User",
				email: "user@example.com",
			})

			await mockUserService.getUserById("1")
			expect(mockUserService.getUserById).toHaveBeenCalledTimes(1)

			jest.mocked(mockUserService.getUserById).mockReset()

			expect(mockUserService.getUserById).not.toHaveBeenCalled()
		})
	})
})
