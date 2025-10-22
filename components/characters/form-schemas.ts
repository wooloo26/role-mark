import { z } from "zod"

export const characterFormSchema = z.object({
	name: z.string().min(1, "Name is required").max(255),
	avatarUrl: z.string().optional().or(z.literal("")),
	portraitUrl: z.string().optional().or(z.literal("")),
	info: z.string().optional(),
	height: z.string().optional(),
	weight: z.string().optional(),
	birthday: z.string().optional(),
})

export type CharacterFormValues = z.infer<typeof characterFormSchema>
