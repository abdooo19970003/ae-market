// ─────────────────────────────────────────────────────────────────
// Helper that handles the "update price" flow correctly:
//   1. Deactivate current active price row
//   2. Insert new active price row
//   3. Append a row to price_history
// All three steps run inside ONE transaction.
// ─────────────────────────────────────────────────────────────────

import z from "zod";
import { insertPriceHistorySchema, priceHistory, variantPrices } from "../schema";
import { db } from "..";
import { and, eq } from "drizzle-orm";

const UpdatePriceInput = z.object({
  variantId: z.number().int().positive(),
  newCostPrice: z.string().regex(/^\d+(\.\d{1,2})?$/),
  newSellPrice: z.string().regex(/^\d+(\.\d{1,2})?$/),
  reason: insertPriceHistorySchema.shape.reason,
  note: z.string().max(1000).optional(),
  changedBy: z.number().int().positive().optional(),
})

export type UpdatePriceInput = z.infer<typeof UpdatePriceInput>;

export async function updateVariantPrice(input: UpdatePriceInput) {
  const parsed = UpdatePriceInput.parse(input);

  return db.transaction(async (tx) => {

    // 1. fetch current Active Price (to snapshot as old)
    const [current] = await tx
      .select()
      .from(variantPrices)
      .where(
        and(
          eq(variantPrices.variantId, parsed.variantId),
          eq(variantPrices.isActive, true)
        )
      )
      .limit(1);

    // 2. Deactivate current price row 
    if (current) {
      await tx
        .update(variantPrices)
        .set({ isActive: false })
        .where(eq(variantPrices.id, current.id))
    }

    // 3. Insert new active price row
    const [newPrice] = await tx
      .insert(variantPrices)
      .values({
        variantId: parsed.variantId,
        costPrice: parsed.newCostPrice,
        sellPrice: parsed.newSellPrice,
        isActive: true,
      })
      .returning();

    // 4. Append a row to price_history
    await tx
      .insert(priceHistory)
      .values({
        variantId: parsed.variantId,
        oldCostPrice: current?.costPrice,
        newCostPrice: parsed.newCostPrice,
        oldSellPrice: current?.sellPrice,
        newSellPrice: parsed.newSellPrice,
        reason: parsed.reason,
        note: parsed.note,
        changedBy: parsed.changedBy,
      })

    return newPrice;
  })
}

// ─────────────────────────────────────────────────────────────────
// Example usage in Express route:
//
//   router.patch("/variants/:id/price", async (req, res) => {
//     const result = await updateVariantPrice({
//       variantId:    Number(req.params.id),
//       newCostPrice: req.body.costPrice,
//       newSellPrice: req.body.sellPrice,
//       reason:       req.body.reason ?? "manual_update",
//       note:         req.body.note,
//       changedBy:    req.user?.id,
//     });
//     res.json(result);
//   });
// ─────────────────────────────────────────────────────────────────
