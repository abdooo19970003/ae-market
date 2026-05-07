import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { AppError, sendError } from '../lib/response.js';
import { StatusCodes } from 'http-status-codes';


//_______________________________________
// Central Error Handler Middleware
//_______________________________________
export function errorHandler(err: unknown, req: Request, res: Response, next: NextFunction) {

  // Zod Validation Errors
  if (err instanceof ZodError)
    return sendError(res, "Validation Error", StatusCodes.UNPROCESSABLE_ENTITY, err.flatten().fieldErrors)

  // Custom App Errors
  if (err instanceof AppError)
    return sendError(res, err.message, err.statusCode)

  // Unlknown Errors
  console.error(err)
  return sendError(res, "Internal Server Error", StatusCodes.INTERNAL_SERVER_ERROR)

}