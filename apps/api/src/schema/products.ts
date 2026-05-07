import { boolean, integer, pgTable, serial, timestamp, unique, varchar } from "drizzle-orm/pg-core";
import { attributeOptions, categories, categoryAttributes } from "./categories";
import { text } from "drizzle-orm/pg-core";
import { is, relations, sql } from "drizzle-orm";
import { numeric } from "drizzle-orm/pg-core";
import { check } from "drizzle-orm/pg-core";
import { users } from "./users";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";


// ________________
// Products
// ________________

export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  categoryId: integer("category_id")
    .notNull()
    .references((): any => categories.id, {
      onDelete: "restrict"
    }),

  name: varchar("name", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  sku: varchar("sku", { length: 100 }).notNull().unique(),
  description: text("description"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updaatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
})

export const productsRelations = relations(products, ({ one, many }) => ({
  category: one(categories, {
    fields: [products.categoryId],
    references: [categories.id],
    relationName: "products_category"
  }),
  varianats: many(productVariants),
  attributeValues: many(productAttributeValues),
  images: many(productImages),
}))

//________________________________________________________________________
// PRODUCT VARIANTS
// (each variant = a purchasable combinaation , e.g. iPhone 128GB Black)
//________________________________________________________________________
export const productVariants = pgTable("product_variants", {
  id: serial("id").primaryKey(),
  productId: integer("product_id")
    .notNull()
    .references((): any => products.id, {
      onDelete: "cascade"
    }),
  name: varchar("name", { length: 255 }), // e.g. 128GB Black
  sku: varchar("sku", { length: 100 }).notNull().unique(),
  stockQuantity: integer("stock_quantity").notNull().default(0),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updaatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
})

export const productVariantsRelations = relations(productVariants, ({ one, many }) => ({
  product: one(products, {
    fields: [productVariants.productId],
    references: [products.id],
    relationName: "product_variants_product"
  }),
  attributeValues: many(productAttributeValues),
  priceHistory: many(priceHistory),
  images: many(variantImages)
}))



// ─────────────────────────────────────────────
// VARIANT PRICES  (current active price per variant)
//
//  cost_price  = سعر الشراء  (what you pay the supplier)
//  sell_price  = سعر البيع   (what the customer pays)
//
//  Only one row per variant is "active" at any time.
//  When you update prices → deactivate old row + insert new row.
// ─────────────────────────────────────────────
export const variantPrices = pgTable("variant_prices", {
  id: serial("id").primaryKey(),
  variantId: integer("variant_id")
    .notNull()
    .references((): any => productVariants.id, {
      onDelete: "cascade"
    }),
  costPrice: numeric("cost_price", { precision: 12, scale: 2 }).notNull(),
  sellPrice: numeric("sell_price", { precision: 12, scale: 2 }).notNull(),
  isActive: boolean("is_active").notNull().default(true),
  effectiveAt: timestamp("effective_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull()
},
  t => [
    check("chk_cost_price_positive", sql`${t.costPrice} >= 0`),
    check("chk_sell_price_positive", sql`${t.sellPrice} >= 0`),
  ])

export const variantPricesRelations = relations(variantPrices, ({ one, many }) => ({
  variant: one(productVariants, {
    fields: [variantPrices.variantId],
    references: [productVariants.id],
    relationName: "variant_prices_variant"
  }),
}))

//______________________________
// PRICE HISTORY
// full audit log of every price change
//______________________________
export const priceChangeReasonEnum = [
  "manual_update",
  "promotion",
  "supplier_change",
  "correction",
  "other"
]

export const priceHistory = pgTable("price_history", {
  id: serial("id").primaryKey(),
  variantId: integer("variant_id").notNull().references((): any => productVariants.id, { onDelete: "cascade" }),

  // __Snapshot of what change __________________________
  oldCostPrice: numeric("old_cost_price", { precision: 12, scale: 2 }), // NULL on first insert
  newCostPrice: numeric("new_cost_price", { precision: 12, scale: 2 }).notNull(),
  oldSellPrice: numeric("old_sell_price", { precision: 12, scale: 2 }), // NULL on first insert
  newSellPrice: numeric("new_sell_price", { precision: 12, scale: 2 }).notNull(),

  // __Why it changed ___________________________________
  reason: varchar("reason", { length: 50 })
    .$type<typeof priceChangeReasonEnum[number]>()
    .notNull()
    .default("manual_update"),
  note: text("note"), // free text explaination

  // __Who & When _______________________________________
  changedBy: integer("changed_by"), // FK for users Table 
  changedAt: timestamp("changed_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
})

export const priceHistoryRelations = relations(priceHistory, ({ one, many }) => ({
  variant: one(productVariants, {
    fields: [priceHistory.variantId],
    references: [productVariants.id],
    relationName: "price_history_variant"
  }),
  user: one(users, {
    fields: [priceHistory.changedBy],
    references: [users.id],
    relationName: "price_history_user"
  }),
}))



//________________________________________________
// PRODUCT-LEVEL ATTRIBUTE VALUES
//________________________________________________
export const productAttributeValues = pgTable("product_attribute_values", {
  id: serial("id").primaryKey(),
  productId: integer("product_id")
    .notNull()
    .references((): any => products.id, { onDelete: "cascade" }),
  attributeId: integer("attribute_id")
    .notNull()
    .references((): any => categoryAttributes.id, { onDelete: "cascade" }),
  valueText: text("value_text"),
  valueOptionId: integer("value_option_id")
    .references((): any => attributeOptions.id, { onDelete: "set null" }),
},
  t => [unique("unique_product_attribute_value").on(t.productId, t.attributeId)]
)

export const productAttributeValuesRelations = relations(productAttributeValues, ({ one, many }) => ({
  product: one(products, {
    fields: [productAttributeValues.productId],
    references: [products.id],
    relationName: "product_attribute_values_product"
  }),
  attribute: one(categoryAttributes, {
    fields: [productAttributeValues.attributeId],
    references: [categoryAttributes.id],
    relationName: "product_attribute_values_attribute"
  }),
  option: one(attributeOptions, {
    fields: [productAttributeValues.valueOptionId],
    references: [attributeOptions.id],
    relationName: "product_attribute_values_option"
  }),

}))

//________________________________________________
// VARIANT-LEVEL ATTRIBUTE VALUES
//________________________________________________
export const variantAttributeValues = pgTable("variant_attribute_values", {
  id: serial("id").primaryKey(),
  variantId: integer("variant_id")
    .notNull()
    .references((): any => productVariants.id, { onDelete: "cascade" }),
  attributeId: integer("attribute_id")
    .notNull()
    .references((): any => categoryAttributes.id, { onDelete: "cascade" }),
  valueText: text("value_text"),
  valueOptionId: integer("value_option_id")
    .references((): any => attributeOptions.id, { onDelete: "set null" }),
},
  t => [unique().on(t.variantId, t.attributeId)]
)

export const variantAttributeValuesRelations = relations(variantAttributeValues, ({ one, many }) => ({
  variant: one(productVariants, {
    fields: [variantAttributeValues.variantId],
    references: [productVariants.id],
    relationName: "variant_attribute_values_variant"
  }),
  attribute: one(categoryAttributes, {
    fields: [variantAttributeValues.attributeId],
    references: [categoryAttributes.id],
  }),
  option: one(attributeOptions, {
    fields: [variantAttributeValues.valueOptionId],
    references: [attributeOptions.id],
  }),
}))

//________________________________________________
// PRODUCT IMAGES (fallback images - always exist)
//________________________________________________
export const productImages = pgTable("product_images", {
  id: serial("id").primaryKey(),
  productId: integer("product_id")
    .notNull()
    .references((): any => products.id, { onDelete: "cascade" }),
  url: text("image_url").notNull(),
  altText: text("alt_text"),
  isPrimary: boolean("is_primary").notNull().default(false),
  sortOrder: integer("sort_order").notNull().default(0)
})

export const productImagesRelations = relations(productImages, ({ one, many }) => ({
  product: one(products, {
    fields: [productImages.productId],
    references: [products.id],
    relationName: "product_images_product"
  }),
}))


//________________________________________________
// VARIANT IMAGES 
// (optional - override product images) 
// logic on fetch 
//    variant.images.length > 0 ==> use variant images
//    variant.images.length == 0 ==> fallback to product images
//________________________________________________
export const variantImages = pgTable("variant_images", {
  id: serial("id").primaryKey(),
  variantId: integer("variant_id")
    .notNull()
    .references((): any => productVariants.id)
  ,
  url: text("image_url").notNull(),
  isPrimary: boolean("is_primary").notNull().default(false),
  altText: text("alt_text"),
  sortOrder: integer("sort_order").notNull().default(0)
})

export const variantImagesRelations = relations(variantImages, ({ one, many }) => ({
  variant: one(productVariants, {
    fields: [variantImages.variantId],
    references: [productVariants.id],
    relationName: "variant_images_variant"
  }),
}))

//________________________________________________
// ZOD SCHEMAS 
//________________________________________________
export const insertProductSchema = createInsertSchema(products, {
  slug: z.string().min(2).max(255).regex(/^[a-z0-9-]+$/, "slug must be lowercase with hyphens only"),
  name: z.string().min(2).max(255),
})
export const selectProductSchema = createSelectSchema(products)

export const insertVariantSchema = createInsertSchema(productVariants)

export const insertVariantPriceSchema = createInsertSchema(variantPrices,
  {
    costPrice: z.string().regex(/^\d+(\.\d{1,2})?$/),
    sellPrice: z.string().regex(/^\d+(\.\d{1,2})?$/),
  }
)

export const insertPriceHistorySchema = createInsertSchema(priceHistory, {
  reason: z.enum(priceChangeReasonEnum).default("manual_update"),
  note: z.string().max(1000).optional()
})
