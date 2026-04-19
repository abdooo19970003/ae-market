// ─────────────────────────────────────────────────────────────────
// Helper that handles the "update price" flow correctly:
//   1. Deactivate current active price row
//   2. Insert new active price row
//   3. Append a row to price_history
// All three steps run inside ONE transaction.
// ─────────────────────────────────────────────────────────────────

import z from "zod";
import { db, insertPriceHistorySchema, priceHistory, variantPrices } from "@repo/db"
import { and, desc, eq } from "drizzle-orm";

//_______________________________
// INPUT VALIDATION
//_______________________________
const UpdatePriceSchema = z.object({
  variantId: z.number().int().positive(),
  newCostPrice: z.string().regex(/^\d+(\.\d{1,2})?$/),
  newSellPrice: z.string().regex(/^\d+(\.\d{1,2})?$/),
  reason: insertPriceHistorySchema.shape.reason,
  note: z.string().max(1000).optional(),
  changedBy: z.number().int().positive().optional(),
})

export type UpdatePriceInput = z.infer<typeof UpdatePriceSchema>;

//_______________________________
// get active current orice for  the variant 
//_______________________________
export async function getActivePrice(variantId: number) {
  const [row] = await db
    .select()
    .from(variantPrices)
    .where(
      and(
        eq(variantPrices.variantId, variantId),
        eq(variantPrices.isActive, true)
      ))
    .limit(1)
  return row ?? null
}

//_______________________________
// get full price history for a variant
//_______________________________
export async function getPriceHistory(variantId: number) {
  const rows = await db
    .select()
    .from(priceHistory)
    .where(eq(priceHistory.variantId, variantId))
    .orderBy(desc(priceHistory.changedAt))
  return rows
}


//_______________________________
// Update price - atomic transaction
//    1. deactivet old price row
//    2. insert new price row
//    3. append a row to price_history
//_______________________________
export async function updatePrice(rawInput: UpdatePriceInput) {
  const input = UpdatePriceSchema.parse(rawInput)

  return db.transaction(async tx => {
    // 1. Fetch current active price row
    const [currentPrice] = await tx
      .select()
      .from(variantPrices)
      .where(
        and(
          eq(variantPrices.variantId, input.variantId),
          eq(variantPrices.isActive, true)
        ))
      .limit(1)

    // 2. Deactivate current price row 
    if (currentPrice) {
      await tx
        .update(variantPrices)
        .set({ isActive: false })
        .where(eq(variantPrices.id, currentPrice.id))
    }

    // 3. Insert new price row
    const [newPrice] = await tx
      .insert(variantPrices)
      .values({
        variantId: input.variantId,
        costPrice: input.newCostPrice,
        sellPrice: input.newSellPrice,
        isActive: true
      })
      .returning()

    // 4. Append to History
    await tx
      .insert(priceHistory)
      .values({
        variantId: input.variantId,
        oldCostPrice: currentPrice?.costPrice,
        newCostPrice: input.newCostPrice,
        oldSellPrice: currentPrice?.sellPrice,
        newSellPrice: input.newSellPrice,
        reason: input.reason,
        note: input.note,
        changedBy: input.changedBy,
      })

    // 5. Return the new price
    return newPrice
  })
}


//_______________________________
// Set initial price (first tim --> no old values)
//_______________________________
export async function setInitialPrice(variantId: number, costPrice: number, sellPrice: number, changedBy: number) {
  // Guard: don't set initial price if one already exists
  const existing = await getActivePrice(variantId)

  if (existing)
    throw new Error("Initial price already set, Use updatePrice instead")

  return db.transaction(async tx => {
    // 1. Insert
    const [newPrice] = await tx
      .insert(variantPrices)
      .values({
        variantId,
        costPrice: costPrice.toString(),
        sellPrice: sellPrice.toString(),
        isActive: true,
      })
      .returning();

    // 2. Append to History
    await tx
      .insert(priceHistory)
      .values({
        variantId,
        oldCostPrice: null,
        newCostPrice: costPrice.toString(),
        oldSellPrice: null,
        newSellPrice: sellPrice.toString(),
        reason: "initial price",
        note: null,
        changedBy,
      })
    return newPrice
  })
}
