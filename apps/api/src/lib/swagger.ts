import path, { dirname } from "path"
import { Express, Request, Response } from "express"
import swaggerJsdoc from "swagger-jsdoc"
import swaggerUi from "swagger-ui-express"
import { version } from "../../package.json"
import { fileURLToPath } from "url"

const __filename = fileURLToPath(import.meta.url)  // المسار الكامل للملف الحالي
const __dirname = path.dirname(__filename)         // مجلد الملف الحالي
const options: swaggerJsdoc.Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "AE-Market/API",
      version,
      license: { name: "MIT" },
      contact: {
        name: "Abdullah Elkuse",
        email: "abdullah.elkuse@gmail.com",
        url: "https://aeinsight.site",
      },
    },
    components: {
      // ✅ Fix 1: "securitySchemas" → "securitySchemes" (OpenAPI 3.0 spec)
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
    // Global security — applies to all endpoints unless overridden
    security: [{ bearerAuth: [] }],
  },

  // ✅ Fix 2: Use path.join(__dirname, ...) so paths resolve correctly
  // regardless of where the process is started from.
  // Adjust the depth ("..", "..") to match your actual folder structure:
  //   src/lib/swagger.ts  →  ../../routes = src/routes  ✓
  // apis: ["../routes/*.ts", "../schema/index.ts"]

  apis: [
    path.join(__dirname, "../routes/*.ts"),
    path.join(__dirname, "../schema/*.ts"),
  ],
}

const swaggerSpecs = swaggerJsdoc(options)

// ✅ Fix 3: port as number (consistent with Express / process.env usage)
function swaggerDocs(app: Express, port: number | string): void {
  // Swagger UI
  app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpecs, {
    customSiteTitle: "AE-Market API Docs",
    // Persist auth token across page refreshes
    swaggerOptions: { persistAuthorization: true },
  }))

  // Raw OpenAPI JSON (useful for Postman import / codegen)
  app.get("/docs.json", (_req: Request, res: Response) => {
    res.setHeader("Content-Type", "application/json")
    res.send(swaggerSpecs)
  })

  // ✅ Fix 4: Removed the leftover /aaa test endpoint

  console.info(`📚  Docs available at http://localhost:${port}/docs`)
}

export default swaggerDocs