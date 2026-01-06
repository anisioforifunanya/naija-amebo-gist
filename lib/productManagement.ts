/**
 * Marketplace Product Management
 * Handles product data, inventory, search, and catalog operations
 */

export interface ProductImage {
  url: string;
  alt: string;
  isPrimary: boolean;
}

export interface ProductReview {
  id: string;
  rating: number; // 1-5
  title: string;
  comment: string;
  images?: string[];
  authorName: string;
  authorImage?: string;
  verifiedPurchase: boolean;
  helpful: number;
  unhelpful: number;
  createdAt: Date;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  longDescription?: string;
  sku: string;
  price: number;
  originalPrice?: number;
  category: string;
  subcategory?: string;
  image: string;
  images?: ProductImage[];
  rating: number; // 1-5 average
  reviews: number; // count
  reviewData?: ProductReview[];
  seller: string;
  sellerId?: string;
  inStock: boolean;
  stockCount: number;
  deliveryTime: string;
  shippingCost: number;
  freeShippingThreshold?: number;
  badge?: string;
  tags?: string[];
  seo?: {
    title: string;
    description: string;
    keywords: string[];
  };
}

export interface ProductFilter {
  category?: string;
  priceMin?: number;
  priceMax?: number;
  rating?: number;
  inStock?: boolean;
  seller?: string;
  tags?: string[];
}

/**
 * Sample products database
 */
export const PRODUCTS_DATABASE: Product[] = [
  {
    id: '1',
    name: 'Samsung Galaxy S21 Ultra',
    description: 'Latest Samsung flagship phone with amazing camera',
    longDescription: 'Experience the power of innovation with the Samsung Galaxy S21 Ultra. Featuring a 6.2-inch dynamic AMOLED display, Snapdragon 888 processor, and a revolutionary triple camera system with 108MP main sensor. Perfect for photography and videography enthusiasts.',
    sku: 'SGM-S21U-001',
    price: 485000,
    originalPrice: 520000,
    category: 'phones',
    subcategory: 'smartphones',
    image: 'https://via.placeholder.com/300x300?text=Samsung+Galaxy+S21',
    images: [
      { url: 'https://via.placeholder.com/300x300?text=Samsung+Galaxy+S21+Front', alt: 'Front view', isPrimary: true },
      { url: 'https://via.placeholder.com/300x300?text=Samsung+Galaxy+S21+Back', alt: 'Back view', isPrimary: false },
      { url: 'https://via.placeholder.com/300x300?text=Samsung+Galaxy+S21+Side', alt: 'Side view', isPrimary: false },
    ],
    rating: 4.8,
    reviews: 234,
    seller: 'Tech Hub Nigeria',
    sellerId: 'seller-001',
    inStock: true,
    stockCount: 15,
    deliveryTime: '2-3 days',
    shippingCost: 2000,
    freeShippingThreshold: 500000,
    badge: 'SALE',
    tags: ['5G', 'Camera', 'Fast Processor', 'Premium'],
    seo: {
      title: 'Samsung Galaxy S21 Ultra - Buy Online Nigeria | Naija Marketplace',
      description: 'Get the latest Samsung Galaxy S21 Ultra smartphone in Nigeria. 6.2" AMOLED display, 108MP camera, 5G connectivity. Fast delivery, authentic warranty.',
      keywords: ['Samsung Galaxy S21 Ultra', 'smartphone Nigeria', 'Android phone', '5G phone Nigeria', 'camera phone']
    }
  },
  {
    id: '2',
    name: 'iPhone 15 Pro Max',
    description: 'Premium iPhone with titanium design and A17 Pro chip',
    longDescription: 'The iPhone 15 Pro Max represents the pinnacle of iPhone engineering. With a stunning 6.7-inch Super Retina display, titanium design for durability, and the powerful A17 Pro chip, it delivers unmatched performance and camera capabilities.',
    sku: 'APL-IP15PM-001',
    price: 750000,
    originalPrice: 850000,
    category: 'phones',
    subcategory: 'smartphones',
    image: 'https://via.placeholder.com/300x300?text=iPhone+15+Pro',
    rating: 4.9,
    reviews: 456,
    seller: 'Apple Store NG',
    sellerId: 'seller-002',
    inStock: true,
    stockCount: 8,
    deliveryTime: '1-2 days',
    shippingCost: 0,
    badge: 'HOT',
    tags: ['iOS', 'Premium', 'Camera', 'Fast Processor'],
    seo: {
      title: 'iPhone 15 Pro Max - Official Apple Store Nigeria | Naija Marketplace',
      description: 'Buy iPhone 15 Pro Max in Nigeria. 6.7" Super Retina display, titanium design, A17 Pro chip, advanced cameras. Official retailer with warranty.',
      keywords: ['iPhone 15 Pro Max', 'Apple iPhone Nigeria', 'iOS phone', 'premium smartphone']
    }
  },
  {
    id: '3',
    name: 'Sony WH-1000XM5 Headphones',
    description: 'Premium noise-cancelling wireless headphones',
    longDescription: 'Experience crystal-clear audio with the Sony WH-1000XM5, featuring industry-leading noise cancellation, 30-hour battery life, and premium sound quality. Perfect for music lovers and professionals.',
    sku: 'SNY-WH1KXM5-001',
    price: 145000,
    originalPrice: 180000,
    category: 'electronics',
    subcategory: 'audio',
    image: 'https://via.placeholder.com/300x300?text=Sony+Headphones',
    rating: 4.7,
    reviews: 178,
    seller: 'Audio World',
    sellerId: 'seller-003',
    inStock: true,
    stockCount: 22,
    deliveryTime: '3-4 days',
    shippingCost: 1500,
    badge: 'TRENDING',
    tags: ['Noise Cancelling', 'Wireless', 'Premium Audio', 'Long Battery'],
    seo: {
      title: 'Sony WH-1000XM5 Headphones - Best Price Nigeria | Naija Marketplace',
      description: 'Buy Sony WH-1000XM5 wireless headphones in Nigeria. Industry-leading noise cancellation, 30-hour battery, premium sound quality. Fast delivery.',
      keywords: ['Sony headphones', 'WH-1000XM5', 'noise cancelling headphones', 'wireless audio Nigeria']
    }
  },
];

/**
 * Get all products
 */
export function getAllProducts(): Product[] {
  return PRODUCTS_DATABASE;
}

/**
 * Get product by ID
 */
export function getProductById(id: string): Product | undefined {
  return PRODUCTS_DATABASE.find(p => p.id === id);
}

/**
 * Search products
 */
export function searchProducts(query: string): Product[] {
  const lowerQuery = query.toLowerCase();
  return PRODUCTS_DATABASE.filter(p =>
    p.name.toLowerCase().includes(lowerQuery) ||
    p.description.toLowerCase().includes(lowerQuery) ||
    p.tags?.some(tag => tag.toLowerCase().includes(lowerQuery))
  );
}

/**
 * Filter products
 */
export function filterProducts(filters: ProductFilter): Product[] {
  return PRODUCTS_DATABASE.filter(product => {
    if (filters.category && product.category !== filters.category) return false;
    if (filters.priceMin && product.price < filters.priceMin) return false;
    if (filters.priceMax && product.price > filters.priceMax) return false;
    if (filters.rating && product.rating < filters.rating) return false;
    if (filters.inStock !== undefined && product.inStock !== filters.inStock) return false;
    if (filters.seller && product.seller !== filters.seller) return false;
    if (filters.tags?.length && !filters.tags.some(tag => product.tags?.includes(tag))) return false;
    return true;
  });
}

/**
 * Get products by category
 */
export function getProductsByCategory(category: string): Product[] {
  return PRODUCTS_DATABASE.filter(p => p.category === category);
}

/**
 * Get trending products (by reviews/rating)
 */
export function getTrendingProducts(limit: number = 10): Product[] {
  return [...PRODUCTS_DATABASE]
    .sort((a, b) => (b.rating * b.reviews) - (a.rating * a.reviews))
    .slice(0, limit);
}

/**
 * Get products on sale
 */
export function getSaleProducts(): Product[] {
  return PRODUCTS_DATABASE.filter(p => p.originalPrice && p.price < p.originalPrice);
}

/**
 * Get discount percentage
 */
export function getDiscountPercentage(originalPrice: number | undefined, currentPrice: number): number {
  if (!originalPrice) return 0;
  return Math.round(((originalPrice - currentPrice) / originalPrice) * 100);
}

/**
 * Get related products
 */
export function getRelatedProducts(productId: string, limit: number = 5): Product[] {
  const product = getProductById(productId);
  if (!product) return [];

  return PRODUCTS_DATABASE
    .filter(p => p.id !== productId && p.category === product.category)
    .slice(0, limit);
}

/**
 * Calculate shipping cost
 */
export function calculateShippingCost(
  subtotal: number,
  product: Product,
  city: string = 'Lagos'
): number {
  // Free shipping for orders above threshold
  if (product.freeShippingThreshold && subtotal >= product.freeShippingThreshold) {
    return 0;
  }

  // City-based shipping cost
  const cityShippingRates: Record<string, number> = {
    'Lagos': 2000,
    'Abuja': 3000,
    'Portharcourt': 3500,
    'Kano': 4000,
    'Ibadan': 2500,
  };

  return cityShippingRates[city] || product.shippingCost;
}

/**
 * Get product by SKU
 */
export function getProductBySKU(sku: string): Product | undefined {
  return PRODUCTS_DATABASE.find(p => p.sku === sku);
}

/**
 * Get seller products
 */
export function getSellerProducts(sellerId: string): Product[] {
  return PRODUCTS_DATABASE.filter(p => p.sellerId === sellerId);
}

/**
 * Add product review
 */
export function addProductReview(
  productId: string,
  review: Omit<ProductReview, 'id' | 'createdAt'>
): void {
  const product = getProductById(productId);
  if (product) {
    const newReview: ProductReview = {
      ...review,
      id: Math.random().toString(36).substr(2, 9),
      createdAt: new Date(),
    };

    if (!product.reviewData) product.reviewData = [];
    product.reviewData.push(newReview);

    // Update average rating
    const allRatings = [product.rating * product.reviews, review.rating];
    product.rating = allRatings.reduce((a, b) => a + b) / (product.reviews + 1);
    product.reviews += 1;
  }
}

/**
 * Check inventory
 */
export function checkInventory(productId: string, quantity: number): boolean {
  const product = getProductById(productId);
  if (!product) return false;
  return product.inStock && product.stockCount >= quantity;
}

/**
 * Update inventory
 */
export function updateInventory(productId: string, quantitySold: number): void {
  const product = getProductById(productId);
  if (product) {
    product.stockCount -= quantitySold;
    if (product.stockCount <= 0) {
      product.inStock = false;
    }
  }
}
