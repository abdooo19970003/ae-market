import { attributeOptions, categories, categoryAttributes, products } from "../schema"
import { db } from "../db"
import { aliasedTable, and, count, desc, eq, getTableColumns, ilike, inArray, or, sql } from "drizzle-orm"
import { AppError, NotFoundError } from "../lib/response"
import { StatusCodes } from "http-status-codes"
// _____________________
// Types
// _____________________
export type CategoryRow = typeof categories.$inferSelect
export type CategoryNode = CategoryRow & { children?: CategoryNode[] }
export type CreateCategoryInput = {
  name: string;
  slug: string;
  parentId?: number | null;
  description?: string | null;
  imageUrl?: string | null;
  isActive: boolean;
  sortOrder?: number;
}

// ─────────────────────────────────────────────
// Build nested tree from flat array (in-memory)
// Efficient for category trees (rarely > 500 rows)
// ─────────────────────────────────────────────
function buildTree(rows: CategoryRow[], parentId: number | null = null): CategoryNode[] {
  return rows
    .filter(row => row.parentId === parentId)
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map(row => ({ ...row, children: buildTree(rows, row.id) }))
}

// Collect all descendant IDs (used for includeSubcategories filter)
function collectDescendantIds(rows: CategoryRow[], rootId: number): number[] {
  const ids: number[] = []
  const queue: number[] = [rootId]
  while (queue.length) {
    const current = queue.shift()!
    ids.push(current)
    rows.filter(row => row.parentId === current)
      .forEach(r => queue.push(r.id))
  }
  return ids
}

// ____________________
// Read
// ____________________
export async function getAllCategories({ limit, offset, column, order, search }: {
  limit: number;
  offset: number;
  column: string;
  order: "asc" | "desc";
  search?: string;
}) {
  const parent = aliasedTable(categories, "parent")

  // search
  const filters = search ?
    or(
      ilike(categories.name, `%${search}%`),
      ilike(categories.slug, `%${search}%`),
      ilike(categories.description, `%${search}%`)
    ) : undefined

  // excute queries 
  const [rows, totalCountResuld] = await Promise.all([
    db
      .select({
        ...getTableColumns(categories),
        parentName: parent.name,
      })
      .from(categories)
      .leftJoin(parent, eq(categories.parentId, parent.id))
      .where(and(filters))
      .limit(limit)
      .offset(offset)
      .orderBy(order === "asc" ? sql`${sql.raw(column)} asc` : sql`${sql.raw(column)} desc`),
    db
      .select({ value: count() })
      .from(categories)
      .where(and(filters))
  ])
  // const rows = await db.select().from(categories).orderBy(categories.sortOrder)
  return [rows, totalCountResuld]
}

export async function getCategoryTree({ search }: {

  search?: string;
}) {
  const filters = search ?
    or(
      ilike(categories.name, `%${search}%`),
      ilike(categories.slug, `%${search}%`),
      ilike(categories.description, `%${search}%`)
    ) : undefined
  const rows = await db
    .select()
    .from(categories)
    .where(and(filters, eq(categories.isActive, true)))
    .orderBy(categories.sortOrder)

  return buildTree(rows)
}

export async function getCategoryById(id: number) {
  const [row] = await db
    .select()
    .from(categories)
    .where(eq(categories.id, id))
    .limit(1)

  if (!row)
    throw new NotFoundError("Category")

  return row
}

export async function getCategoryBySlug(slug: string) {
  const [row] = await db
    .select()
    .from(categories)
    .where(eq(categories.slug, slug))
    .limit(1)

  if (!row)
    throw new NotFoundError("Category")

  return row
}

export async function getChildCategories(parentId: number) {
  await getCategoryById(parentId) // check if parent exist

  const rows = await db
    .select({
      id: categories.id,
      name: categories.name,
      slug: categories.slug,
      description: categories.description,
      mageUrl: categories.imageUrl,
      isActive: categories.isActive,
    })
    .from(categories)
    .where(and(
      eq(categories.parentId, parentId)
    ))
    .orderBy(categories.sortOrder)

  return rows
}

// ─────────────────────────────────────────────
// GET /categories/:id/attributes
// Returns attribute definitions for this category
// + all inherited attributes from ancestor categories
// ─────────────────────────────────────────────
export async function getCategoryAttributes(categoryId: number) {
  await getCategoryById(categoryId) // check if category exist

  // walk ancestor chain in-memory
  const allRows = await db.select().from(categories);
  const ancestorsIds = collectDescendantIds(allRows, categoryId)

  const attrs = await db
    .select({
      id: categoryAttributes.id,
      categoryId: categories.id,
      categoryName: categories.name,
      name: categoryAttributes.name,
      slug: categoryAttributes.slug,
      inputType: categoryAttributes.inputType,
      unit: categoryAttributes.unit,
      isRequired: categoryAttributes.isRequired,
      isFilterable: categoryAttributes.isFilterable,
      isSearchable: categoryAttributes.isSearchable,
      sortOrder: categoryAttributes.sortOrder,
    })
    .from(categoryAttributes)
    .innerJoin(categories, eq(categoryAttributes.categoryId, categories.id))
    .where(inArray(categoryAttributes.categoryId, ancestorsIds))
    .orderBy(categoryAttributes.sortOrder)

  // Attach options for select/multi-select attributes
  const attrsIds = attrs.map(a => a.id)
  const options = attrsIds.length
    ? await db
      .select()
      .from(attributeOptions)
      .where(inArray(attributeOptions.attributeId, attrsIds))
      .orderBy(attributeOptions.sortOrder)
    : []
  return attrs.map(a => ({ ...a, options: options.filter(o => o.attributeId === a.id) }))
}

// Walk up to collect this category + all ancestors
function collectAncestorIds(rows: CategoryRow[], categoryId: number): number[] {
  const ids: number[] = []
  let current: CategoryRow | undefined = rows.find(r => r.id === categoryId)
  while (current) {
    ids.push(current.id)
    current = rows.find(r => r.id === current!.parentId)
  }
  return ids
}

// ─────────────────────────────────────────────
// GET /categories/:id/products
// ─────────────────────────────────────────────
export async function getProductsByCategory(categoryId: number, opts: {
  includeSubcategories?: boolean;
  isActive?: boolean
} = {}) {
  await getCategoryById(categoryId) // check if category exist

  let categoryIds: number[] = [categoryId]

  if (opts.includeSubcategories) {
    const allRows = await db.select().from(categories)
    categoryIds = collectDescendantIds(allRows, categoryId)
  }

  const conditions = [inArray(products.categoryId, categoryIds)]

  if (opts.isActive !== undefined) {
    conditions.push(eq(products.isActive, opts.isActive))
  }

  return db
    .select()
    .from(products)
    .where(and(...conditions))
    .orderBy(desc(products.createdAt))
}

// ____________________
// Write
// ____________________
export async function createCategory(input: CreateCategoryInput) {
  if (input.parentId) await getCategoryById(input.parentId) // 404 Guard

  const [created] = await db
    .insert(categories)
    .values(input)
    .returning()
  if (!created) throw new AppError("Internal Server Error", StatusCodes.INTERNAL_SERVER_ERROR)

  return created
}

export async function updateCategory(id: number, input: Partial<CreateCategoryInput>) {
  await getCategoryById(id) // 404 Guard

  const [updated] = await db
    .update(categories)
    .set(input)
    .where(eq(categories.id, id))
    .returning()
  if (!updated) throw new AppError("Internal Server Error", StatusCodes.INTERNAL_SERVER_ERROR)
  return updated
}

export function deleteCategory(id: number) {
  throw new Error("Function not implemented.")
}
