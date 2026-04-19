import { Router } from "express";
import * as productSvc from "../services/product.service"
import { sendSuccess } from "../lib/response";

const productRouter = Router()

// ═══════════════════════════════════════════════════════════════
// PRODUCTS
// ═══════════════════════════════════════════════════════════════

// ── GET /products ───────────────────────────────────────────────
// ?categoryId=1  filter by category
// ?isActive=true filter by status
productRouter.get("/", async (req, res) => {
  try {
    const filters = {
      categoryId: req.query.categoryId ? Number(req.query.categoryId) : undefined,
      isActive: req.query.isActive !== undefined
        ? req.query.isActive === "true"
        : undefined,
    }
    const data = await productSvc.getProducts(filters)
    sendSuccess(res, data)
  } catch (error) {

  }
})



export default productRouter