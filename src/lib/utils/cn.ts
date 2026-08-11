import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merge Tailwind CSS classes safely, removing conflicts.
 * The canonical utility for all conditional className logic.
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
