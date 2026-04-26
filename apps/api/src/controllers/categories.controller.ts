import { NextFunction, Request, Response } from "express"
import { z } from "zod"
import * as catSvc from "../services/category.service"
import { sendSuccess } from "../lib/response"
import { StatusCodes } from "http-status-codes"

//__________________________
// shared validation helpers
//__________________________

// Reusable numeric id paramvalidator
const idParam = (paramName = "id") =>
  (req: Request) => {
    const val = Number(req.params[paramName])
    if (!Number.isInteger(val) || val <= 0) {
      throw new z.ZodError([{
        code: "custom",
        path: [paramName],
        message: `${paramName} must be a positive integer}`
      }])
    }
    return val
  }

const CategoryBody = z.object({
  name: z.string().min(2).max(150).trim(),
  slug: z.string().min(2).max(150)
    .regex(/^[a-z0-9-]+$/, "slug must be lowercase letters, numbers, and hyphens only"),
  parentId: z.number().int().positive().optional().nullable(),
  description: z.string().max(1000).trim().optional(),
  imageUrl: z.string().url("Must be a valid URL").optional(),
  isActive: z.boolean().optional().default(true),
  sortOrder: z.number().int().min(0).optional().default(0),
})

// ─────────────────────────────────────────────
// GET /categories
// ?tree=true  → nested tree structure
// ?tree=false → flat list (default)
// ───────────────────────────────────────────── 
export async function listCategories(req: Request, res: Response, next: NextFunction) {
  try {
    const { limit, offset } = req.pagination!;
    const { column, order } = req.sorting!;
    const search = req.search;
    const data = req.query.tree === "true"
      ? await catSvc.getCategoryTree({ search })
      : await catSvc.getAllCategories({ column, order, limit, offset, search })

    sendSuccess(res, data)
  } catch (error) {
    next(error)
  }
}

// ─────────────────────────────────────────────
// GET /categories/:id
// ─────────────────────────────────────────────
export async function getCategory(req: Request, res: Response, next: NextFunction) {
  try {
    const id = Number(req.params.id)
    const data = await catSvc.getCategoryById(id)
    sendSuccess(res, data)

  } catch (error) {
    next(error)
  }
}

// ─────────────────────────────────────────────
// GET /categories/slug/:slug
// Useful for SEO-friendly frontend routing
// ─────────────────────────────────────────────
export async function getCategoryBySlug(req: Request, res: Response, next: NextFunction) {
  try {
    const slug = req.params.slug as string
    const data = await catSvc.getCategoryBySlug(slug)
    sendSuccess(res, data)
  } catch (error) {
    next(error)
  }
}

// ─────────────────────────────────────────────
// GET /categories/:id/children
// ─────────────────────────────────────────────
export async function getChildren(req: Request, res: Response, next: NextFunction) {
  try {
    const id = Number(req.params.id)
    const data = await catSvc.getChildCategories(id)
    sendSuccess(res, data)
  } catch (err) {
    next(err)
  }
}

// ─────────────────────────────────────────────
// GET /categories/:id/attributes
// Returns the attribute definitions for a category
// including inherited attributes from parent categories
// ─────────────────────────────────────────────
export async function getCategoryAttributes(req: Request, res: Response, next: NextFunction) {
  try {
    const id = idParam("id")(req);
    const data = await catSvc.getCategoryAttributes(id);
    sendSuccess(res, data);
  } catch (err) { next(err); }
}

// ─────────────────────────────────────────────
// GET /categories/:id/products
// Returns products belonging to a category
// ?includeSubcategories=true also fetches from child categories
// ─────────────────────────────────────────────
export async function getCategoryProducts(req: Request, res: Response, next: NextFunction) {
  try {
    const id = idParam("id")(req);

    const query = z.object({
      includeSubcategories: z.enum(["true", "false"]).optional().default("false"),
      isActive: z.enum(["true", "false"]).optional().default("true"),
    }).parse(req.query);

    const data = await catSvc.getProductsByCategory(id, {
      includeSubcategories: query.includeSubcategories === "true",
      isActive: query.isActive === "true",
    });

    sendSuccess(res, data);
  } catch (err) { next(err); }
}


// ─────────────────────────────────────────────
// POST /categories
// Admin only (enforced in router)
// ─────────────────────────────────────────────
export async function createCategory(req: Request, res: Response, next: NextFunction) {
  try {
    const body = CategoryBody.parse(req.body);
    const data = await catSvc.createCategory(body);
    sendSuccess(res, data, StatusCodes.CREATED);
  } catch (err) { next(err); }
}

// ─────────────────────────────────────────────
// PATCH /categories/:id
// Admin only — partial update, only provided fields change
// ─────────────────────────────────────────────
export async function updateCategory(req: Request, res: Response, next: NextFunction) {
  try {
    const id = idParam("id")(req);
    const body = CategoryBody.partial().parse(req.body);
    const data = await catSvc.updateCategory(id, body);
    sendSuccess(res, data);
  } catch (err) { next(err); }
}

// ─────────────────────────────────────────────
// DELETE /categories/:id
// Admin only — soft delete (sets isActive = false)
// ─────────────────────────────────────────────
export async function deleteCategory(req: Request, res: Response, next: NextFunction) {
  try {
    const id = idParam("id")(req);
    const data = await catSvc.deleteCategory(id);
    sendSuccess(res, data);
  } catch (err) { next(err); }
}