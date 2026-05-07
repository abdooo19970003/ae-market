import { Request, Response, NextFunction } from "express";
import * as productSvc from "../services/product.service"
import * as priceSvc from "../services/price.service"
import { sendSuccess } from "../lib/response";
import { insertProductSchema as createProductBody, insertVariantSchema as createVariantBody } from "../schema";
import { z, ZodError } from "zod";
import { StatusCodes } from "http-status-codes";

// ═══════════════════════════════════════════════════════════════
// PRODUCTS
// ═══════════════════════════════════════════════════════════════

// ── GET /products ───────────────────────────────────────────────
// ?categoryId=1  filter by category
// ?isActive=true filter by status
export const listProducts = async (req: Request, res: Response, next: NextFunction) => {
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
    next(error)
  }
}

// ── GET /products/:id ────────────────────────────────────────────
// ?detail=true  →  full detail (attributes + variants + images with fallback)

export const getProduct = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id)
    const detail = req.query.detail === "true"
    const data = detail
      ? await productSvc.getProductDetail(id)
      : await productSvc.getProductById(id)
    sendSuccess(res, data)
  } catch (error) {
    next(error)
  }
}

// ── POST /products ───────────────────────────────────────────────
export const createProduct = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const input = createProductBody.parse(req.body)
    const data = await productSvc.createProduct(input)
    sendSuccess(res, data, StatusCodes.CREATED)
  } catch (error) {
    next(error)
  }
}

// ── PATCH /products/:id ──────────────────────────────────────────
export const updateProduct = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const body = createProductBody.partial().parse(req.body);
    const data = await productSvc.updateProduct(Number(req.params.id), body);
    sendSuccess(res, data);
  } catch (err) { next(err); }
}

// ── DELETE /products/:id ─────────────────────────────────────────
export const deleteProduct = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await productSvc.deleteProduct(Number(req.params.id));
    sendSuccess(res, data);
  } catch (err) { next(err); }
}


// ═══════════════════════════════════════════════════════════════
// VARIANTS  /products/:productId/variants
// ═══════════════════════════════════════════════════════════════

// ── GET - get variant by id - /products/:productId/variants/:variantId ───────────────
export const getVariant = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const productId = Number(req.params.productId)
    const variantId = Number(req.params.variantId)

    const data = await productSvc.getVariantById(variantId)
    sendSuccess(res, data)
  } catch (error) {
    next(error)
  }
}


// ── POST - create new variant - /products/:productId/variants ──────────────────────────
export const createVariant = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const productId = Number(req.params.productId)
    const input = createVariantBody.parse(req.body)
    const data = await productSvc.createVariant(productId, input)
    sendSuccess(res, data, StatusCodes.CREATED)
  } catch (error) {
    next(error)
  }
}


// ── PATCH - updata variant - /products/:productId/variants/:variantId ───────────────
export const updateVariant = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const variantId = req.params.variantId
    const input = createVariantBody.partial().parse(req.body)
    const data = await productSvc.updateVariant(Number(variantId), input)
    sendSuccess(res, data)
  } catch (error) {
    next(error)
  }
}


// ── DELETE - delete variant by id -  /products/:productId/variants/:variantId ──────────────
export const deleteVariant = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const variantId = Number(req.params.variantId);
    const data = await productSvc.deleteVariant(variantId);
    sendSuccess(res, data);
  } catch (err) { next(err); }
}



// ═══════════════════════════════════════════════════════════════
// VARIANT IMAGES  /products/:productId/variants/:variantId/images
// ═══════════════════════════════════════════════════════════════

// ── POST - add new variant image - /:productId/variants/:variantId/images
export const addVariantImage = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const variantId = Number(req.params.variantId);
    const input = productSvc.insertVariantImageSchema.parse(req.body);
    const data = await productSvc.addVariantImage(variantId, input)
    sendSuccess(res, data, StatusCodes.CREATED)
  }
  catch (err) { next(err); }
}


// ── DELETE /products/:productId/variants/:variantId/images/:imageId
export const deleteVariantImage = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await productSvc.deleteVariantImage(Number(req.params.imageId));
    sendSuccess(res, data);
  } catch (err) { next(err); }
}


// ═══════════════════════════════════════════════════════════════
// PRICES  /products/:productId/variants/:variantId/price
// ═══════════════════════════════════════════════════════════════
const SetPriceBody = z.object({
  costPrice: z.string().regex(/^\d+(\.\d{1,2})?$/),
  sellPrice: z.string().regex(/^\d+(\.\d{1,2})?$/),
});

const UpdatePriceBody = SetPriceBody.extend({
  reason: z.enum(["manual_update", "promotion", "supplier_change", "correction", "other"]).optional().default("manual_update"),
  note: z.string().max(1000).optional(),
});

// ── GET /products/:productId/variants/:variantId/price ───────────
export const getActivePrice = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const variantId = Number(req.params.variantId)
    const data = await priceSvc.getActivePrice(variantId)
    sendSuccess(res, data)
  } catch (error) {
    next(error)
  }
}

// ── GET /products/:productId/variants/:variantId/price/history ───
export const getPriceHistory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const variantId = Number(req.params.variantId)
    const data = await priceSvc.getPriceHistory(variantId)
    sendSuccess(res, data)
  } catch (error) {
    next(error)
  }
}

// ── POST /products/:productId/variants/:variantId/price ──────────
// Set initial price
export const setInitialPrice = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const variantId = Number(req.params.variantId)
    const input = SetPriceBody.parse(req.body)
    const data = await priceSvc.setInitialPrice(variantId, input.costPrice, input.sellPrice, res.locals.user.id)
    sendSuccess(res, data, StatusCodes.CREATED)
  } catch (error) {
    next(error)
  }
}


// ── PATCH /products/:productId/variants/:variantId/price ─────────
// Update price (records history)
export const updatePrice =
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const body = UpdatePriceBody.parse(req.body);
      const data = await priceSvc.updatePrice({
        variantId: Number(req.params.variantId),
        newCostPrice: body.costPrice,
        newSellPrice: body.sellPrice,
        reason: body.reason,
        note: body.note,
      });
      sendSuccess(res, data);
    } catch (err) { next(err); }
  }
