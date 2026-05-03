import { relations } from 'drizzle-orm'
import {
  boolean,
  integer,
  pgEnum,
  pgTable,
  serial,
  text,
  timestamp,
  varchar,
} from 'drizzle-orm/pg-core'
import { productAttributeValues, products } from './products'
import { unique } from 'drizzle-orm/pg-core'
import { createInsertSchema, createSelectSchema } from 'drizzle-zod'

// _____________________________________
// CATEGORIES (self referancing tree)
// _____________________________________
export const categories = pgTable('categories', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 256 }).notNull(),
  slug: varchar('slug', { length: 256 }).notNull().unique(),
  parentId: integer('parent_id').references((): any => categories.id, {
    onDelete: 'restrict',
  }),

  description: text('description'),
  imageUrl: text('image_url'),
  isActive: boolean('is_active').default(true),
  sortOrder: integer('sort_order').notNull().default(0),
  createdAt: timestamp('created_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
})

export const categoriesRelations = relations(categories, ({ one, many }) => ({
  parent: one(categories, {
    fields: [categories.parentId],
    references: [categories.id],
    relationName: 'parent_child',
  }),
  children: many(categories, {
    relationName: 'parent_child',
  }),
  attributes: many(categoryAttributes),
  products: many(products),
}))

//_____________________________
// ATTRIBUTES DEFINATION
//_____________________________
export const attributeInputTypeEnum = pgEnum('attribute_input_type', [
  'text',
  'number',
  'select',
  'multi_select',
  'boolean',
])

export const categoryAttributes = pgTable('category_attributes', {
  id: serial('id').primaryKey(),
  categoryId: integer('category_id')
    .references((): any => categories.id, {
      onDelete: 'cascade',
    })
    .notNull(),
  name: varchar('name', { length: 256 }).notNull(),
  slug: varchar('slug', { length: 256 }).notNull(),
  inputType: attributeInputTypeEnum('input_type').notNull().default('text'),
  unit: varchar('unit', { length: 30 }),
  isRequired: boolean('is_required').default(false),
  isFilterable: boolean('is_filterable').default(true),
  isSearchable: boolean('is_searchable').default(true),
  sortOrder: integer('sort_order').notNull().default(0),

  createdAt: timestamp('created_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
},
  t => [unique("uq_category_attributes_category_slug").on(t.categoryId, t.slug)])

export const categoryAttributesRelations = relations(
  categoryAttributes,
  ({ one, many }) => ({
    category: one(categories, {
      fields: [categoryAttributes.categoryId],
      references: [categories.id],
      relationName: 'category_attributes_category',
    }),
    options: many(attributeOptions),
    productValues: many(productAttributeValues),
  }),
)

//_____________________________
// ATTRIBUTE OPTIONS
//_____________________________
export const attributeOptions = pgTable(
  'attribute_options',
  {
    id: serial('id').primaryKey(),
    attributeId: integer('attribute_id')
      .notNull()
      .references((): any => categoryAttributes.id, {
        onDelete: 'cascade',
      }),
    label: varchar('label', { length: 100 }).notNull(),
    value: varchar('value', { length: 100 }).notNull(),
    sortOrder: integer('sort_order').notNull().default(0),
  },
  (t) => [unique().on(t.attributeId, t.value)],
)

export const attributeOptionsRelations = relations(
  attributeOptions,
  ({ one, many }) => ({
    attribute: one(categoryAttributes, {
      fields: [attributeOptions.attributeId],
      references: [categoryAttributes.id],
      relationName: 'attribute_options_attribute',
    }),
  }),
)

// __________________________
// ZOD SCHEMAS
// _________________________
export const insertCategorySchema = createInsertSchema(categories)
export const selectCategorySchema = createSelectSchema(categories)

export const insertCategoryAttributeSchema =
  createInsertSchema(categoryAttributes)
export const insertAttributeOptionSchema = createInsertSchema(attributeOptions)

export { products, productAttributeValues } from './products'
