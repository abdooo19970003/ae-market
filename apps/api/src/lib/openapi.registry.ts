import { extendZodWithOpenApi, OpenApiGeneratorV3, OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import { z } from "zod";
import { V1 } from "../server";
import { version } from "../../package.json"
import { be } from "zod/v4/locales";

extendZodWithOpenApi(z);

export const registry = new OpenAPIRegistry()

// __________________________
// Re-usable response schema
// __________________________
export const errorSchema = registry.register("Error",
  z.object({
    success: z.literal(false),
    error: z.object({
      message: z.string(),
      details: z.unknown().optional(),
    }),

  }).openapi("Error")
)

export const successResponse = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.object({
    success: z.literal(true),
    data: z.unknown(),
  })


// __________________________
// Re-usable parameter schema
// __________________________
export const IdParam = z.object({
  id: z.string().regex(/^\d+$/).openapi({ example: "1" }),
})

export const VariantParams = z.object({
  productId: z.string().regex(/^\d+$/).openapi({ example: "1" }),
  variantId: z.string().regex(/^\d+$/).openapi({ example: "1" }),
})


//__________________________________________
// Generator - call this to produce the spec
//__________________________________________
export function generatOpenApiDocumention() {
  const generator = new OpenApiGeneratorV3(registry.definitions)
  return generator.generateDocument({
    openapi: "3.0.0",
    info: {
      title: "AE-Market API",
      version,
      license: { name: "MIT" },
      contact: {
        name: "Abdullah Elkuse",
        email: "abdullah.elkuse@gmail.com",
        url: "https://aeinsight.site",
      },
    },
    servers: [{
      url: V1,
      description: "Current enviroment",
    }],


  })
}

