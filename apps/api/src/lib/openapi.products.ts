import { z } from "zod"
import { registry, VariantParams, successResponse, errorSchema } from "./openapi.registry"

// ═══════════════════════════════════════════════════════════════
// SCHEMAS
// ═══════════════════════════════════════════════════════════════

// ─────────────────────────────────────────────
// Shared building blocks
// ─────────────────────────────────────────────
const PriceSchema = registry.register(
  "Price",
  z.object({
    id: z.number().openapi({ example: 1 }),
    variantId: z.number().openapi({ example: 1 }),
    costPrice: z.string().openapi({ example: "750.00", description: "Purchase price (admin only)" }),
    sellPrice: z.string().openapi({ example: "999.00", description: "Customer-facing price" }),
    isActive: z.boolean().openapi({ example: true }),
    effectiveAt: z.string().datetime(),
    createdAt: z.string().datetime(),
  }).openapi("Price")
)

const PriceHistorySchema = registry.register(
  "PriceHistory",
  z.object({
    id: z.number().openapi({ example: 1 }),
    variantId: z.number().openapi({ example: 1 }),
    oldCostPrice: z.string().nullable().openapi({ example: "700.00" }),
    newCostPrice: z.string().openapi({ example: "750.00" }),
    oldSellPrice: z.string().nullable().openapi({ example: "950.00" }),
    newSellPrice: z.string().openapi({ example: "999.00" }),
    reason: z.enum(["manual_update", "promotion", "supplier_change", "correction", "other"])
      .openapi({ example: "supplier_change" }),
    note: z.string().nullable().openapi({ example: "Supplier raised prices" }),
    changedBy: z.number().nullable().openapi({ example: 1 }),
    changedAt: z.string().datetime(),
  }).openapi("PriceHistory")
)

const VariantImageSchema = registry.register(
  "VariantImage",
  z.object({
    id: z.number().openapi({ example: 1 }),
    variantId: z.number().openapi({ example: 1 }),
    url: z.string().url().openapi({ example: "https://cdn.example.com/img.jpg" }),
    altText: z.string().nullable().openapi({ example: "iPhone 15 Black 128GB" }),
    isPrimary: z.boolean().openapi({ example: true }),
    sortOrder: z.number().openapi({ example: 0 }),
  }).openapi("VariantImage")
)

const ProductImageSchema = registry.register(
  "ProductImage",
  z.object({
    id: z.number().openapi({ example: 1 }),
    productId: z.number().openapi({ example: 1 }),
    url: z.string().url().openapi({ example: "https://cdn.example.com/img.jpg" }),
    altText: z.string().nullable().openapi({ example: "iPhone 15" }),
    isPrimary: z.boolean().openapi({ example: true }),
    sortOrder: z.number().openapi({ example: 0 }),
  }).openapi("ProductImage")
)

const AttributeValueSchema = z.object({
  attributeId: z.number().openapi({ example: 1 }),
  attributeName: z.string().openapi({ example: "RAM" }),
  attributeSlug: z.string().openapi({ example: "ram" }),
  inputType: z.enum(["text", "number", "select", "multi_select", "boolean"]),
  unit: z.string().nullable().openapi({ example: "GB" }),
  valueText: z.string().nullable().openapi({ example: "A17 Pro" }),
  optionLabel: z.string().nullable().openapi({ example: "128 GB" }),
  optionValue: z.string().nullable().openapi({ example: "128" }),
}).openapi("AttributeValue")

// ─────────────────────────────────────────────
// Variant
// ─────────────────────────────────────────────
const VariantSchema = registry.register(
  "Variant",
  z.object({
    id: z.number().openapi({ example: 1 }),
    productId: z.number().openapi({ example: 1 }),
    name: z.string().nullable().openapi({ example: "128GB Black" }),
    sku: z.string().nullable().openapi({ example: "APL-IP15-128-BLK" }),
    stockQuantity: z.number().openapi({ example: 50 }),
    isActive: z.boolean().openapi({ example: true }),
    createdAt: z.string().datetime(),
    updatedAt: z.string().datetime(),
  }).openapi("Variant")
)

// Variant with full detail (returned in ?detail=true)
const VariantDetailSchema = registry.register(
  "VariantDetail",
  VariantSchema.extend({
    price: PriceSchema.nullable().openapi({ description: "Active price for this variant" }),
    attributes: z.array(AttributeValueSchema).openapi({ description: "Variant-level attribute values" }),
    images: z.array(VariantImageSchema).openapi({ description: "Resolved images — variant-specific or fallback to product images" }),
    imageSource: z.enum(["variant", "product"]).openapi({ description: "Indicates whether images came from the variant or the parent product" }),
  }).openapi("VariantDetail")
)

// ─────────────────────────────────────────────
// Product
// ─────────────────────────────────────────────
const ProductSchema = registry.register(
  "Product",
  z.object({
    id: z.number().openapi({ example: 1 }),
    categoryId: z.number().openapi({ example: 2 }),
    name: z.string().openapi({ example: "iPhone 15" }),
    slug: z.string().openapi({ example: "iphone-15" }),
    sku: z.string().nullable().openapi({ example: "APL-IP15" }),
    description: z.string().nullable().openapi({ example: "Apple iPhone 15" }),
    isActive: z.boolean().openapi({ example: true }),
    createdAt: z.string().datetime(),
    updatedAt: z.string().datetime(),
  }).openapi("Product")
)

// Product with full detail (returned in ?detail=true)
const ProductDetailSchema = registry.register(
  "ProductDetail",
  ProductSchema.extend({
    attributes: z.array(AttributeValueSchema).openapi({ description: "Product-level attribute values (shared across all variants)" }),
    images: z.array(ProductImageSchema).openapi({ description: "Product-level fallback images" }),
    variants: z.array(VariantDetailSchema).openapi({ description: "All variants with prices and resolved images" }),
  }).openapi("ProductDetail")
)

// ─────────────────────────────────────────────
// Request bodies
// ─────────────────────────────────────────────
const CreateProductBody = registry.register(
  "CreateProductBody",
  z.object({
    categoryId: z.number().int().positive().openapi({ example: 2 }),
    name: z.string().min(2).max(255).openapi({ example: "iPhone 15" }),
    slug: z.string().min(2).max(255).openapi({
      example: "iphone-15",
      description: "URL-friendly identifier — lowercase letters, numbers, hyphens only"
    }),
    sku: z.string().max(100).optional().openapi({ example: "APL-IP15" }),
    description: z.string().optional().openapi({ example: "Apple iPhone 15 series" }),
    isActive: z.boolean().optional().openapi({ example: true }),
  }).openapi("CreateProductBody")
)

const CreateVariantBody = registry.register(
  "CreateVariantBody",
  z.object({
    name: z.string().max(255).optional().openapi({ example: "128GB Black" }),
    sku: z.string().max(100).optional().openapi({ example: "APL-IP15-128-BLK" }),
    stockQuantity: z.number().int().min(0).optional().openapi({ example: 50 }),
    isActive: z.boolean().optional().openapi({ example: true }),
  }).openapi("CreateVariantBody")
)

const AddVariantImageBody = registry.register(
  "AddVariantImageBody",
  z.object({
    url: z.string().url().openapi({ example: "https://cdn.example.com/iphone-black.jpg" }),
    altText: z.string().max(255).optional().openapi({ example: "iPhone 15 Black 128GB" }),
    isPrimary: z.boolean().optional().openapi({ example: true }),
    sortOrder: z.number().int().optional().openapi({ example: 0 }),
  }).openapi("AddVariantImageBody")
)

const SetPriceBody = registry.register(
  "SetPriceBody",
  z.object({
    costPrice: z.string().regex(/^\d+(\.\d{1,2})?$/).openapi({ example: "750.00", description: "Purchase price paid to supplier" }),
    sellPrice: z.string().regex(/^\d+(\.\d{1,2})?$/).openapi({ example: "999.00", description: "Price shown to customers" }),
  }).openapi("SetPriceBody")
)

const UpdatePriceBody = registry.register(
  "UpdatePriceBody",
  z.object({
    costPrice: z.string().regex(/^\d+(\.\d{1,2})?$/).openapi({ example: "780.00" }),
    sellPrice: z.string().regex(/^\d+(\.\d{1,2})?$/).openapi({ example: "1049.00" }),
    reason: z.enum(["manual_update", "promotion", "supplier_change", "correction", "other"])
      .optional().openapi({ example: "supplier_change" }),
    note: z.string().max(1000).optional().openapi({ example: "Supplier raised component costs" }),
  }).openapi("UpdatePriceBody")
)

// ─────────────────────────────────────────────
// Shared params
// ─────────────────────────────────────────────
const ProductIdParam = z.object({
  id: z.string().regex(/^\d+$/).openapi({ example: "1" }),
})

const ImageIdParams = VariantParams.extend({
  imageId: z.string().regex(/^\d+$/).openapi({ example: "5" }),
})


// ═══════════════════════════════════════════════════════════════
// ROUTES
// ═══════════════════════════════════════════════════════════════

// ─────────────────────────────────────────────
// Products
// ─────────────────────────────────────────────
registry.registerPath({
  method: "get",
  path: "/products",
  tags: ["Products"],
  summary: "List all products",
  description: "Public endpoint. Filter by category or active status.",
  request: {
    query: z.object({
      categoryId: z.string().regex(/^\d+$/).optional()
        .openapi({ description: "Filter by category ID", example: "2" }),
      isActive: z.enum(["true", "false"]).optional()
        .openapi({ description: "Filter by active status", example: "true" }),
    }),
  },
  responses: {
    200: { description: "Products list", content: { "application/json": { schema: successResponse(z.array(ProductSchema)) } } },
  },
})

registry.registerPath({
  method: "get",
  path: "/products/{id}",
  tags: ["Products"],
  summary: "Get a product by ID",
  description: "Add `?detail=true` to get full payload: variants, attributes, and resolved images with fallback logic.",
  request: {
    params: ProductIdParam,
    query: z.object({
      detail: z.enum(["true", "false"]).optional()
        .openapi({ description: "Return full product detail with variants, attributes, and images" }),
    }),
  },
  responses: {
    200: {
      description: "Product — basic or detail depending on ?detail param",
      content: {
        "application/json": {
          schema: z.union([
            successResponse(ProductSchema).openapi({ description: "Basic (default)" }),
            successResponse(ProductDetailSchema).openapi({ description: "Full detail (?detail=true)" }),
          ]),
        }
      },
    },
    404: { description: "Product not found", content: { "application/json": { schema: errorSchema } } },
  },
})

registry.registerPath({
  method: "post",
  path: "/products",
  tags: ["Products"],
  summary: "Create a new product (admin only)",
  security: [{ bearerAuth: [] }],
  request: { body: { content: { "application/json": { schema: CreateProductBody } } } },
  responses: {
    201: { description: "Product created", content: { "application/json": { schema: successResponse(ProductSchema) } } },
    401: { description: "Unauthorized", content: { "application/json": { schema: errorSchema } } },
    403: { description: "Forbidden", content: { "application/json": { schema: errorSchema } } },
    422: { description: "Validation error", content: { "application/json": { schema: errorSchema } } },
  },
})

registry.registerPath({
  method: "patch",
  path: "/products/{id}",
  tags: ["Products"],
  summary: "Update a product (admin only)",
  security: [{ bearerAuth: [] }],
  request: {
    params: ProductIdParam,
    body: { content: { "application/json": { schema: CreateProductBody.partial() } } },
  },
  responses: {
    200: { description: "Product updated", content: { "application/json": { schema: successResponse(ProductSchema) } } },
    401: { description: "Unauthorized", content: { "application/json": { schema: errorSchema } } },
    403: { description: "Forbidden", content: { "application/json": { schema: errorSchema } } },
    404: { description: "Product not found", content: { "application/json": { schema: errorSchema } } },
  },
})

registry.registerPath({
  method: "delete",
  path: "/products/{id}",
  tags: ["Products"],
  summary: "Soft-delete a product (admin only)",
  security: [{ bearerAuth: [] }],
  request: { params: ProductIdParam },
  responses: {
    200: { description: "Product deactivated", content: { "application/json": { schema: successResponse(ProductSchema) } } },
    401: { description: "Unauthorized", content: { "application/json": { schema: errorSchema } } },
    403: { description: "Forbidden", content: { "application/json": { schema: errorSchema } } },
    404: { description: "Product not found", content: { "application/json": { schema: errorSchema } } },
  },
})

// ─────────────────────────────────────────────
// Variants
// ─────────────────────────────────────────────
registry.registerPath({
  method: "get",
  path: "/products/{productId}/variants/{variantId}",
  tags: ["Variants"],
  summary: "Get a single variant",
  request: { params: VariantParams },
  responses: {
    200: { description: "Variant found", content: { "application/json": { schema: successResponse(VariantSchema) } } },
    404: { description: "Variant not found", content: { "application/json": { schema: errorSchema } } },
  },
})

registry.registerPath({
  method: "post",
  path: "/products/{productId}/variants",
  tags: ["Variants"],
  summary: "Add a variant to a product (admin only)",
  security: [{ bearerAuth: [] }],
  request: {
    params: z.object({ productId: z.string().openapi({ example: "1" }) }),
    body: { content: { "application/json": { schema: CreateVariantBody } } },
  },
  responses: {
    201: { description: "Variant created", content: { "application/json": { schema: successResponse(VariantSchema) } } },
    401: { description: "Unauthorized", content: { "application/json": { schema: errorSchema } } },
    403: { description: "Forbidden", content: { "application/json": { schema: errorSchema } } },
    404: { description: "Product not found", content: { "application/json": { schema: errorSchema } } },
  },
})

registry.registerPath({
  method: "patch",
  path: "/products/{productId}/variants/{variantId}",
  tags: ["Variants"],
  summary: "Update a variant (admin only)",
  security: [{ bearerAuth: [] }],
  request: {
    params: VariantParams,
    body: { content: { "application/json": { schema: CreateVariantBody.partial() } } },
  },
  responses: {
    200: { description: "Variant updated", content: { "application/json": { schema: successResponse(VariantSchema) } } },
    401: { description: "Unauthorized", content: { "application/json": { schema: errorSchema } } },
    403: { description: "Forbidden", content: { "application/json": { schema: errorSchema } } },
    404: { description: "Variant not found", content: { "application/json": { schema: errorSchema } } },
  },
})

registry.registerPath({
  method: "delete",
  path: "/products/{productId}/variants/{variantId}",
  tags: ["Variants"],
  summary: "Soft-delete a variant (admin only)",
  security: [{ bearerAuth: [] }],
  request: { params: VariantParams },
  responses: {
    200: { description: "Variant deactivated", content: { "application/json": { schema: successResponse(VariantSchema) } } },
    401: { description: "Unauthorized", content: { "application/json": { schema: errorSchema } } },
    403: { description: "Forbidden", content: { "application/json": { schema: errorSchema } } },
    404: { description: "Variant not found", content: { "application/json": { schema: errorSchema } } },
  },
})

// ─────────────────────────────────────────────
// Variant Images
// ─────────────────────────────────────────────
registry.registerPath({
  method: "post",
  path: "/products/{productId}/variants/{variantId}/images",
  tags: ["Variant Images"],
  summary: "Upload an image for a variant (admin only)",
  description: "If no variant images exist, the product-level images are used as fallback automatically.",
  security: [{ bearerAuth: [] }],
  request: {
    params: VariantParams,
    body: { content: { "application/json": { schema: AddVariantImageBody } } },
  },
  responses: {
    201: { description: "Image added", content: { "application/json": { schema: successResponse(VariantImageSchema) } } },
    401: { description: "Unauthorized", content: { "application/json": { schema: errorSchema } } },
    403: { description: "Forbidden", content: { "application/json": { schema: errorSchema } } },
    404: { description: "Variant not found", content: { "application/json": { schema: errorSchema } } },
  },
})

registry.registerPath({
  method: "delete",
  path: "/products/{productId}/variants/{variantId}/images/{imageId}",
  tags: ["Variant Images"],
  summary: "Delete a variant image (admin only)",
  security: [{ bearerAuth: [] }],
  request: { params: ImageIdParams },
  responses: {
    200: { description: "Image deleted", content: { "application/json": { schema: successResponse(VariantImageSchema) } } },
    401: { description: "Unauthorized", content: { "application/json": { schema: errorSchema } } },
    403: { description: "Forbidden", content: { "application/json": { schema: errorSchema } } },
    404: { description: "Image not found", content: { "application/json": { schema: errorSchema } } },
  },
})

// ─────────────────────────────────────────────
// Prices
// ─────────────────────────────────────────────
registry.registerPath({
  method: "get",
  path: "/products/{productId}/variants/{variantId}/price",
  tags: ["Prices"],
  summary: "Get current active price for a variant",
  description: "Public endpoint — returns `sellPrice` visible to customers. `costPrice` is also included but should be hidden in frontend for non-admins.",
  request: { params: VariantParams },
  responses: {
    200: { description: "Active price", content: { "application/json": { schema: successResponse(PriceSchema) } } },
    404: { description: "Variant not found", content: { "application/json": { schema: errorSchema } } },
  },
})

registry.registerPath({
  method: "get",
  path: "/products/{productId}/variants/{variantId}/price/history",
  tags: ["Prices"],
  summary: "Get full price change history (admin only)",
  description: "Includes cost price history. Restricted to admins to protect margin data.",
  security: [{ bearerAuth: [] }],
  request: { params: VariantParams },
  responses: {
    200: { description: "Price history log", content: { "application/json": { schema: successResponse(z.array(PriceHistorySchema)) } } },
    401: { description: "Unauthorized", content: { "application/json": { schema: errorSchema } } },
    403: { description: "Forbidden", content: { "application/json": { schema: errorSchema } } },
    404: { description: "Variant not found", content: { "application/json": { schema: errorSchema } } },
  },
})

registry.registerPath({
  method: "post",
  path: "/products/{productId}/variants/{variantId}/price",
  tags: ["Prices"],
  summary: "Set initial price for a variant (admin only)",
  description: "Use this only once when first creating the variant. Use PATCH to update an existing price.",
  security: [{ bearerAuth: [] }],
  request: {
    params: VariantParams,
    body: { content: { "application/json": { schema: SetPriceBody } } },
  },
  responses: {
    201: { description: "Price set", content: { "application/json": { schema: successResponse(PriceSchema) } } },
    400: { description: "Price already exists", content: { "application/json": { schema: errorSchema } } },
    401: { description: "Unauthorized", content: { "application/json": { schema: errorSchema } } },
    403: { description: "Forbidden", content: { "application/json": { schema: errorSchema } } },
  },
})

registry.registerPath({
  method: "patch",
  path: "/products/{productId}/variants/{variantId}/price",
  tags: ["Prices"],
  summary: "Update variant price (admin only)",
  description: "Atomically deactivates the current price, inserts a new one, and appends a record to price history.",
  security: [{ bearerAuth: [] }],
  request: {
    params: VariantParams,
    body: { content: { "application/json": { schema: UpdatePriceBody } } },
  },
  responses: {
    200: { description: "Price updated + history logged", content: { "application/json": { schema: successResponse(PriceSchema) } } },
    401: { description: "Unauthorized", content: { "application/json": { schema: errorSchema } } },
    403: { description: "Forbidden", content: { "application/json": { schema: errorSchema } } },
    404: { description: "Variant not found", content: { "application/json": { schema: errorSchema } } },
  },
})