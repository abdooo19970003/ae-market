import { relations } from "drizzle-orm";
import { boolean, pgEnum } from "drizzle-orm/pg-core";
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
  password: varchar("password", { length: 255 }).notNull(),
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
  refreshTokens: many(refreshTokens),
  profile: one(userProfiles, {
    relationName: "users_profile",
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
  token: varchar("token", { length: 255 }).notNull(),
  expiredAt: timestamp("expired_at", { withTimezone: true }).notNull(),
});

export const refreshTokensRelations = relations(refreshTokens, ({ one, many }) => ({
  user: one(users, {
    fields: [refreshTokens.userId],
    references: [users.id],
    relationName: "refresh_tokens_user"
  }),
}))

//__________________________
// User Profiles
//__________________________
export const userProfiles = pgTable("user_profiles", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references((): any => users.id, { onDelete: "cascade" }),
  firstName: varchar("first_name", { length: 255 }),
  lastName: varchar("last_name", { length: 255 }),
  imageUrl: varchar("image_url", { length: 255 }),
  phone: varchar("phone", { length: 20 }),
  address: varchar("address", { length: 255 }),
  city: varchar("city", { length: 255 }),
  state: varchar("state", { length: 255 }),
})

export const userProfilesRelations = relations(userProfiles, ({ one, many }) => ({
  user: one(users, {
    fields: [userProfiles.userId],
    references: [users.id],
    relationName: "user_profiles_user"
  }),
}))


//__________________________
// ZOD Schemas
//__________________________

export const registerSchema = createInsertSchema(users, {
  email: z.string().email(),
  password: z.string().min(4).max(255),
  role: z.enum(["customer", "admin"]).default("customer"),
})
export const loginSchema = createInsertSchema(users, {
  email: z.string().email(),
  password: z.string().min(1).max(255),
}).pick({
  email: true,
  password: true,
})