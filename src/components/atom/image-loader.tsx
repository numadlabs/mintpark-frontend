import React, { useState } from "react";
import Image from "next/image";

interface ImageLoaderProps {
  src: string;
  alt: string;
  width: number;
  height: number;
  className?: string;
}

const ImageLoader: React.FC<ImageLoaderProps> = ({
  src,
  alt,
  width,
  height,
  className,
}) => {
  const [isLoading, setIsLoading] = useState<boolean>(true);

  return (
    <div className="relative w-full h-full">
      {isLoading && (
        <div className="absolute inset-0 bg-neutral800/20 animate-pulse rounded-2xl">
          <div className="flex items-center justify-center w-full h-full">
            <svg
              className="animate-spin h-8 w-8 text-brand"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
          </div>
        </div>
      )}
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        className={`${className} ${
          isLoading ? "opacity-0" : "opacity-100"
        } transition-opacity duration-300`}
        onLoadingComplete={() => setIsLoading(false)}
        quality={100}
      />
    </div>
  );
};

export default ImageLoader;
