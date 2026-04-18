import express, { type Express } from "express"
import cors from "cors"


export const createServer = (): Express => {
  const app = express()
    .use(cors())
    .use(express.json())
    .use(express.urlencoded({ extended: true }))
    .get("/message/:name", (req, res) =>
      res.json({ message: `Hello ${req.params.name}` })
        .status(200))
    .get("/health", (req, res) =>
      res.status(200)
        .json({
          status: "ok",
          time: new Date().toISOString(),
        }))

  return app

}