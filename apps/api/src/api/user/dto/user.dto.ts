import { z } from "zod";

// --- Create User Body Schema ---

export const CreateUserSchema = z.object({
    email: z.string().email().describe("User email address"),
    name: z.string().min(1).describe("User display name"),
    role: z.enum(["admin", "user"]).optional().describe("User role"),
});

export type CreateUserDto = z.infer<typeof CreateUserSchema>;

// --- List Users Query Schema ---

export const ListUsersQuerySchema = z.object({
    page: z.coerce.number().int().min(1).optional().describe("Page number"),
    limit: z.coerce.number().int().min(1).max(100).optional().describe("Items per page"),
    role: z.string().optional().describe("Filter by role"),
});

export type ListUsersQueryDto = z.infer<typeof ListUsersQuerySchema>;
