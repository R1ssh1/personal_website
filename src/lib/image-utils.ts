/**
 * Utility functions for handling images with proxy support
 */

/**
 * Creates a proxy URL for external images that may have CORS or referrer policy restrictions
 */
export function getProxiedImageUrl(originalUrl: string): string {
  // Check if the URL is from a domain that needs proxying
  const needsProxy = [
    'images.credly.com',
    'cdn.credly.com'
  ].some(domain => originalUrl.includes(domain));

  if (!needsProxy) {
    return originalUrl;
  }

  // Return the proxied URL
  const encodedUrl = encodeURIComponent(originalUrl);
  return `/api/proxy-image?url=${encodedUrl}`;
}

/**
 * Checks if an image URL is from an external domain that may need proxying
 */
export function isExternalImageUrl(url: string): boolean {
  try {
    const parsedUrl = new URL(url);
    return !parsedUrl.hostname.includes('localhost') && !parsedUrl.hostname.includes('vercel');
  } catch {
    return false;
  }
}

/**
 * Gets the appropriate image URL based on environment and domain
 */
export function getImageUrl(originalUrl: string): string {
  if (!originalUrl) return '';

  // Use proxy for problematic domains in production
  if (process.env.NODE_ENV === 'production' || isExternalImageUrl(originalUrl)) {
    return getProxiedImageUrl(originalUrl);
  }

  return originalUrl;
}