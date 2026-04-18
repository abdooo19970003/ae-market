import { Router } from "express"
import { getAllCategories } from "../controllers/categories.controller.js"

const router = Router()

router.get("/", getAllCategories)


export default router