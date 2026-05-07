import { registry, successResponse } from "./openapi.registry";
import { z } from "zod"

// _____________
// SCHEMAS
// _____________

// image schema
const imageSchema = registry
  .register("Image", z.object({
    image: z.any()
      .refine((file) => {
        // In Node.js with Multer, file is an object, not a browser File instance
        if (!file) return false;
        return file.size > 0;
      }, "File is required")
  })
    .openapi("Image")
  )


// uploadResponseSchema 
const uploadResponseSchema = registry
  .register("upload-response",
    z.object({
      fileId: z.string(),
      name: z.string(),
      url: z.string(),
      thumbnailUrl: z.string(),
      height: z.number(),
      width: z.number(),
      size: z.number(),
      fileType: z.enum(["image", "all", "non-image"]),
      filePath: z.string(),
      tags: z.array(z.string()).optional(),
      isPrivateFile: z.boolean(),
      customCoordinates: z.string().optional(),
    }).openapi("upload-response"))


// _____________
// ROUTES
// _____________

// /utils/upload-image
registry.registerPath({
  method: "post",
  path: "/utils/upload-image",
  tags: ["Utils"],
  summary: "Upload an image",
  security: [{ bearerAuth: [] }],
  request: { body: { content: { "multipart/form-data": { schema: imageSchema } } } },
  responses: {
    200: {
      description: "Image uploaded", content: {
        "application/json": {
          schema: successResponse(uploadResponseSchema)
        }
      }

    },
    400: { description: "Bad request" },
    500: { description: "Server Error" },
  },
}
)

// /utils/delete-image/{fileId}
registry.registerPath({
  method: "delete",
  path: "/utils/delete-image/{fileId}",
  tags: ["Utils"],
  summary: "Delete an image",
  security: [{ bearerAuth: [] }],
  request: {
    params: z.object({ fileId: z.string() }),
  },
  responses: {
    200: { description: "Image deleted" },
    400: { description: "Invalid File ID" },
  },
});