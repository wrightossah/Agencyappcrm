import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Extracts and formats a first name from available user data
 * @param fullName The user's full name
 * @param firstName Optional first name if already separated
 * @param email Optional email to extract name from if no other name is available
 * @returns Formatted first name for display
 */
export function FName(fullName?: string, firstName?: string, email?: string): string {
  // If we have a first name directly, use it
  if (firstName) {
    return capitalizeFirstLetter(firstName)
  }

  // If we have a full name, extract the first part
  if (fullName) {
    const nameParts = fullName.trim().split(/\s+/)
    if (nameParts.length > 0) {
      return capitalizeFirstLetter(nameParts[0])
    }
  }

  // If we have an email, try to extract a name from it
  if (email) {
    const emailName = email.split("@")[0]
    // Try to extract a name from the email (before any dots or numbers)
    const possibleName = emailName.split(/[.\d]/)[0]
    return capitalizeFirstLetter(possibleName)
  }

  // If all else fails, return empty string
  return ""
}

/**
 * Capitalizes the first letter of a string
 * @param str String to capitalize
 * @returns Capitalized string
 */
export function capitalizeFirstLetter(str: string): string {
  if (!str) return ""
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
}

/**
 * Formats a full name with proper capitalization
 * @param firstName First name
 * @param lastName Last name
 * @returns Properly formatted full name
 */
export function formatName(firstName?: string, lastName?: string): string {
  if (!firstName && !lastName) return ""

  const formattedFirst = firstName ? capitalizeFirstLetter(firstName) : ""
  const formattedLast = lastName ? capitalizeFirstLetter(lastName) : ""

  return [formattedFirst, formattedLast].filter(Boolean).join(" ")
}
