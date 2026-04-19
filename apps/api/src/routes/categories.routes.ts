import { Router } from "express"
import * as catCtrl from "../controllers/categories.controller";
import { protect as catProtect, requireRole } from "../middlewares/auth.middleware";

const categoriesRouter = Router()

// Public
categoriesRouter.get("/", catCtrl.listCategories);
categoriesRouter.get("/:id", catCtrl.getCategory);
categoriesRouter.get("/slug/:slug", catCtrl.getCategoryBySlug);
categoriesRouter.get("/:id/children", catCtrl.getChildren);
categoriesRouter.get("/:id/attributes", catCtrl.getCategoryAttributes)
categoriesRouter.get("/:id/products", catCtrl.getCategoryProducts)

// Admin only
categoriesRouter.post("/", catProtect, requireRole("admin"), catCtrl.createCategory);
categoriesRouter.patch("/:id", catProtect, requireRole("admin"), catCtrl.updateCategory);
categoriesRouter.delete("/:id", catProtect, requireRole("admin"), catCtrl.deleteCategory);
export default categoriesRouter
