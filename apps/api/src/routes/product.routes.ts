import { Router } from "express";
import * as prodCtrl from "../controllers/product.controller";
import { protect as prodProtect } from "../middlewares/auth.middleware";
import { requireRole as prodRequiredRole } from "../middlewares/auth.middleware";


const productRouter = Router()

// ── Products ─────────────────────────────────
// PUBLIC
productRouter.get("/", prodCtrl.listProducts)
productRouter.get("/:id", prodCtrl.getProduct)

// PROTECTED 
productRouter.post("/", prodProtect, prodRequiredRole("admin"), prodCtrl.createProduct);
productRouter.patch("/:id", prodProtect, prodRequiredRole("admin"), prodCtrl.updateProduct);
productRouter.delete("/:id", prodProtect, prodRequiredRole("admin"), prodCtrl.deleteProduct)

// ── Variants ─────────────────────────────────
// PUBLIC
productRouter.get("/:productId/variants/:variantId", prodCtrl.getVariant)

// PROTECTED
productRouter.post("/:productId/variants", prodProtect, prodRequiredRole("admin"), prodCtrl.createVariant)
productRouter.patch("/:productId/variants/:variantId", prodProtect, prodRequiredRole("admin"), prodCtrl.updateVariant)
productRouter.delete(
  "/:productId/variants/:variantId",
  prodProtect,
  prodRequiredRole("admin"), prodCtrl.deleteVariant
);

// ── Variant Images ─────────────────────────────────
productRouter.post("/:productId/variants/:variantId/images", prodProtect, prodRequiredRole("admin"), prodCtrl.addVariantImage)
productRouter.delete("/:productId/variants/:variantId/images/:imageId", prodProtect, prodRequiredRole("admin"), prodCtrl.deleteVariantImage,);

// ── Prices ─────────────────────────────────
productRouter.get("/:productId/variants/:variantId/price", prodCtrl.getActivePrice)
productRouter.get("/:productId/variants/:variantId/price/history", prodProtect, prodRequiredRole("admin"), prodCtrl.getPriceHistory)
productRouter.post("/:productId/variants/:variantId/price", prodProtect, prodRequiredRole("admin"), prodCtrl.setInitialPrice)
productRouter.patch("/:productId/variants/:variantId/price", prodProtect, prodRequiredRole("admin"), prodCtrl.updatePrice);
export default productRouter