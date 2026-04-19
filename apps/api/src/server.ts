import express, { type Express } from "express"
import cors from "cors"
import helmet from "helmet"
import morgan from "morgan"
import categoriesRouter from "./routes/categories.routes"
import productRouter from "./routes/product.routes"
import authRouter from "./routes/auth.routes"
import swaggerDocs from "./lib/swagger"

export const V1 = "/api/v1"

export const createServer = (): Express => {
  const app = express();
  // ─── Global middleware ───────────────────────────────────────────
  app.use(helmet())
    .use(cors())
    .use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"))
    .use(express.json())
    .use(express.urlencoded({ extended: true }));

  // ─── Routes ───────────────────────────────────────────────────────

  app.use(`${V1}/categories`, categoriesRouter)
  app.use(`${V1}/products`, productRouter)
  app.use(`${V1}/auth`, authRouter)

  // ___ Test Route __________________________________________________
  app.get("/message/:name", (req, res) =>
    res.json({ message: `Hello ${req.params.name}` })
      .status(200));

  // __ Health Check _________________________________________________
  app.get(`${V1}/health`, (req, res) =>
    res.status(200)
      .json({
        status: "ok",
        time: new Date().toISOString(),
      }))

  return app

}