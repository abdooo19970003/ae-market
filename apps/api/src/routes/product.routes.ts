import { Request, Response, NextFunction, Router } from "express";
import * as productSvc from "../services/product.service"
import * as priceSvc from "../services/price.service"
import { sendSuccess } from "../lib/response";
import { insertProductSchema as createProductBody, insertVariantSchema as createVariantBody } from "../schema";
import { z } from "zod";
import { StatusCodes } from "http-status-codes";


const productRouter = Router()

// ═══════════════════════════════════════════════════════════════
// PRODUCTS
// ═══════════════════════════════════════════════════════════════

// ── GET /products ───────────────────────────────────────────────
// ?categoryId=1  filter by category
// ?isActive=true filter by status
productRouter.get("/", async (req: Request, res: Response, next: NextFunction) => {
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
})

// ── GET /products/:id ────────────────────────────────────────────
// ?detail=true  →  full detail (attributes + variants + images with fallback)

productRouter.get("/:id", async (req: Request, res: Response, next: NextFunction) => {
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
})


// ── POST /products ───────────────────────────────────────────────
productRouter.post("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const input = createProductBody.parse(req.body)
    const data = await productSvc.createProduct(input)
    sendSuccess(res, data, StatusCodes.CREATED)
  } catch (error) {
    next(error)
  }
})

// ── PATCH /products/:id ──────────────────────────────────────────
productRouter.patch("/:id", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const body = createProductBody.partial().parse(req.body);
    const data = await productSvc.updateProduct(Number(req.params.id), body);
    sendSuccess(res, data);
  } catch (err) { next(err); }
});

// ── DELETE /products/:id ─────────────────────────────────────────
productRouter.delete("/:id", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await productSvc.deleteProduct(Number(req.params.id));
    sendSuccess(res, data);
  } catch (err) { next(err); }
});


// ═══════════════════════════════════════════════════════════════
// VARIANTS  /products/:productId/variants
// ═══════════════════════════════════════════════════════════════

// ── GET - get variant by id - /products/:productId/variants/:variantId ───────────────
productRouter.get("/:productId/variants/:variantId", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const productId = Number(req.params.productId)
    const variantId = Number(req.params.variantId)

    const data = await productSvc.getVariantById(variantId)
    sendSuccess(res, data)
  } catch (error) {
    next(error)
  }
})

// ── POST - create new variant - /products/:productId/variants ──────────────────────────
productRouter.post("/:productId/variants", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const productId = Number(req.params.productId)
    const input = createVariantBody.parse(req.body)
    const data = await productSvc.createVariant(productId, input)
    sendSuccess(res, data, StatusCodes.CREATED)
  } catch (error) {
    next(error)
  }
})

// ── PATCH - updata variant - /products/:productId/variants/:variantId ───────────────
productRouter.patch("/:productId/variants/:variantId", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const variantId = req.params.variantId
    const input = createVariantBody.partial().parse(req.body)
    const data = await productSvc.updateVariant(Number(variantId), input)
    sendSuccess(res, data)
  } catch (error) {
    next(error)
  }
})


// ── DELETE - delete variant by id -  /products/:productId/variants/:variantId ──────────────
productRouter.delete(
  "/:productId/variants/:variantId",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const variantId = Number(req.params.variantId);
      const data = await productSvc.deleteVariant(variantId);
      sendSuccess(res, data);
    } catch (err) { next(err); }
  },
);

// ═══════════════════════════════════════════════════════════════
// VARIANT IMAGES  /products/:productId/variants/:variantId/images
// ═══════════════════════════════════════════════════════════════

// ── POST - add new variant image - /:productId/variants/:variantId/images
productRouter.post("/:productId/variants/:variantId/images", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const variantId = Number(req.params.variantId);
    const input = productSvc.insertVariantImageSchema.parse(req.body);
    const data = await productSvc.addVariantImage(variantId, input)
    sendSuccess(res, data, StatusCodes.CREATED)
  }
  catch (err) { next(err); }
})

// ── DELETE /products/:productId/variants/:variantId/images/:imageId
productRouter.delete(
  "/:productId/variants/:variantId/images/:imageId",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await productSvc.deleteVariantImage(Number(req.params.imageId));
      sendSuccess(res, data);
    } catch (err) { next(err); }
  },
);

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
productRouter.get("/:productId/variants/:variantId/price", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const variantId = Number(req.params.variantId)
    const data = await priceSvc.getActivePrice(variantId)
    sendSuccess(res, data)
  } catch (error) {
    next(error)
  }
})

// ── GET /products/:productId/variants/:variantId/price/history ───
productRouter.get("/:productId/variants/:variantId/price/history", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const variantId = Number(req.params.variantId)
    const data = await priceSvc.getPriceHistory(variantId)
    sendSuccess(res, data)
  } catch (error) {
    next(error)
  }
})

// ── POST /products/:productId/variants/:variantId/price ──────────
// Set initial price
productRouter.post("/:productId/variants/:variantId/price", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const variantId = Number(req.params.variantId)
    const input = SetPriceBody.parse(req.body)
    const data = await priceSvc.setInitialPrice(variantId, input.costPrice, input.sellPrice, res.locals.user.id)
    sendSuccess(res, data, StatusCodes.CREATED)
  } catch (error) {
    next(error)
  }
})


// ── PATCH /products/:productId/variants/:variantId/price ─────────
// Update price (records history)
productRouter.patch(
  "/:productId/variants/:variantId/price",
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
  },
);
export default productRouter