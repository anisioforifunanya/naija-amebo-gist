/**
 * Image Optimization for SEO
 * Ensures all images have proper alt text, lazy loading, and optimization
 */

interface OptimizedImageProps {
  src: string;
  alt: string;
  title?: string;
  width?: number;
  height?: number;
  priority?: boolean;
  className?: string;
}

/**
 * Generate SEO-optimized image alt text
 * Google uses alt text for image search ranking
 */
export function generateImageAlt(
  title: string,
  category: string,
  context?: string
): string {
  // Format: [Content] | [Category] | Naija Amebo Gist
  return `${title} - ${category} news on Naija Amebo Gist${context ? ` - ${context}` : ''}`.substring(0, 125);
}

/**
 * Optimized Next Image component for SEO
 */
export function SEOImage({
  src,
  alt,
  title,
  width = 1200,
  height = 630,
  priority = false,
  className = '',
}: OptimizedImageProps) {
  // Use picture element for modern image format support
  return (
    <picture>
      {/* WebP format for modern browsers */}
      <source srcSet={convertToWebP(src)} type="image/webp" />
      {/* AVIF format for latest browsers (better compression) */}
      <source srcSet={convertToAVIF(src)} type="image/avif" />
      {/* Fallback to original */}
      <img
        src={src}
        alt={alt}
        title={title || alt}
        width={width}
        height={height}
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
        className={className}
        // For SEO: important for Core Web Vitals
        style={{
          aspectRatio: `${width}/${height}`,
          objectFit: 'cover',
        }}
      />
    </picture>
  );
}

/**
 * Convert image URL to WebP format
 */
function convertToWebP(src: string): string {
  if (!src) return '';
  // If using Cloudinary or similar CDN
  if (src.includes('cloudinary')) {
    return src.replace(/\.jpg|\.png/g, '.webp');
  }
  return src; // Fallback to original
}

/**
 * Convert image URL to AVIF format (best compression)
 */
function convertToAVIF(src: string): string {
  if (!src) return '';
  if (src.includes('cloudinary')) {
    return src.replace(/\.jpg|\.png/g, '.avif');
  }
  return src;
}

/**
 * Image metadata for Open Graph & Twitter Cards
 * Used for social sharing optimization
 */
export interface ImageMetadata {
  url: string;
  width: number;
  height: number;
  alt: string;
  type: string;
}

/**
 * Generate image metadata for OG tags
 */
export function generateImageMetadata(
  imageUrl: string,
  title: string,
  category: string
): ImageMetadata {
  return {
    url: imageUrl,
    width: 1200,
    height: 630,
    alt: generateImageAlt(title, category),
    type: 'image/jpeg',
  };
}

/**
 * SEO checklist for images
 * ✅ File size < 200KB
 * ✅ Dimensions 1200x630 (OG standard)
 * ✅ Descriptive filename (e.g., davido-new-music-video.jpg)
 * ✅ Alt text (include keywords naturally)
 * ✅ Lazy loading for below-the-fold images
 * ✅ Responsive srcset for different devices
 * ✅ WebP/AVIF versions for performance
 */
