import * as z from "zod"

export const todoSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters").max(100, "Title is too long"),
  description: z.string().max(500, "Description is too long").optional().or(z.literal("")),
})

export type TodoFormValues = z.infer<typeof todoSchema>