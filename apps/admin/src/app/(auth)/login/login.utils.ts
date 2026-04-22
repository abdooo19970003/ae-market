import z from "zod";

export const loginSchema = z.object({
  email: z.email().max(255).toLowerCase(),
  password: z.string().min(1).max(72),
});

export type LoginInput = z.infer<typeof loginSchema>;
export const defaultValues = {
  email: "",
  password: "",
}
