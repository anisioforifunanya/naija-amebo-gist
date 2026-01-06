'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  getUserProducts,
  deleteUserProduct,
  editUserProduct,
  type Product,
} from '@/lib/productManagement';

export default function MyProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    // Get current user
    if (typeof window !== 'undefined') {
      const userSession = localStorage.getItem('naijaAmeboCurrentUser');
      if (userSession) {
        const user = JSON.parse(userSession);
        setUserId(user.id);

        // Load user's products
        const userProds = getUserProducts(user.id);
        setProducts(userProds);
      } else {
        // Redirect to login
        window.location.href = '/login';
      }
    }
    setLoading(false);
  }, []);

  const filteredProducts = filterStatus === 'all'
    ? products
    : products.filter(p => p.status === filterStatus);

  const handleDelete = (productId: string) => {
    if (confirm('Are you sure you want to delete this product?')) {
      if (deleteUserProduct(productId)) {
        setProducts(products.filter(p => p.id !== productId));
      }
    }
  };

  const stats = {
    total: products.length,
    pending: products.filter(p => p.status === 'pending').length,
    approved: products.filter(p => p.status === 'approved').length,
    rejected: products.filter(p => p.status === 'rejected').length,
  };

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case 'approved':
        return <span className="bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 px-3 py-1 rounded-full text-sm font-bold">✓ Approved</span>;
      case 'pending':
        return <span className="bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300 px-3 py-1 rounded-full text-sm font-bold">⏳ Pending</span>;
      case 'rejected':
        return <span className="bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 px-3 py-1 rounded-full text-sm font-bold">✕ Rejected</span>;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-600 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading your products...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between gap-4 flex-wrap mb-8">
          <div>
            <Link href="/marketplace" className="text-purple-600 hover:text-purple-700 dark:text-purple-400 mb-4 inline-block">
              ← Back to Marketplace
            </Link>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
              📦 My Products
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Manage and track your product listings
            </p>
          </div>
          <Link
            href="/marketplace/submit-product"
            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold rounded-lg hover:from-purple-700 hover:to-blue-700 transition"
          >
            ➕ Add New Product
          </Link>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 text-center">
            <div className="text-3xl font-bold text-purple-600">{stats.total}</div>
            <p className="text-gray-600 dark:text-gray-400 text-sm font-semibold mt-2">Total Products</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 text-center">
            <div className="text-3xl font-bold text-yellow-600">{stats.pending}</div>
            <p className="text-gray-600 dark:text-gray-400 text-sm font-semibold mt-2">Pending Review</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 text-center">
            <div className="text-3xl font-bold text-green-600">{stats.approved}</div>
            <p className="text-gray-600 dark:text-gray-400 text-sm font-semibold mt-2">Approved</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 text-center">
            <div className="text-3xl font-bold text-red-600">{stats.rejected}</div>
            <p className="text-gray-600 dark:text-gray-400 text-sm font-semibold mt-2">Rejected</p>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="mb-6 flex gap-2 flex-wrap">
          {['all', 'pending', 'approved', 'rejected'].map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status as any)}
              className={`px-4 py-2 rounded-lg font-semibold transition ${
                filterStatus === status
                  ? 'bg-purple-600 text-white'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-2 border-gray-300 dark:border-gray-600 hover:border-purple-600'
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>

        {/* Products List */}
        {filteredProducts.length > 0 ? (
          <div className="space-y-4">
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition p-6"
              >
                <div className="flex gap-6 flex-wrap">
                  {/* Image */}
                  {product.images && product.images.length > 0 && (
                    <div className="w-32 h-32 flex-shrink-0">
                      <img
                        src={product.images[0].url}
                        alt={product.images[0].alt || product.name}
                        className="w-full h-full object-cover rounded-lg"
                      />
                    </div>
                  )}

                  {/* Content */}
                  <div className="flex-1 min-w-[250px]">
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                          {product.name}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-2">
                          {product.description}
                        </p>
                      </div>
                      {getStatusBadge(product.status)}
                    </div>

                    {/* Details */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 my-4 text-sm">
                      <div>
                        <p className="text-gray-500 dark:text-gray-400 text-xs">Price</p>
                        <p className="font-bold text-gray-900 dark:text-white">
                          ₦{product.price.toLocaleString('en-NG')}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500 dark:text-gray-400 text-xs">Category</p>
                        <p className="font-bold text-gray-900 dark:text-white">{product.category}</p>
                      </div>
                      <div>
                        <p className="text-gray-500 dark:text-gray-400 text-xs">Delivery</p>
                        <p className="font-bold text-gray-900 dark:text-white">{product.deliveryTime}</p>
                      </div>
                      <div>
                        <p className="text-gray-500 dark:text-gray-400 text-xs">Images</p>
                        <p className="font-bold text-gray-900 dark:text-white">
                          {product.images?.length || 0}/5
                        </p>
                      </div>
                    </div>

                    {/* Admin Notes (if rejected) */}
                    {product.status === 'rejected' && product.adminNotes && (
                      <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 p-3 mb-4 rounded">
                        <p className="text-red-700 dark:text-red-300 text-sm">
                          <span className="font-bold">Admin Note:</span> {product.adminNotes}
                        </p>
                      </div>
                    )}

                    {/* Timestamps */}
                    <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
                      <p>
                        📅 Created: {product.createdAt
                          ? new Date(product.createdAt).toLocaleDateString('en-NG')
                          : 'N/A'}
                      </p>
                      {product.updatedAt && product.updatedAt !== product.createdAt && (
                        <p>
                          ✏️ Updated: {new Date(product.updatedAt).toLocaleDateString('en-NG')}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-2 justify-start min-w-[120px]">
                    {product.status === 'pending' && (
                      <Link
                        href={`/marketplace/edit-product/${product.id}`}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition text-center text-sm"
                      >
                        ✏️ Edit
                      </Link>
                    )}

                    {product.status === 'approved' && (
                      <Link
                        href={`/marketplace/product/${product.id}`}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition text-center text-sm"
                      >
                        👁️ View Live
                      </Link>
                    )}

                    <button
                      onClick={() => handleDelete(product.id)}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition text-sm"
                    >
                      🗑️ Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-12 text-center">
            <p className="text-5xl mb-4">📭</p>
            <p className="text-gray-600 dark:text-gray-400 text-lg mb-6">
              {filterStatus === 'all'
                ? "You haven't listed any products yet."
                : `No ${filterStatus} products.`}
            </p>
            <Link
              href="/marketplace/submit-product"
              className="inline-block px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold rounded-lg hover:from-purple-700 hover:to-blue-700 transition"
            >
              ➕ Start Selling Now
            </Link>
          </div>
        )}

        {/* Info Box */}
        <div className="mt-12 bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6 border-l-4 border-blue-500">
          <h3 className="font-bold text-blue-900 dark:text-blue-300 mb-3">💡 About Product Status</h3>
          <div className="grid md:grid-cols-3 gap-4 text-sm text-blue-800 dark:text-blue-400">
            <div>
              <p className="font-bold mb-1">⏳ Pending</p>
              <p>Your product is waiting for admin review. This usually takes 24 hours.</p>
            </div>
            <div>
              <p className="font-bold mb-1">✓ Approved</p>
              <p>Your product is now live on the marketplace and visible to all customers.</p>
            </div>
            <div>
              <p className="font-bold mb-1">✕ Rejected</p>
              <p>Check the admin notes and resubmit with corrections if needed.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
