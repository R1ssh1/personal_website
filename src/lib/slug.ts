/**
 * Convert a string to a URL-friendly slug
 */
export function createSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')        // Replace spaces with hyphens
    .replace(/[^\w\-]+/g, '')    // Remove all non-word chars except hyphens
    .replace(/\-\-+/g, '-')      // Replace multiple hyphens with single hyphen
    .replace(/^-+/, '')          // Trim hyphens from start
    .replace(/-+$/, '')          // Trim hyphens from end
}

/**
 * Generate a unique slug by checking against existing slugs
 */
export function createUniqueSlug(title: string, existingSlugs: string[]): string {
  let baseSlug = createSlug(title)
  let slug = baseSlug
  let counter = 1

  while (existingSlugs.includes(slug)) {
    slug = `${baseSlug}-${counter}`
    counter++
  }

  return slug
}

/**
 * Get slug from blog post title for URL routing
 */
export function getBlogSlugFromTitle(title: string): string {
  return createSlug(title)
}

/**
 * Get slug from project title for URL routing
 */
export function getProjectSlugFromTitle(title: string): string {
  return createSlug(title)
}