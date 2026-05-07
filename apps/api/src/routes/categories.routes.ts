import { Router } from "express"
import * as catCtrl from "../controllers/categories.controller";
import { protect as catProtect, requireRole } from "../middlewares/auth.middleware";
import { parseQueryParams } from "../middlewares/queryHandler.middleware";

const categoriesRouter = Router()

/**
 * @openapi
 * /api/v1/categories:
 *   get:
 *     summary: List all categories
 *     tags: [Categories]
 *     responses:
 *       200:
 *         description: List of categories
 */
categoriesRouter.get("/", parseQueryParams, catCtrl.listCategories);

/**
 * @openapi
 * /api/v1/categories/{id}:
 *   get:
 *     summary: Get category by ID
 *     tags: [Categories]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Category found
 *       404:
 *         description: Category not found
 */
categoriesRouter.get("/:id", catCtrl.getCategory);

/**
 * @openapi
 * /api/v1/categories/slug/{slug}:
 *   get:
 *     summary: Get category by slug
 *     tags: [Categories]
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Category found
 *       404:
 *         description: Category not found
 */
categoriesRouter.get("/slug/:slug", catCtrl.getCategoryBySlug);

/**
 * @openapi
 * /api/v1/categories/{id}/children:
 *   get:
 *     summary: Get child categories
 *     tags: [Categories]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Child categories retrieved
 */
categoriesRouter.get("/:id/children", catCtrl.getChildren);

/**
 * @openapi
 * /api/v1/categories/{id}/attributes:
 *   get:
 *     summary: Get category attributes
 *     tags: [Categories]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Category attributes retrieved
 */
categoriesRouter.get("/:id/attributes", catCtrl.getCategoryAttributes)

categoriesRouter.post("/:id/attributes", catProtect, requireRole("admin"), catCtrl.createCategoryAttribute)

categoriesRouter.delete("/:id/attributes/:attributeId", catProtect, requireRole("admin"), catCtrl.deleteCategoryAttribute)

categoriesRouter.post("/:id/attributes/:attributeId/options", catProtect, requireRole("admin"), catCtrl.createAttributeOption)


/**
 * @openapi
 * /api/v1/categories/{id}/products:
 *   get:
 *     summary: Get products in category
 *     tags: [Categories]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Products retrieved
 */
categoriesRouter.get("/:id/products", catCtrl.getCategoryProducts)

/**
 * @openapi
 * /api/v1/categories:
 *   post:
 *     summary: Create new category
 *     tags: [Categories]
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
 *         description: Category created
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
categoriesRouter.post("/", catProtect, requireRole("admin"), catCtrl.createCategory);

/**
 * @openapi
 * /api/v1/categories/{id}:
 *   patch:
 *     summary: Update category
 *     tags: [Categories]
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
 *         description: Category updated
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
categoriesRouter.patch("/:id", catProtect, requireRole("admin"), catCtrl.updateCategory);

/**
 * @openapi
 * /api/v1/categories/{id}:
 *   delete:
 *     summary: Delete category
 *     tags: [Categories]
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
 *         description: Category deleted
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
categoriesRouter.delete("/:id", catProtect, requireRole("admin"), catCtrl.deleteCategory);
export default categoriesRouter
