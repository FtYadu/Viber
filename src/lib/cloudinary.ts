import { v2 as cloudinary } from "cloudinary";

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export interface UploadResult {
  url: string;
  publicId: string;
  width: number;
  height: number;
  format: string;
  resourceType: string;
}

/**
 * Upload an image to Cloudinary
 */
export async function uploadImage(
  file: Buffer,
  options: {
    folder?: string;
    transformation?: string[];
    tags?: string[];
  } = {}
): Promise<UploadResult> {
  return new Promise((resolve, reject) => {
    const uploadOptions: any = {
      folder: options.folder || "portfolio",
      resource_type: "image",
    };

    if (options.transformation) {
      uploadOptions.transformation = options.transformation;
    }

    if (options.tags) {
      uploadOptions.tags = options.tags;
    }

    cloudinary.uploader
      .upload_stream(uploadOptions, (error, result) => {
        if (error) {
          return reject(error);
        }

        if (!result) {
          return reject(new Error("Upload failed"));
        }

        resolve({
          url: result.secure_url,
          publicId: result.public_id,
          width: result.width,
          height: result.height,
          format: result.format,
          resourceType: result.resource_type,
        });
      })
      .end(file);
  });
}

/**
 * Delete an image from Cloudinary
 */
export async function deleteImage(publicId: string): Promise<boolean> {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result.result === "ok";
  } catch (error) {
    console.error("Error deleting image from Cloudinary:", error);
    return false;
  }
}

/**
 * Generate a Cloudinary URL with optimizations
 */
export function getOptimizedImageUrl(
  url: string,
  options: {
    width?: number;
    height?: number;
    quality?: number;
    format?: "auto" | "webp" | "jpg" | "png";
    crop?: "fill" | "scale" | "fit" | "thumb";
  } = {}
): string {
  // If not a Cloudinary URL, return as is
  if (!url.includes("cloudinary.com")) {
    return url;
  }

  // Extract the base URL and transformation part
  const [baseUrl, transformationPart] = url.split("/image/upload/");
  
  if (!baseUrl || !transformationPart) {
    return url;
  }

  // Build the transformation string
  const transformations = [];

  if (options.crop) {
    transformations.push(`c_${options.crop}`);
  }

  if (options.width) {
    transformations.push(`w_${options.width}`);
  }

  if (options.height) {
    transformations.push(`h_${options.height}`);
  }

  if (options.quality) {
    transformations.push(`q_${options.quality}`);
  }

  if (options.format) {
    transformations.push(`f_${options.format}`);
  } else {
    // Default to auto format for best optimization
    transformations.push("f_auto");
  }

  // Add a quality auto transformation for best quality/size ratio
  if (!options.quality) {
    transformations.push("q_auto");
  }

  // Build the new URL
  const transformationString = transformations.join(",");
  return `${baseUrl}/image/upload/${transformationString}/${transformationPart}`;
}

export default cloudinary;