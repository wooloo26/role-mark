/**
 * Convert file URL to API route URL
 * @param fileUrl - Original file URL (e.g., /uploads/avatars/file.jpg)
 * @returns API route URL (e.g., /api/files/avatars/file.jpg)
 */
export function getFileApiUrl(fileUrl: string | null | undefined): string {
	if (!fileUrl) return ""
	// Remove /uploads/ prefix and prepend /api/files/
	const relativePath = fileUrl.replace(/^\/uploads\//, "")
	return `/api/files/${relativePath}`
}
