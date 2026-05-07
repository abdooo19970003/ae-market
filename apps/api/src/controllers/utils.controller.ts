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

export const deleteImage = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { fileId } = req.params;
    if (!fileId) {
      return sendError(res, "File ID is required", StatusCodes.BAD_REQUEST);
    }
    await utlSvc.deleteFromImageKit(fileId as string);
    return sendSuccess(res, { message: "Image deleted successfully" }, StatusCodes.OK);
  } catch (err) {
    next(err);
  }
};
