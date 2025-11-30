import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Combina classes CSS usando clsx e tailwind-merge
 * Útil para combinar classes condicionalmente e resolver conflitos do Tailwind
 */
export const cn = (...inputs: ClassValue[]): string => {
  return twMerge(clsx(inputs));
};

