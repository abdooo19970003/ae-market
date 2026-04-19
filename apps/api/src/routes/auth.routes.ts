import { Router } from "express";
import * as ctrl from "../controllers/auth.controller";
import { protect } from "../middlewares/auth.middleware";

const authRouter = Router()

authRouter.post("/register", ctrl.register);
authRouter.post("/login", ctrl.login);
authRouter.post("/refresh", ctrl.refresh);
authRouter.post("/logout", protect, ctrl.logout);  // must be logged in
authRouter.get("/me", protect, ctrl.meController);
export default authRouter