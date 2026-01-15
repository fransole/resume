/**
 * Get normalized base URL with trailing slash
 *
 * This utility ensures consistent base URL handling across the application.
 * The base URL is normalized to always end with a trailing slash.
 *
 * @returns Base URL string with trailing slash (e.g., '/' or '/resume/')
 */
export function getBaseUrl(): string {
  const rawBase = import.meta.env.BASE_URL;
  return rawBase.endsWith('/') ? rawBase : rawBase + '/';
}
