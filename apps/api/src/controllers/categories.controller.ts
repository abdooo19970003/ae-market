import { Request, Response } from "express"

export const getAllCategories = async (req: Request, res: Response

) => {

  // if (!categories) return res.status(404).json({ message: "No categories found" })
  // return res.json(categories)
  return res.json({ message: "Hello from categories" })
}