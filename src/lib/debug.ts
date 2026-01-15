/**
 * Development-only console warning
 * Automatically guards with import.meta.env.DEV check
 *
 * @param message - Warning message to log
 * @param args - Additional arguments to log
 */
export function debugWarn(message: string, ...args: unknown[]): void {
  if (import.meta.env.DEV) {
    console.warn(message, ...args);
  }
}

/**
 * Development-only console error
 * Automatically guards with import.meta.env.DEV check
 *
 * @param message - Error message to log
 * @param args - Additional arguments to log
 */
export function debugError(message: string, ...args: unknown[]): void {
  if (import.meta.env.DEV) {
    console.error(message, ...args);
  }
}
