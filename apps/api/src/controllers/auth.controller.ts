import { loginSchema, registerSchema } from "../db";
import { Request, Response, NextFunction } from "express";
import * as authSvc from "../services/auth.service"
import { sendSuccess } from "../lib/response";
import { StatusCodes } from "http-status-codes";
import { z } from "zod";


// __ POST : /auth/register _________________________
export async function register(req: Request, res: Response, next: NextFunction) {
  try {
    console.log(req.body);

    const body = registerSchema.parse(req.body)
    const result = await authSvc.register(body)
    sendSuccess(res, result, StatusCodes.CREATED)
  } catch (err) {
    next(err)
  }
}

// __ POST : /auth/login    _________________________
export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const body = loginSchema.parse(req.body)
    console.log(body);

    const result = await authSvc.login(body)
    sendSuccess(res, result, StatusCodes.OK)
  } catch (err) {
    next(err)
  }
}

// __ POST : /auth/refresh  _________________________
const refreshBody = z.object({ refreshToken: z.string().min(1) })

export async function refresh(req: Request, res: Response, next: NextFunction) {
  try {
    const body = refreshBody.parse(req.body)
    const result = await authSvc.refresh(body.refreshToken)
    sendSuccess(res, result, StatusCodes.OK)
  } catch (err) {
    next(err)
  }
}

// __ POST : /auth/logout   _________________________
export async function logout(req: Request, res: Response, next: NextFunction) {
  try {
    await authSvc.logout(req.user.sub)
    sendSuccess(res, { message: "Logged out successfully" }, StatusCodes.OK)
  } catch (err) {
    next(err)
  }
}

// __ GET  : /auth/me       _________________________
export async function meController(req: Request, res: Response, next: NextFunction) {
  try {
    sendSuccess(res, req.user, StatusCodes.OK)
  } catch (err) {
    next(err)
  }

}