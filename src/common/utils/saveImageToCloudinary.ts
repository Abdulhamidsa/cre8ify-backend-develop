import cloudinary from './cloudinary.config.js';

/**
 * Saves an image to Cloudinary with the given options.
 *
 * @param {string} imageUrl - The URL of the image to upload.
 * @param {string} folder - The Cloudinary folder to save the image in.
 * @param {Array<Record<string, any>>} transformation - Array of transformation options for Cloudinary.
 * @param {string} format - The desired format of the saved image (default: webp).
 * @returns {Promise<string>} - The secure URL of the uploaded image.
 */
export const saveImageToCloudinary = async (
  imageUrl: string,
  folder: string,
  transformation: Array<Record<string, unknown>> = [],
  format: string = 'webp',
): Promise<string> => {
  const uploadResult = await cloudinary.uploader.upload(imageUrl, {
    folder,
    format,
    transformation,
  });

  return uploadResult.secure_url;
};
