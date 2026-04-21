import { Request, Response, NextFunction } from "express";
import { sendError, sendSuccess } from "../lib/response";
import { StatusCodes } from "http-status-codes";
import * as utlSvc from "../services/utils.service";


export const uploadImage = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const file = req.file;
    if (!file) {
      return sendError(res, "No file uploaded", StatusCodes.BAD_REQUEST);
    }

    // upload Image 
    const uploadResponse = await utlSvc.uploadToImageKit(file.buffer, file.originalname, "images");
    return sendSuccess(res, uploadResponse, StatusCodes.OK);
  } catch (err) {
    next(err)
  }
}
