"use client";

import { useState, useEffect } from "react";
import Image, { ImageProps } from "next/image";
import { getOptimizedImageUrl } from "@/lib/cloudinary";
import { cn } from "@/lib/utils";

interface OptimizedImageProps extends Omit<ImageProps, "src"> {
  src: string;
  width?: number;
  height?: number;
  quality?: number;
  format?: "auto" | "webp" | "jpg" | "png";
  crop?: "fill" | "scale" | "fit" | "thumb";
  placeholderColor?: string;
  className?: string;
}

export function OptimizedImage({
  src,
  width,
  height,
  quality,
  format = "auto",
  crop = "fill",
  placeholderColor = "#f3f4f6",
  className,
  alt,
  ...props
}: OptimizedImageProps) {
  const [loaded, setLoaded] = useState(false);
  const [optimizedSrc, setOptimizedSrc] = useState<string | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (src) {
      try {
        const optimized = getOptimizedImageUrl(src, {
          width,
          height,
          quality,
          format,
          crop,
        });
        setOptimizedSrc(optimized);
      } catch (err) {
        console.error("Error optimizing image:", err);
        setOptimizedSrc(src);
        setError(true);
      }
    }
  }, [src, width, height, quality, format, crop]);

  // Handle image load
  const handleLoad = () => {
    setLoaded(true);
  };

  // Handle image error
  const handleError = () => {
    setError(true);
    setLoaded(true);
  };

  return (
    <div
      className={cn(
        "relative overflow-hidden",
        className
      )}
      style={{
        backgroundColor: placeholderColor,
        width: width ? `${width}px` : "100%",
        height: height ? `${height}px` : "auto",
      }}
    >
      {optimizedSrc && (
        <Image
          src={optimizedSrc}
          alt={alt || ""}
          width={width}
          height={height}
          onLoad={handleLoad}
          onError={handleError}
          className={cn(
            "transition-opacity duration-300",
            loaded ? "opacity-100" : "opacity-0"
          )}
          {...props}
        />
      )}

      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 text-gray-500 text-sm">
          {alt || "Image not available"}
        </div>
      )}
    </div>
  );
}