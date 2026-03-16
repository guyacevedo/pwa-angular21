/**
 * Utility functions for math operations to prevent floating point precision issues.
 */

/**
 * Rounds a number to a precise number of decimal places.
 * Resolves JavaScript's common floating point issues (e.g., 1.005 rounding incorrectly).
 * 
 * @param value The value to round
 * @param decimals The number of decimal places (default: 2)
 * @returns The rounded number
 */
export function roundNumber(value: number | string | null | undefined, decimals = 2): number {
  if (value === null || value === undefined || value === '') {
    return 0;
  }
  
  const num = typeof value === 'string' ? parseFloat(value.replace(/,/g, '')) : Number(value);
  
  if (isNaN(num)) {
    return 0;
  }
  
  // To avoid floating point rounding errors (e.g., Math.round(1.005 * 100) / 100 === 1)
  // We use the exponential notation trick:
  const multiplier = Math.pow(10, decimals);
  return Math.round((num + Number.EPSILON) * multiplier) / multiplier;
}

/**
 * Convenience function to always round to integers (0 decimals)
 */
export function roundToInteger(value: number | string | null | undefined): number {
  return roundNumber(value, 0);
}

/**
 * Convenience function to round to weight logic (1 decimal)
 */
export function roundToKilos(value: number | string | null | undefined): number {
  return roundNumber(value, 1);
}

/**
 * Convenience function to round to currency logic (2 decimals)
 */
export function roundToCurrency(value: number | string | null | undefined): number {
  return roundNumber(value, 2);
}
