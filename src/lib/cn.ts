import clsx, { type ClassValue } from 'clsx'

/** Tiny helper for conditionally composing Tailwind class strings. */
export function cn(...inputs: ClassValue[]): string {
  return clsx(inputs)
}
