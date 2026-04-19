import { relations } from "drizzle-orm";
import { boolean, pgEnum, text } from "drizzle-orm/pg-core";
import { integer, pgTable, serial, timestamp, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";


//_________________________
// Users
//_________________________
export const roleEnum = pgEnum("role", ["customer", "admin"]);

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  password: varchar("password", { length: 255 }).notNull(), // hashedPassword
  role: roleEnum("role").notNull().default("customer"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});
export const usersRelations = relations(users, ({ one, many }) => ({
  refreshTokens: many(refreshTokens, {
    relationName: "user_tokens",
  }),
  profile: one(userProfiles, {
    relationName: "user_profile",
    fields: [users.id],
    references: [userProfiles.userId]
  }),
}))

//______________________
// Refresh Tokens
//______________________
export const refreshTokens = pgTable("refresh_tokens", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references((): any => users.id, { onDelete: "cascade" }),
  // Store SHA-256 hash of the token, never the raw JWT
  // SHA-256 hex digest = 64 chars; text handles any length safely
  tokenHash: varchar("token", { length: 255 }).notNull(),
  expiredAt: timestamp("expired_at", { withTimezone: true }).notNull(),
});

export const refreshTokensRelations = relations(refreshTokens, ({ one, many }) => ({
  user: one(users, {
    relationName: "user_tokens",
    fields: [refreshTokens.userId],
    references: [users.id],
  }),
}))

//__________________________
// User Profiles
//__________________________
export const userProfiles = pgTable("user_profiles", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" })
    .unique(),              // ← enforce one profile per user at DB level
  firstName: varchar("first_name", { length: 100 }),
  lastName: varchar("last_name", { length: 100 }),
  imageUrl: text("image_url"),        // URLs can exceed 255 chars
  // E.164 international format: +966501234567 (max 15 digits + '+' = 16)
  phone: varchar("phone", { length: 20 }),

  // Address split into fields — enables filtering/shipping logic later
  addressLine1: varchar("address_line1", { length: 255 }),
  addressLine2: varchar("address_line2", { length: 255 }),
  city: varchar("city", { length: 100 }),
  state: varchar("state", { length: 100 }),
  postalCode: varchar("postal_code", { length: 20 }),
  country: varchar("country", { length: 2 }).default("SA"), // ISO 3166-1 alpha-2

  // Track profile changes independently from auth data
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});


export const userProfilesRelations = relations(userProfiles, ({ one, many }) => ({
  user: one(users, {
    fields: [userProfiles.userId],
    references: [users.id],
    relationName: "user_profile"
  }),
}))


//__________________________
// ZOD Schemas
//__________________________

// Register
export const registerSchema = createInsertSchema(users, {
  email: z.email().max(255).toLowerCase(),
  password: z.string().min(4).max(72),
})

// Login
export const loginSchema = z.object({
  email: z.email().max(255).toLowerCase(),
  password: z.string().min(1).max(72),
});

// Profile update — all optional, user fills what they want
export const updateProfileSchema = z.object({
  firstName: z.string().min(1).max(100).optional(),
  lastName: z.string().min(1).max(100).optional(),
  imageUrl: z.string().url().optional(),
  phone: z.string()
    .regex(/^\+?[1-9]\d{6,14}$/, "Use international format e.g. +966501234567")
    .optional(),
  addressLine1: z.string().max(255).optional(),
  addressLine2: z.string().max(255).optional(),
  city: z.string().max(100).optional(),
  state: z.string().max(100).optional(),
  postalCode: z.string().max(20).optional(),
  country: z.string().length(2, "Use ISO 3166-1 alpha-2 e.g. SA, US, TR").optional(),
});

// Admin-only — allows changing role or disabling accounts
export const adminUpdateUserSchema = z.object({
  role: z.enum(["customer", "admin"]).optional(),
  isActive: z.boolean().optional(),
});

// Safe public types — never expose password hash
export type PublicUser = Omit<typeof users.$inferSelect, "password">;
export type UserProfile = typeof userProfiles.$inferSelect;
export type RefreshToken = typeof refreshTokens.$inferSelect;