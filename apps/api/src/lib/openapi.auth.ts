import { z } from "zod";
import { registry, IdParam, successResponse, errorSchema } from "./openapi.registry";

// __________
// Schemas 
// __________

// User Schema
const UserSchema = registry.register("User", z.object({
  id: z.number().openapi({ example: 1 }),
  email: z.string().email().openapi({ example: "user@example.com" }),
  role: z.enum(["customer", "admin"]).openapi({ example: "customer" }),
  isActive: z.boolean().openapi({ example: true }),
  createdAt: z.string().datetime().openapi({ example: "2024-01-01T00:00:00Z" }),
}).openapi("User")
)

// Token Pair Schema
const TokenPairSchema = registry.register("TokenPair", z.object({
  accessToken: z.string().openapi({ example: "eyJhbGci..." }),
  refreshToken: z.string().openapi({ example: "eyJhbGci..." }),
  user: UserSchema,
}).openapi("TokenPair")
)

// Register Body 
const RegisterBody = registry.register("RegisterBody", z.object({
  email: z.string().email().openapi({ example: "user@example.com" }),
  password: z.string().min(8).openapi({ example: "MyPass123!" }),
}).openapi("RegisterBody")
)

// Login Body
const LoginBody = registry.register("LoginBody", z.object({
  email: z.string().email().openapi({ example: "user@example.com" }),
  password: z.string().openapi({ example: "MyPass123!" }),
}).openapi("LoginBody")
)

// Refresh Body
const RefreshBody = registry.register(
  "RefreshBody",
  z.object({
    refreshToken: z.string().openapi({ example: "eyJhbGci..." }),
  }).openapi("RefreshBody")
)

//____________
// Routes
//____________

// /auth/register
registry.registerPath({
  method: "post",
  path: "/auth/register",
  tags: ["Auth"],
  summary: "Register a new user",
  description: "Register a new user",
  request: {
    body: {
      content: {
        "application/json": { schema: RegisterBody, },
      },
    }
  },
  responses: {
    201: {
      description: "User registered successfully",
      content: {
        "application/json": {
          schema: successResponse(TokenPairSchema),
        },
      },
    },
    409: {
      description: "User already exists",
      content: {
        "application/json": {
          schema: errorSchema,
        },
      },
    },
    422: {
      description: "Validation error",
      content: {
        "application/json": {
          schema: errorSchema,
        },
      },
    },
    500: {
      description: "Internal server error",
    }

  }
})

// /auth/login
registry.registerPath({
  method: "post",
  path: "/auth/login",
  tags: ["Auth"],
  summary: "Login and receive token pair",
  request: { body: { content: { "application/json": { schema: LoginBody } } } },
  responses: {
    200: { description: "Login successful", content: { "application/json": { schema: successResponse(TokenPairSchema) } } },
    401: { description: "Invalid email or password", content: { "application/json": { schema: errorSchema } } },
  },
})

// /auth/refresh
registry.registerPath({
  method: "post",
  path: "/auth/refresh",
  tags: ["Auth"],
  summary: "Rotate token pair using a refresh token",
  request: { body: { content: { "application/json": { schema: RefreshBody } } } },
  responses: {
    200: { description: "New token pair issued", content: { "application/json": { schema: successResponse(TokenPairSchema) } } },
    401: { description: "Invalid or expired token", content: { "application/json": { schema: errorSchema } } },
  },
})

// /auth/logout
registry.registerPath({
  method: "post",
  path: "/auth/logout",
  tags: ["Auth"],
  summary: "Revoke all refresh tokens (requires login)",
  security: [{ bearerAuth: [] }],
  responses: {
    200: { description: "Logged out successfully" },
    401: { description: "Unauthorized", content: { "application/json": { schema: errorSchema } } },
  },
})

// /auth/me
registry.registerPath({
  method: "get",
  path: "/auth/me",
  tags: ["Auth"],
  summary: "Get current authenticated user",
  security: [{ bearerAuth: [] }],
  responses: {
    200: { description: "Current user", content: { "application/json": { schema: successResponse(UserSchema) } } },
    401: { description: "Unauthorized", content: { "application/json": { schema: errorSchema } } },
  },
})

// Register global security scheme
registry.registerComponent("securitySchemes", "bearerAuth", {
  type: "http",
  scheme: "bearer",
  bearerFormat: "JWT",
});