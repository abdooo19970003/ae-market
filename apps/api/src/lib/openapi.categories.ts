import { z } from "zod"
import { registry, IdParam, successResponse, errorSchema } from "./openapi.registry"

// ─────────────────────────────────────────────
// Schemas
// ─────────────────────────────────────────────
const CategorySchema = registry.register(
  "Category",
  z.object({
    id: z.number().openapi({ example: 1 }),
    name: z.string().openapi({ example: "Electronics" }),
    slug: z.string().openapi({ example: "electronics" }),
    parentId: z.number().nullable().openapi({ example: null }),
    description: z.string().nullable().openapi({ example: "Electronic devices" }),
    imageUrl: z.string().nullable().openapi({ example: "https://..." }),
    isActive: z.boolean().openapi({ example: true }),
    sortOrder: z.number().openapi({ example: 1 }),
    createdAt: z.string().datetime(),
    updatedAt: z.string().datetime(),
  }).openapi("Category")
)

// Recursive type for tree response
const CategoryNodeSchema: any = registry.register(
  "CategoryNode",
  z.object({
    id: z.number(),
    name: z.string(),
    slug: z.string(),
    parentId: z.number().nullable(),
    isActive: z.boolean(),
    children: z.array(z.lazy(() => CategoryNodeSchema)).openapi({ description: "Nested child categories" }),
  }).openapi("CategoryNode")
)

const AttributeOptionSchema = z.object({
  id: z.number().openapi({ example: 1 }),
  label: z.string().openapi({ example: "128 GB" }),
  value: z.string().openapi({ example: "128" }),
  sortOrder: z.number(),
}).openapi("AttributeOption")

const CategoryAttributeSchema = registry.register(
  "CategoryAttribute",
  z.object({
    id: z.number().openapi({ example: 1 }),
    categoryId: z.number().openapi({ example: 2 }),
    categoryName: z.string().openapi({ example: "Smartphones" }),
    name: z.string().openapi({ example: "RAM" }),
    slug: z.string().openapi({ example: "ram" }),
    inputType: z.enum(["text", "number", "select", "multi_select", "boolean"]),
    unit: z.string().nullable().openapi({ example: "GB" }),
    isRequired: z.boolean(),
    isFilterable: z.boolean(),
    sortOrder: z.number(),
    options: z.array(AttributeOptionSchema),
  }).openapi("CategoryAttribute")
)

const CreateCategoryBody = registry.register(
  "CreateCategoryBody",
  z.object({
    name: z.string().min(2).max(150).openapi({ example: "Smartphones" }),
    slug: z.string().min(2).max(150).openapi({ example: "smartphones" }),
    parentId: z.number().int().positive().nullable().optional().openapi({ example: 1 }),
    description: z.string().max(1000).optional().openapi({ example: "Mobile phones" }),
    imageUrl: z.string().url().optional(),
    isActive: z.boolean().optional().openapi({ example: true }),
    sortOrder: z.number().int().min(0).optional().openapi({ example: 0 }),
  }).openapi("CreateCategoryBody")
)

// ─────────────────────────────────────────────
// Routes
// ─────────────────────────────────────────────
registry.registerPath({
  method: "get",
  path: "/categories",
  tags: ["Categories"],
  summary: "List all categories",
  request: {
    query: z.object({
      tree: z.enum(["true", "false"]).optional()
        .openapi({ description: "Return as nested tree", example: "true" }),
    }),
  },
  responses: {
    200: {
      description: "Flat list or nested tree depending on ?tree param",
      content: { "application/json": { schema: successResponse(z.array(CategorySchema)) } },
    },
  },
})

registry.registerPath({
  method: "get",
  path: "/categories/{id}",
  tags: ["Categories"],
  summary: "Get category by ID",
  request: { params: IdParam },
  responses: {
    200: { description: "Category found", content: { "application/json": { schema: successResponse(CategorySchema) } } },
    404: { description: "Category not found", content: { "application/json": { schema: errorSchema } } },
  },
})

registry.registerPath({
  method: "get",
  path: "/categories/slug/{slug}",
  tags: ["Categories"],
  summary: "Get category by slug (for SEO-friendly routing)",
  request: { params: z.object({ slug: z.string().openapi({ example: "smartphones" }) }) },
  responses: {
    200: { description: "Category found", content: { "application/json": { schema: successResponse(CategorySchema) } } },
    404: { description: "Category not found", content: { "application/json": { schema: errorSchema } } },
  },
})

registry.registerPath({
  method: "get",
  path: "/categories/{id}/children",
  tags: ["Categories"],
  summary: "Get direct children of a category",
  request: { params: IdParam },
  responses: {
    200: { description: "Child categories", content: { "application/json": { schema: successResponse(z.array(CategorySchema)) } } },
    404: { description: "Category not found", content: { "application/json": { schema: errorSchema } } },
  },
})

registry.registerPath({
  method: "get",
  path: "/categories/{id}/attributes",
  tags: ["Categories"],
  summary: "Get attribute definitions for a category (includes inherited from parents)",
  request: { params: IdParam },
  responses: {
    200: { description: "Attributes with options", content: { "application/json": { schema: successResponse(z.array(CategoryAttributeSchema)) } } },
    404: { description: "Category not found", content: { "application/json": { schema: errorSchema } } },
  },
})

registry.registerPath({
  method: "get",
  path: "/categories/{id}/products",
  tags: ["Categories"],
  summary: "Get products belonging to a category",
  request: {
    params: IdParam,
    query: z.object({
      includeSubcategories: z.enum(["true", "false"]).optional()
        .openapi({ description: "Include products from child categories" }),
      isActive: z.enum(["true", "false"]).optional(),
    }),
  },
  responses: {
    200: { description: "Products list", content: { "application/json": { schema: successResponse(z.array(z.object({ id: z.number(), name: z.string(), slug: z.string() }))) } } },
    404: { description: "Category not found", content: { "application/json": { schema: errorSchema } } },
  },
})

registry.registerPath({
  method: "post",
  path: "/categories",
  tags: ["Categories"],
  summary: "Create a new category (admin only)",
  security: [{ bearerAuth: [] }],
  request: { body: { content: { "application/json": { schema: CreateCategoryBody } } } },
  responses: {
    201: { description: "Created", content: { "application/json": { schema: successResponse(CategorySchema) } } },
    401: { description: "Unauthorized", content: { "application/json": { schema: errorSchema } } },
    403: { description: "Forbidden", content: { "application/json": { schema: errorSchema } } },
    422: { description: "Validation error", content: { "application/json": { schema: errorSchema } } },
  },
})

registry.registerPath({
  method: "patch",
  path: "/categories/{id}",
  tags: ["Categories"],
  summary: "Update a category (admin only)",
  security: [{ bearerAuth: [] }],
  request: {
    params: IdParam,
    body: { content: { "application/json": { schema: CreateCategoryBody.partial() } } },
  },
  responses: {
    200: { description: "Updated", content: { "application/json": { schema: successResponse(CategorySchema) } } },
    401: { description: "Unauthorized", content: { "application/json": { schema: errorSchema } } },
    403: { description: "Forbidden", content: { "application/json": { schema: errorSchema } } },
    404: { description: "Not found", content: { "application/json": { schema: errorSchema } } },
  },
})

registry.registerPath({
  method: "delete",
  path: "/categories/{id}",
  tags: ["Categories"],
  summary: "Soft-delete a category (admin only)",
  security: [{ bearerAuth: [] }],
  request: { params: IdParam },
  responses: {
    200: { description: "Deleted (soft)", content: { "application/json": { schema: successResponse(CategorySchema) } } },
    401: { description: "Unauthorized", content: { "application/json": { schema: errorSchema } } },
    403: { description: "Forbidden", content: { "application/json": { schema: errorSchema } } },
    404: { description: "Not found", content: { "application/json": { schema: errorSchema } } },
  },
})