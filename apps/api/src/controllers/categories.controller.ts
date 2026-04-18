import { Request, Response } from "express"
import { db } from "@repo/db"

export const getAllCategories = async (req: Request, res: Response

) => {

  const categories = await db.query.categories.findMany()
  // if (!categories) return res.status(404).json({ message: "No categories found" })
  // return res.json(categories)
  return res.json({ message: "Hello from categories" })
}