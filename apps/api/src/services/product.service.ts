import {
  attributeOptions,
  categoryAttributes,
  db,
  insertProductSchema,
  insertVariantSchema,
  productAttributeValues,
  productImages,
  products,
  productVariants,
  variantAttributeValues,
  variantImages,
  variantPrices,
} from '../db'
import { and, eq, inArray } from 'drizzle-orm'
import { AppError, NotFoundError } from '../lib/response'
import { StatusCodes } from 'http-status-codes'
import { resolveVariantImages } from './images.service'
import { z } from 'zod'


export type CreateProductInput = z.infer<typeof insertProductSchema>
export type CreateVariantInput = z.infer<typeof insertVariantSchema>

//________________________________________
// PRODUCTS
//________________________________________
export async function getProducts(
  filters: { categoryId?: number; isActive?: boolean } = {},
) {
  const conditionts = []
  if (filters.categoryId)
    conditionts.push(eq(products.categoryId, filters.categoryId))
  if (filters.isActive !== undefined)
    conditionts.push(eq(products.isActive, filters.isActive))

  return db
    .select()
    .from(products)
    .where(conditionts.length > 0 ? and(...conditionts) : undefined)
}

export const getProductById = async (id: number) => {
  const [row] = await db
    .select()
    .from(products)
    .where(eq(products.id, id))
    .limit(1)

  if (!row) throw new NotFoundError('Product')

  return row
}

// Full product detail: product + attributes + images + variants (with prices + images)
export const getProductDetail = async (id: number) => {
  const product = await getProductById(id)

  // __ Product-Level Attributes ________________
  const attrValues = await db
    .select({
      attributeId: productAttributeValues.attributeId,
      attributeName: categoryAttributes.name,
      attributeSlug: categoryAttributes.slug,
      inputType: categoryAttributes.inputType,
      unit: categoryAttributes.unit,
      valueText: productAttributeValues.valueText,
      optionLabel: attributeOptions.label,
      optionValue: attributeOptions.value,
    })
    .from(productAttributeValues)
    .innerJoin(
      categoryAttributes,
      eq(categoryAttributes.id, productAttributeValues.attributeId),
    )
    .leftJoin(
      attributeOptions,
      eq(attributeOptions.id, productAttributeValues.valueOptionId),
    )
    .where(eq(productAttributeValues.productId, id))

  // __ Product Images (fallback pool) __________
  const prodImages = await db
    .select()
    .from(productImages)
    .where(eq(productImages.productId, id))
    .orderBy(productImages.sortOrder)

  // __ Variants ________________________________
  const variants = await db
    .select()
    .from(productVariants)
    .where(eq(productVariants.productId, id))

  const variantIds = variants.map((v) => v.id)

  // Batch-fetch prices, images and attribute values for all variants
  const [allVariantPrices, allVariantImages, allVariantAttrValues] =
    variantIds.length
      ? await Promise.all([
        db
          .select()
          .from(variantPrices)
          .where(
            and(
              inArray(variantPrices.variantId, variantIds),
              eq(variantPrices.isActive, true),
            ),
          ),

        db
          .select()
          .from(variantImages)
          .where(and(inArray(variantImages.variantId, variantIds))),

        db
          .select({
            variantId: variantAttributeValues.variantId,
            attributeId: variantAttributeValues.attributeId,
            attributeName: categoryAttributes.name,
            attributeSlug: categoryAttributes.slug,
            inputType: categoryAttributes.inputType,
            unit: categoryAttributes.unit,
            valueText: variantAttributeValues.valueText,
            optionLabel: attributeOptions.label,
            optionValue: attributeOptions.value,
          })
          .from(variantAttributeValues)
          .innerJoin(
            categoryAttributes,
            eq(categoryAttributes.id, variantAttributeValues.attributeId),
          )
          .leftJoin(
            attributeOptions,
            eq(attributeOptions.id, variantAttributeValues.valueOptionId),
          )
          .where(inArray(variantAttributeValues.variantId, variantIds)),
      ])
      : [[], [], []]

  // Assemble variant objects
  const enrichedVariants = variants.map((v) => {
    const vImages = allVariantImages.filter((iv) => iv.variantId === v.id)
    const { images, source } = resolveVariantImages(
      vImages,
      prodImages,
    )

    return {
      ...v,
      price: allVariantPrices.find((vp) => vp.variantId === v.id) ?? null,
      attributes: allVariantAttrValues.filter((av) => av.variantId === v.id),
      images,
      imagesSource: source, // "variant" || "product"
    }
  })
  return {
    ...product,
    attributes: attrValues,
    images: prodImages,
    variants: enrichedVariants,
  }
}

export async function createProduct(input: CreateProductInput) {
  const [newProduct] = await db.insert(products).values(input).returning()
  if (!newProduct)
    throw new AppError(
      'Failed to create product',
      StatusCodes.INTERNAL_SERVER_ERROR,
    )
  return newProduct
}

export async function updateProduct(
  id: number,
  input: Partial<CreateProductInput>,
) {
  await getProductById(id) // check if product exist (will throw NotFoundError if not)

  const [updated] = await db
    .update(products)
    .set(input)
    .where(eq(products.id, id))
    .returning()

  if (!updated)
    throw new AppError(
      'Failed to update product',
      StatusCodes.INTERNAL_SERVER_ERROR,
    )

  return updated
}

export async function deleteProduct(id: number) {
  await getProductById(id) // check if product exist (will throw NotFoundError if not)

  const [deleted] = await db
    .delete(products)
    .where(eq(products.id, id))
    .returning()
  if (!deleted)
    throw new AppError(
      'Failed to delete product',
      StatusCodes.INTERNAL_SERVER_ERROR,
    )

  return deleted
}

//________________________________________
// VARIANTS
//________________________________________
export async function getVariantById(id: number) {
  const [row] = await db
    .select()
    .from(productVariants)
    .where(eq(productVariants.id, id))
    .limit(1)
  if (!row) throw new NotFoundError('Variant')
  return row
}

export async function createVariant(
  ProductId: number,
  input: Omit<CreateVariantInput, 'productId'>,
) {
  await getProductById(ProductId) // check if product exist

  const [created] = await db
    .insert(productVariants)
    .values({
      ...input,
      productId: ProductId,
    })
    .returning()
  if (!created)
    throw new AppError(
      'Failed to create variant',
      StatusCodes.INTERNAL_SERVER_ERROR,
    )

  return created
}

export async function updateVariant(
  id: number,
  input: Partial<CreateVariantInput>,
) {
  await getVariantById(id) // check if variant exist

  const [updated] = await db
    .update(productVariants)
    .set(input)
    .where(eq(productVariants.id, id))
    .returning()

  if (!updated)
    throw new AppError(
      'Failed to update variant',
      StatusCodes.INTERNAL_SERVER_ERROR,
    )

  return updated
}

export async function deleteVariant(id: number) {
  await getVariantById(id) // check if variant exist

  const [deleted] = await db
    .delete(productVariants)
    .where(eq(productVariants.id, id))
    .returning()
  if (!deleted)
    throw new AppError(
      'Failed to delete variant',
      StatusCodes.INTERNAL_SERVER_ERROR,
    )

  return deleted
}

//________________________________________
// VARIANT IMAGES
//________________________________________
export const insertVariantImageSchema = z.object({
  url: z.string().url(),
  altText: z.string().max(100).optional(),
  isPrimary: z.boolean().optional().default(false),
  sortOrder: z.number().int().positive().optional().default(0),
})
export type VariantImageInput = z.infer<typeof insertVariantImageSchema>



export async function addVariantImage(
  variantId: number,
  input: VariantImageInput
) {
  await getVariantById(variantId) // check if variant exist

  // if new image is primary unset all primaries first
  if (input.isPrimary) {
    await db
      .update(variantImages)
      .set({ isPrimary: false })
      .where(eq(variantImages.variantId, variantId))
  }
  // now we can add the new image
  const [newImage] = await db
    .insert(variantImages)
    .values({
      ...input,
      variantId,
    })
    .returning()
  if (!newImage)
    throw new AppError('Failed to add image', StatusCodes.INTERNAL_SERVER_ERROR)

  return newImage
}

export async function deleteVariantImage(id: number) {
  const [deleted] = await db
    .delete(variantImages)
    .where(eq(variantImages.id, id))
    .returning()
  if (!deleted) throw new NotFoundError('Variant Image')
  return deleted
}
