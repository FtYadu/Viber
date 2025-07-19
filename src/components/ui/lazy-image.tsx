"use client";

import { useState, useRef, useEffect } from "react";
import Image, { ImageProps } from "next/image";
import { createImageObserver } from "@/lib/performance";
import { cn } from "@/lib/utils";

interface LazyImageProps extends Omit<ImageProps, "src" | "loading"> {
  src: string;
  fallbackSrc?: string;
  placeholderClassName?: string;
  containerClassName?: string;
  enableBlur?: boolean;
  priority?: boolean;
}

export function LazyImage({
  src,
  fallbackSrc,
  alt,
  className,
  placeholderClassName,
  containerClassName,
  enableBlur = true,
  priority = false,
  ...props
}: LazyImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(priority);
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef<HTMLDivElement>(null);

  // Set up intersection observer for lazy loading
  useEffect(() => {
    if (priority || isInView) return;

    const observer = createImageObserver((entry) => {
      if (entry.isIntersecting) {
        setIsInView(true);
        observer?.unobserve(entry.target);
      }
    });

    if (observer && imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => {
      if (observer && imgRef.current) {
        observer.unobserve(imgRef.current);
      }
    };
  }, [priority, isInView]);

  const handleLoad = () => {
    setIsLoaded(true);
  };

  const handleError = () => {
    setHasError(true);
    setIsLoaded(true);
  };

  // Generate a low-quality placeholder
  const generatePlaceholder = (width: number, height: number) => {
    return `data:image/svg+xml;base64,${btoa(
      `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="#f3f4f6"/>
        <text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="#9ca3af" font-family="Arial, sans-serif" font-size="14">
          ${alt || 'Loading...'}
        </text>
      </svg>`
    )}`;
  };

  return (
    <div
      ref={imgRef}
      className={cn("relative overflow-hidden", containerClassName)}
    >
      {isInView && (
        <>
          {/* Main image */}
          <Image
            src={hasError && fallbackSrc ? fallbackSrc : src}
            alt={alt}
            onLoad={handleLoad}
            onError={handleError}
            className={cn(
              "transition-opacity duration-300",
              isLoaded ? "opacity-100" : "opacity-0",
              className
            )}
            placeholder={enableBlur ? "blur" : "empty"}
            blurDataURL={
              enableBlur && props.width && props.height
                ? generatePlaceholder(
                    typeof props.width === "number" ? props.width : 400,
                    typeof props.height === "number" ? props.height : 300
                  )
                : undefined
            }
            priority={priority}
            loading={priority ? "eager" : "lazy"}
            {...props}
          />

          {/* Loading placeholder */}
          {!isLoaded && (
            <div
              className={cn(
                "absolute inset-0 bg-gray-100 animate-pulse flex items-center justify-center",
                placeholderClassName
              )}
            >
              <div className="text-gray-400 text-sm">
                {hasError ? "Failed to load" : "Loading..."}
              </div>
            </div>
          )}
        </>
      )}

      {/* Placeholder when not in view */}
      {!isInView && (
        <div
          className={cn(
            "bg-gray-100 flex items-center justify-center",
            placeholderClassName
          )}
          style={{
            width: props.width,
            height: props.height,
          }}
        >
          <div className="text-gray-400 text-sm">Loading...</div>
        </div>
      )}
    </div>
  );
}