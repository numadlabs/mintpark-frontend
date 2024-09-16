import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const stringtoHex = (value: any) => {
  const buffer = Buffer.from(value, "utf8");
  const hexString = buffer.toString("hex");
  return hexString;
};

export function s3ImageUrlBuilder(fileKey: string) {
  return `https://numadlabs-coordinals-test.s3.eu-central-1.amazonaws.com/${fileKey}`;
}
