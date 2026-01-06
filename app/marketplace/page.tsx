'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  category: string;
  image: string;
  rating: number;
  reviews: number;
  seller: string;
  inStock: boolean;
  description: string;
  deliveryTime: string;
  badge?: string;
}

interface CartItem extends Product {
  quantity: number;
}

// Sample products - In production, fetch from database
const SAMPLE_PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'Samsung Galaxy S21 Ultra',
    price: 485000,
    originalPrice: 520000,
    category: 'phones',
    image: 'https://via.placeholder.com/300x300?text=Samsung+Galaxy+S21',
    rating: 4.8,
    reviews: 234,
    seller: 'Tech Hub Nigeria',
    inStock: true,
    description: 'Latest Samsung flagship phone with amazing camera',
    deliveryTime: '2-3 days',
    badge: 'SALE'
  },
  {
    id: '2',
    name: 'iPhone 15 Pro Max',
    price: 750000,
    originalPrice: 850000,
    category: 'phones',
    image: 'https://via.placeholder.com/300x300?text=iPhone+15+Pro',
    rating: 4.9,
    reviews: 456,
    seller: 'Apple Store NG',
    inStock: true,
    description: 'Premium iPhone with titanium design and A17 Pro chip',
    deliveryTime: '1-2 days',
    badge: 'HOT'
  },
  {
    id: '3',
    name: 'Sony WH-1000XM5 Headphones',
    price: 145000,
    originalPrice: 180000,
    category: 'electronics',
    image: 'https://via.placeholder.com/300x300?text=Sony+Headphones',
    rating: 4.7,
    reviews: 178,
    seller: 'Audio World',
    inStock: true,
    description: 'Premium noise-cancelling wireless headphones',
    deliveryTime: '3-4 days',
    badge: 'TRENDING'
  },
  {
    id: '4',
    name: 'MacBook Pro 16 inch',
    price: 2500000,
    originalPrice: 2800000,
    category: 'computers',
    image: 'https://via.placeholder.com/300x300?text=MacBook+Pro',
    rating: 4.9,
    reviews: 89,
    seller: 'Tech Store Lagos',
    inStock: false,
    description: 'Powerful laptop for professionals and creators',
    deliveryTime: '5-7 days'
  },
  {
    id: '5',
    name: 'Nike Air Max 90',
    price: 45000,
    originalPrice: 55000,
    category: 'fashion',
    image: 'https://via.placeholder.com/300x300?text=Nike+Shoes',
    rating: 4.6,
    reviews: 312,
    seller: 'Sports Central',
    inStock: true,
    description: 'Classic comfortable athletic sneakers',
    deliveryTime: '2-3 days',
    badge: 'SALE'
  },
  {
    id: '6',
    name: 'Smart TV 55 inch 4K',
    price: 185000,
    originalPrice: 220000,
    category: 'electronics',
    image: 'https://via.placeholder.com/300x300?text=Smart+TV+55',
    rating: 4.5,
    reviews: 145,
    seller: 'Electronics Hub',
    inStock: true,
    description: 'Ultra HD 4K smart television with HDR',
    deliveryTime: '3-4 days'
  },
];

const CATEGORIES = [
  { id: 'all', name: '🏪 All Products', count: 12450 },
  { id: 'phones', name: '📱 Phones', count: 3421 },
  { id: 'electronics', name: '⚡ Electronics', count: 5234 },
  { id: 'computers', name: '💻 Computers', count: 1856 },
  { id: 'fashion', name: '👔 Fashion', count: 4890 },
  { id: 'home', name: '🏠 Home & Garden', count: 2145 },
];

export default function MarketplaceePage() {
  const [products, setProducts] = useState<Product[]>(SAMPLE_PRODUCTS);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>(SAMPLE_PRODUCTS);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [priceRange, setPriceRange] = useState([0, 3000000]);
  const [showCart, setShowCart] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  // Filter and sort products
  useEffect(() => {
    let filtered = products;

    // Category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(p => p.category === selectedCategory);
    }

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Price filter
    filtered = filtered.filter(p => p.price >= priceRange[0] && p.price <= priceRange[1]);

    // Sort
    if (sortBy === 'price-low') {
      filtered.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-high') {
      filtered.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'rating') {
      filtered.sort((a, b) => b.rating - a.rating);
    } else if (sortBy === 'newest') {
      // Keep original order for newest
    }

    setFilteredProducts(filtered);
  }, [selectedCategory, searchQuery, priceRange, sortBy, products]);

  const handleAddToCart = (product: Product) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.id === product.id);
      if (existingItem) {
        return prevCart.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prevCart, { ...product, quantity: 1 }];
    });
  };

  const handleRemoveFromCart = (productId: string) => {
    setCart(prevCart => prevCart.filter(item => item.id !== productId));
  };

  const handleQuantityChange = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      handleRemoveFromCart(productId);
    } else {
      setCart(prevCart =>
        prevCart.map(item =>
          item.id === productId ? { ...item, quantity } : item
        )
      );
    }
  };

  const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const formatPrice = (price: number) => {
    return '₦' + price.toLocaleString('en-NG');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            {/* Logo */}
            <div className="flex items-center space-x-2">
              <span className="text-3xl">🛍️</span>
              <h1 className="text-2xl font-bold text-white">Naija Marketplace</h1>
            </div>

            {/* Search Bar */}
            <div className="flex-1 min-w-[250px] max-w-[500px]">
              <input
                type="text"
                placeholder="🔍 Search products... (e.g., phones, laptops)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border-none focus:ring-2 focus:ring-yellow-400"
              />
            </div>

            {/* Cart Button */}
            <button
              onClick={() => setShowCart(!showCart)}
              className="relative bg-yellow-400 text-gray-900 px-6 py-2 rounded-lg font-bold hover:bg-yellow-500 transition flex items-center space-x-2"
            >
              <span>🛒</span>
              <span>Cart</span>
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar - Categories & Filters */}
          <div className="lg:col-span-1">
            {/* Categories */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">📂 Categories</h2>
              <div className="space-y-2">
                {CATEGORIES.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`w-full text-left px-4 py-2 rounded-lg transition ${
                      selectedCategory === cat.id
                        ? 'bg-purple-600 text-white font-bold'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <span>{cat.name}</span>
                      <span className="text-sm opacity-70">({cat.count.toLocaleString()})</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Price Filter */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">💰 Price Range</h2>
              <div className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Min: {formatPrice(priceRange[0])}</span>
                  <span className="text-gray-600 dark:text-gray-400">Max: {formatPrice(priceRange[1])}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="3000000"
                  step="50000"
                  value={priceRange[1]}
                  onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                  className="w-full"
                />
              </div>
            </div>
          </div>

          {/* Main Content - Products */}
          <div className="lg:col-span-3">
            {/* Sort & View Options */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 mb-6 flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center space-x-2">
                <span className="text-gray-600 dark:text-gray-400">📊 Showing:</span>
                <span className="font-bold text-gray-900 dark:text-white">{filteredProducts.length}</span>
                <span className="text-gray-600 dark:text-gray-400">products</span>
              </div>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="newest">Newest First</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="rating">Top Rated</option>
              </select>
            </div>

            {/* Products Grid */}
            {filteredProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProducts.map(product => (
                  <div
                    key={product.id}
                    className="bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-xl transition overflow-hidden"
                  >
                    {/* Product Image */}
                    <div className="relative bg-gray-200 dark:bg-gray-700 h-48 flex items-center justify-center overflow-hidden">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover hover:scale-110 transition"
                      />
                      {product.badge && (
                        <div className="absolute top-2 right-2 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                          {product.badge}
                        </div>
                      )}
                      {!product.inStock && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                          <span className="text-white font-bold text-lg">OUT OF STOCK</span>
                        </div>
                      )}
                    </div>

                    {/* Product Info */}
                    <div className="p-4">
                      <h3 className="font-bold text-gray-900 dark:text-white line-clamp-2 mb-2">
                        {product.name}
                      </h3>

                      {/* Rating */}
                      <div className="flex items-center space-x-2 mb-3">
                        <div className="flex items-center">
                          <span className="text-yellow-400">⭐</span>
                          <span className="ml-1 text-sm font-bold text-gray-800 dark:text-gray-200">
                            {product.rating}
                          </span>
                        </div>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          ({product.reviews.toLocaleString()} reviews)
                        </span>
                      </div>

                      {/* Price */}
                      <div className="mb-3">
                        <div className="text-2xl font-bold text-purple-600">
                          {formatPrice(product.price)}
                        </div>
                        {product.originalPrice && (
                          <div className="text-sm text-gray-500 line-through">
                            {formatPrice(product.originalPrice)}
                          </div>
                        )}
                      </div>

                      {/* Seller & Delivery */}
                      <div className="text-xs text-gray-600 dark:text-gray-400 mb-3 space-y-1">
                        <div>👤 {product.seller}</div>
                        <div>🚚 Delivery: {product.deliveryTime}</div>
                      </div>

                      {/* Add to Cart Button */}
                      <button
                        onClick={() => handleAddToCart(product)}
                        disabled={!product.inStock}
                        className={`w-full py-2 rounded-lg font-bold transition ${
                          product.inStock
                            ? 'bg-purple-600 text-white hover:bg-purple-700'
                            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        }`}
                      >
                        {product.inStock ? '🛒 Add to Cart' : 'Unavailable'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg">
                <span className="text-4xl mb-4 block">🔍</span>
                <p className="text-gray-600 dark:text-gray-400 text-lg">No products found matching your search.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Shopping Cart Modal */}
      {showCart && (
        <div className="fixed inset-0 bg-black/50 z-40 flex items-end sm:items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full sm:max-w-lg max-h-[80vh] overflow-y-auto">
            <div className="sticky top-0 bg-gradient-to-r from-purple-600 to-blue-600 text-white p-4 flex justify-between items-center">
              <h2 className="text-xl font-bold">🛒 Shopping Cart</h2>
              <button
                onClick={() => setShowCart(false)}
                className="text-2xl hover:scale-110 transition"
              >
                ✕
              </button>
            </div>

            {cart.length > 0 ? (
              <>
                <div className="p-4 space-y-4">
                  {cart.map(item => (
                    <div
                      key={item.id}
                      className="flex gap-4 border-b dark:border-gray-700 pb-4"
                    >
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-20 h-20 rounded-lg object-cover"
                      />
                      <div className="flex-1">
                        <h3 className="font-bold text-gray-900 dark:text-white">{item.name}</h3>
                        <p className="text-purple-600 font-bold">{formatPrice(item.price)}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <button
                            onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                            className="bg-gray-200 dark:bg-gray-700 w-6 h-6 rounded flex items-center justify-center"
                          >
                            −
                          </button>
                          <span className="px-2 font-bold">{item.quantity}</span>
                          <button
                            onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                            className="bg-gray-200 dark:bg-gray-700 w-6 h-6 rounded flex items-center justify-center"
                          >
                            +
                          </button>
                          <button
                            onClick={() => handleRemoveFromCart(item.id)}
                            className="ml-auto text-red-600 hover:text-red-800"
                          >
                            🗑️
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="sticky bottom-0 bg-gray-50 dark:bg-gray-700 border-t dark:border-gray-600 p-4 space-y-3">
                  <div className="flex justify-between items-center text-lg font-bold">
                    <span>Total:</span>
                    <span className="text-purple-600">{formatPrice(cartTotal)}</span>
                  </div>
                  <button className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-3 rounded-lg font-bold hover:from-green-600 hover:to-green-700 transition">
                    ✓ Proceed to Checkout
                  </button>
                  <button
                    onClick={() => setShowCart(false)}
                    className="w-full bg-gray-300 dark:bg-gray-600 text-gray-900 dark:text-white py-2 rounded-lg font-bold hover:bg-gray-400 dark:hover:bg-gray-700 transition"
                  >
                    Continue Shopping
                  </button>
                </div>
              </>
            ) : (
              <div className="p-8 text-center">
                <span className="text-5xl block mb-4">🛒</span>
                <p className="text-gray-600 dark:text-gray-400 mb-6">Your cart is empty</p>
                <button
                  onClick={() => setShowCart(false)}
                  className="bg-purple-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-purple-700"
                >
                  Start Shopping
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* SEO Meta Tags for Marketplace - Server Component would handle this */}
      {/* Product structured data would be added here for schema.org markup */}
    </div>
  );
}
