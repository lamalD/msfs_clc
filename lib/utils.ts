/* eslint-disable prefer-const */
/* eslint-disable no-prototype-builtins*/

import { type ClassValue, clsx } from "clsx"
/*import qs from "qs"*/
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// ERROR HANDLER
export const handleError = (error: unknown) => {
  if (error instanceof Error) {
    console.error(error.message)
    throw new Error(`Error: ${error.message}`)
  } else if (typeof error === "string") {
    console.error(error)
    throw new Error(`Error: ${error}`)
  } else {
    console.error(error)
    throw new Error(`Unknown error: ${JSON.stringify(error)}`)
  }
}
