import { StatusCodes } from "http-status-codes";
import { Response } from "express";

// ___________________________________
// Standart API Responseshape
// {success, data?, error?, meta?}
// ___________________________________



export function sendSuccess<T>(
  res: Response,
  data: T,
  statusCode = StatusCodes.OK,
  meta?: Record<string, unknown>
) {
  return res.status(statusCode).json({
    success: true,
    data,
    ...(meta && { meta })
  })
}

export function sendError(
  res: Response,
  message: string,
  statusCode = StatusCodes.INTERNAL_SERVER_ERROR,
  details?: Record<string, unknown>) {
  return res.status(statusCode).json({
    success: false,
    error: {
      message,
      ...(details && { details })
    }
  })
}

// _____________________________
// Custom Error Classes
// _____________________________
export class AppError extends Error {
  /**
   *
   */
  constructor(
    public message: string,
    public statusCode: number = StatusCodes.INTERNAL_SERVER_ERROR
  ) {
    super(message);
    this.name = "AppError";
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string) {
    super(`${resource} not found`, StatusCodes.NOT_FOUND);
    this.name = "NotFoundError";
  }
}

export class ValidationError extends AppError {
  /**
   *
   */
  constructor(message: string) {
    super(message, StatusCodes.UNPROCESSABLE_ENTITY);
    this.name = "ValidationError";
  }
}

