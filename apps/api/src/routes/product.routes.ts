import { Router } from "express";
import * as prodCtrl from "../controllers/product.controller";
import { protect as prodProtect } from "../middlewares/auth.middleware";
import { requireRole as prodRequiredRole } from "../middlewares/auth.middleware";


const productRouter = Router()

/**
 * @openapi
 * /api/v1/products:
 *   get:
 *     summary: List all products
 *     tags: [Products]
 *     responses:
 *       200:
 *         description: List of products
 */
productRouter.get("/", prodCtrl.listProducts)

/**
 * @openapi
 * /api/v1/products/{id}:
 *   get:
 *     summary: Get product by ID
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Product found
 *       404:
 *         description: Product not found
 */
productRouter.get("/:id", prodCtrl.getProduct)

/**
 * @openapi
 * /api/v1/products:
 *   post:
 *     summary: Create new product
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       201:
 *         description: Product created
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
productRouter.post("/", prodProtect, prodRequiredRole("admin"), prodCtrl.createProduct);

/**
 * @openapi
 * /api/v1/products/{id}:
 *   patch:
 *     summary: Update product
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Product updated
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
productRouter.patch("/:id", prodProtect, prodRequiredRole("admin"), prodCtrl.updateProduct);

/**
 * @openapi
 * /api/v1/products/{id}:
 *   delete:
 *     summary: Delete product
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Product deleted
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
productRouter.delete("/:id", prodProtect, prodRequiredRole("admin"), prodCtrl.deleteProduct)

/**
 * @openapi
 * /api/v1/products/{productId}/variants/{variantId}:
 *   get:
 *     summary: Get product variant
 *     tags: [Product Variants]
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: variantId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Variant found
 *       404:
 *         description: Variant not found
 */
productRouter.get("/:productId/variants/:variantId", prodCtrl.getVariant)

/**
 * @openapi
 * /api/v1/products/{productId}/variants:
 *   post:
 *     summary: Create product variant
 *     tags: [Product Variants]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       201:
 *         description: Variant created
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
productRouter.post("/:productId/variants", prodProtect, prodRequiredRole("admin"), prodCtrl.createVariant)

/**
 * @openapi
 * /api/v1/products/{productId}/variants/{variantId}:
 *   patch:
 *     summary: Update product variant
 *     tags: [Product Variants]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: variantId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Variant updated
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
productRouter.patch("/:productId/variants/:variantId", prodProtect, prodRequiredRole("admin"), prodCtrl.updateVariant)

/**
 * @openapi
 * /api/v1/products/{productId}/variants/{variantId}:
 *   delete:
 *     summary: Delete product variant
 *     tags: [Product Variants]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: variantId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Variant deleted
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
productRouter.delete(
  "/:productId/variants/:variantId",
  prodProtect,
  prodRequiredRole("admin"), prodCtrl.deleteVariant
);

/**
 * @openapi
 * /api/v1/products/{productId}/variants/{variantId}/images:
 *   post:
 *     summary: Add image to variant
 *     tags: [Variant Images]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: variantId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Image added
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
productRouter.post("/:productId/variants/:variantId/images", prodProtect, prodRequiredRole("admin"), prodCtrl.addVariantImage)

/**
 * @openapi
 * /api/v1/products/{productId}/variants/{variantId}/images/{imageId}:
 *   delete:
 *     summary: Delete variant image
 *     tags: [Variant Images]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: variantId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: imageId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Image deleted
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
productRouter.delete("/:productId/variants/:variantId/images/:imageId", prodProtect, prodRequiredRole("admin"), prodCtrl.deleteVariantImage,);

/**
 * @openapi
 * /api/v1/products/{productId}/variants/{variantId}/price:
 *   get:
 *     summary: Get active price for variant
 *     tags: [Pricing]
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: variantId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Price found
 *       404:
 *         description: Price not found
 */
productRouter.get("/:productId/variants/:variantId/price", prodCtrl.getActivePrice)

/**
 * @openapi
 * /api/v1/products/{productId}/variants/{variantId}/price/history:
 *   get:
 *     summary: Get price history for variant
 *     tags: [Pricing]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: variantId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Price history retrieved
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
productRouter.get("/:productId/variants/:variantId/price/history", prodProtect, prodRequiredRole("admin"), prodCtrl.getPriceHistory)

/**
 * @openapi
 * /api/v1/products/{productId}/variants/{variantId}/price:
 *   post:
 *     summary: Set initial price for variant
 *     tags: [Pricing]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: variantId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               price:
 *                 type: number
 *     responses:
 *       201:
 *         description: Price set
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
productRouter.post("/:productId/variants/:variantId/price", prodProtect, prodRequiredRole("admin"), prodCtrl.setInitialPrice)

/**
 * @openapi
 * /api/v1/products/{productId}/variants/{variantId}/price:
 *   patch:
 *     summary: Update price for variant
 *     tags: [Pricing]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: variantId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               price:
 *                 type: number
 *     responses:
 *       200:
 *         description: Price updated
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
productRouter.patch("/:productId/variants/:variantId/price", prodProtect, prodRequiredRole("admin"), prodCtrl.updatePrice);
export default productRouter