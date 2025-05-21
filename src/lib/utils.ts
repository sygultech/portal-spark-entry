
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Helper function to safely access nested object properties
 * @param obj The object to access properties from
 * @param path The path to access (e.g., "user.profile.name")
 * @param defaultValue Default value if path doesn't exist
 * @returns The value at the path or defaultValue if not found
 */
export function getNestedValue(obj: any, path: string, defaultValue: any = undefined) {
  const keys = path.split(".");
  let result = obj;
  
  for (const key of keys) {
    if (result === null || result === undefined || typeof result !== "object") {
      return defaultValue;
    }
    result = result[key];
  }
  
  return result !== undefined ? result : defaultValue;
}


// force update

// force update
