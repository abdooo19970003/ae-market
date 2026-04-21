import { StatusCodes } from "http-status-codes";
import imagekit from "../lib/imagekit";
import { AppError } from "../lib/response";

/**
 * Uploads a file to ImageKit
 * @param {Buffer} fileBuffer - The file data buffer
 * @param {string} fileName - The desired name for the file
 * @param {string} folder - Optional folder path in ImageKit
 */
export const uploadToImageKit = async (fileBuffer: Buffer, fileName: string, folder: string = `uploads`) => {
  const base_folder = process.env.IMAGEKIT_FOLDER || "default";

  try {
    const uploadResponse = await imagekit.upload({
      file: fileBuffer,
      fileName,
      folder: `/${base_folder}/${folder}`,
    });

    return uploadResponse;
  }
  catch (error) {
    console.error("Error uploading to ImageKit:", error);
    throw new AppError("Error uploading to ImageKit", StatusCodes.INTERNAL_SERVER_ERROR);
  }
};
