import { Router } from "express";
import multer from "multer";
import { protect, requireRole } from "../middlewares/auth.middleware";
import { uploadImage } from "../controllers/utils.controller";

const utilsRouter = Router()

// Configure Multer to use memory storage
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });


utilsRouter.post("/upload-image", protect, requireRole("admin"), upload.single("image"), uploadImage)

export default utilsRouter