import { Router } from "express"
import { getAllCategories } from "../controllers/categories.controller.js"

const categoriesRouter = Router()

categoriesRouter.get("/", getAllCategories)

export default categoriesRouter
