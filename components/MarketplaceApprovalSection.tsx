'use client';

import { useState, useEffect } from 'react';
import {
  getPendingUserProducts,
  getApprovedUserProducts,
  getRejectedUserProducts,
  approveUserProduct,
  rejectUserProduct,
  getProductStatistics,
  type Product,
} from '@/lib/productManagement';

export default function MarketplaceApprovalSection() {
  const [pendingProducts, setPendingProducts] = useState<Product[]>([]);
  const [approvedProducts, setApprovedProducts] = useState<Product[]>([]);
  const [rejectedProducts, setRejectedProducts] = useState<Product[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<'pending' | 'approved' | 'rejected'>('pending');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectForm, setShowRejectForm] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setPendingProducts(getPendingUserProducts());
    setApprovedProducts(getApprovedUserProducts());
    setRejectedProducts(getRejectedUserProducts());
    setStats(getProductStatistics());
    setLoading(false);
  };

  const handleApprove = (productId: string) => {
    if (approveUserProduct(productId)) {
      setPendingProducts(pendingProducts.filter(p => p.id !== productId));
      const product = pendingProducts.find(p => p.id === productId);
      if (product) {
        setApprovedProducts([...approvedProducts, { ...product, status: 'approved' }]);
      }
      setStats(getProductStatistics());
      alert('✓ Product approved successfully!');
    }
  };

  const handleReject = () => {
    if (!selectedProduct || !rejectReason.trim()) {
      alert('Please provide a reason for rejection');
      return;
    }

    if (rejectUserProduct(selectedProduct.id, rejectReason)) {
      setPendingProducts(pendingProducts.filter(p => p.id !== selectedProduct.id));
      const product = pendingProducts.find(p => p.id === selectedProduct.id);
      if (product) {
        setRejectedProducts([...rejectedProducts, { ...product, status: 'rejected', adminNotes: rejectReason }]);
      }
      setStats(getProductStatistics());
      setShowRejectForm(false);
      setRejectReason('');
      setSelectedProduct(null);
      alert('✕ Product rejected and seller notified');
    }
  };

  const displayedProducts = {
    pending: pendingProducts,
    approved: approvedProducts,
    rejected: rejectedProducts,
  };

  const currentProducts = displayedProducts[filterStatus];

  if (loading) {
    return <div className="text-center py-12">Loading marketplace data...</div>;
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">🛍️ Marketplace Product Approvals</h2>

      {/* Statistics */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow">
            <p className="text-sm text-gray-500 dark:text-gray-400">Total Submissions</p>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
          </div>
          <div className="bg-yellow-100 dark:bg-yellow-900/30 rounded-lg p-6 shadow">
            <p className="text-sm text-yellow-800 dark:text-yellow-300 font-semibold">Pending Review</p>
            <p className="text-3xl font-bold text-yellow-600 dark:text-yellow-300">{stats.pending}</p>
          </div>
          <div className="bg-green-100 dark:bg-green-900/30 rounded-lg p-6 shadow">
            <p className="text-sm text-green-800 dark:text-green-300 font-semibold">Approved</p>
            <p className="text-3xl font-bold text-green-600 dark:text-green-300">{stats.approved}</p>
          </div>
          <div className="bg-red-100 dark:bg-red-900/30 rounded-lg p-6 shadow">
            <p className="text-sm text-red-800 dark:text-red-300 font-semibold">Rejected</p>
            <p className="text-3xl font-bold text-red-600 dark:text-red-300">{stats.rejected}</p>
          </div>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex gap-2">
        {['pending', 'approved', 'rejected'].map((status) => (
          <button
            key={status}
            onClick={() => setFilterStatus(status as any)}
            className={`px-4 py-2 rounded-lg font-semibold transition ${
              filterStatus === status
                ? 'bg-purple-600 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300'
            }`}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)} ({displayedProducts[status as keyof typeof displayedProducts].length})
          </button>
        ))}
      </div>

      {/* Products List */}
      {currentProducts.length > 0 ? (
        <div className="space-y-4">
          {currentProducts.map((product) => (
            <div
              key={product.id}
              className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border-l-4 border-purple-500"
            >
              <div className="flex gap-6 flex-wrap">
                {/* Image Preview */}
                {product.images && product.images.length > 0 && (
                  <div className="w-24 h-24 flex-shrink-0">
                    <img
                      src={product.images[0].url}
                      alt={product.images[0].alt || product.name}
                      className="w-full h-full object-cover rounded"
                    />
                  </div>
                )}

                {/* Product Info */}
                <div className="flex-1 min-w-[250px]">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">{product.name}</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">{product.description}</p>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm mb-3">
                    <div>
                      <p className="text-gray-500 dark:text-gray-400 text-xs">Price</p>
                      <p className="font-bold">₦{product.price.toLocaleString('en-NG')}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 dark:text-gray-400 text-xs">Category</p>
                      <p className="font-bold">{product.category}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 dark:text-gray-400 text-xs">Seller</p>
                      <p className="font-bold text-xs">{product.phoneNumber || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 dark:text-gray-400 text-xs">Images</p>
                      <p className="font-bold">{product.images?.length || 0}/5</p>
                    </div>
                  </div>

                  {/* Seller Contact */}
                  <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded text-sm mb-3">
                    <p className="text-gray-600 dark:text-gray-400">
                      📧 <span className="font-mono text-xs">{product.email}</span>
                    </p>
                    <p className="text-gray-600 dark:text-gray-400">
                      📱 <span className="font-mono text-xs">{product.phoneNumber}</span>
                    </p>
                    <p className="text-gray-600 dark:text-gray-400">
                      📍 {product.location}
                    </p>
                  </div>

                  {/* Admin Notes (if rejected) */}
                  {product.status === 'rejected' && product.adminNotes && (
                    <div className="bg-red-100 dark:bg-red-900/30 border-l-4 border-red-500 p-3 rounded text-sm">
                      <p className="font-bold text-red-700 dark:text-red-300">Rejection Reason:</p>
                      <p className="text-red-600 dark:text-red-400">{product.adminNotes}</p>
                    </div>
                  )}
                </div>

                {/* Actions */}
                {filterStatus === 'pending' && (
                  <div className="flex flex-col gap-2 justify-start min-w-[140px]">
                    <button
                      onClick={() => handleApprove(product.id)}
                      className="px-4 py-2 bg-green-600 text-white rounded font-bold hover:bg-green-700 transition text-sm"
                    >
                      ✓ Approve
                    </button>
                    <button
                      onClick={() => {
                        setSelectedProduct(product);
                        setShowRejectForm(true);
                      }}
                      className="px-4 py-2 bg-red-600 text-white rounded font-bold hover:bg-red-700 transition text-sm"
                    >
                      ✕ Reject
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-12 text-center">
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            No {filterStatus} products to display.
          </p>
        </div>
      )}

      {/* Reject Form Modal */}
      {showRejectForm && selectedProduct && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg max-w-md w-full">
            <div className="p-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                Reject Product: {selectedProduct.name}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4 text-sm">
                Please provide a reason for rejection. The seller will be notified with this message.
              </p>

              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="e.g., Product images are blurry, pricing seems suspicious, incomplete description..."
                rows={5}
                className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-red-500 focus:outline-none mb-4"
              />

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowRejectForm(false);
                    setSelectedProduct(null);
                    setRejectReason('');
                  }}
                  className="flex-1 px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-900 dark:text-white rounded font-bold hover:bg-gray-400 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleReject}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded font-bold hover:bg-red-700 transition"
                >
                  Reject
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
