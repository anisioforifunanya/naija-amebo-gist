'use client';

import { useState } from 'react';
import Link from 'next/link';

interface ProductSubmission {
  title: string;
  description: string;
  longDescription: string;
  category: string;
  price: number;
  originalPrice: number;
  images: string[];
  deliveryTime: string;
  shippingCost: number;
  phoneNumber: string;
  email: string;
  location: string;
  tags: string[];
}

const CATEGORIES = [
  { id: 'phones', name: '📱 Phones & Tablets' },
  { id: 'electronics', name: '⚡ Electronics' },
  { id: 'computers', name: '💻 Computers & Laptops' },
  { id: 'fashion', name: '👔 Fashion & Clothing' },
  { id: 'home', name: '🏠 Home & Garden' },
  { id: 'automotive', name: '🚗 Automotive' },
  { id: 'beauty', name: '💅 Beauty & Health' },
  { id: 'sports', name: '⚽ Sports & Outdoors' },
  { id: 'books', name: '📚 Books & Learning' },
  { id: 'services', name: '🛠️ Services' },
];

export default function SubmitProductPage() {
  const [formData, setFormData] = useState<ProductSubmission>({
    title: '',
    description: '',
    longDescription: '',
    category: 'electronics',
    price: 0,
    originalPrice: 0,
    images: [],
    deliveryTime: '3-5 days',
    shippingCost: 2000,
    phoneNumber: '',
    email: '',
    location: 'Lagos',
    tags: [],
  });

  const [step, setStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [imagePreview, setImagePreview] = useState<string>('');
  const [showSuccess, setShowSuccess] = useState(false);

  const validateStep = (currentStep: number): boolean => {
    const newErrors: Record<string, string> = {};

    if (currentStep === 1) {
      if (!formData.title.trim()) newErrors.title = 'Product title is required';
      if (!formData.description.trim()) newErrors.description = 'Short description is required';
      if (formData.title.length < 10) newErrors.title = 'Title must be at least 10 characters';
      if (formData.description.length < 20) newErrors.description = 'Description must be at least 20 characters';
    }

    if (currentStep === 2) {
      if (formData.price <= 0) newErrors.price = 'Price must be greater than 0';
      if (formData.originalPrice < formData.price) {
        newErrors.originalPrice = 'Original price must be equal to or greater than sale price';
      }
    }

    if (currentStep === 3) {
      if (!formData.phoneNumber.trim()) newErrors.phoneNumber = 'Phone number is required';
      if (!formData.email.trim()) newErrors.email = 'Email is required';
      if (!formData.email.includes('@')) newErrors.email = 'Valid email is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof ProductSubmission, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setImagePreview(base64);
        setFormData(prev => ({
          ...prev,
          images: [base64, ...prev.images].slice(0, 5) // Max 5 images
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const handleTagAdd = (tag: string) => {
    if (tag.trim() && !formData.tags.includes(tag) && formData.tags.length < 5) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tag.trim()]
      }));
    }
  };

  const handleSubmit = () => {
    if (!validateStep(3)) return;

    // Save to localStorage (in production, send to backend)
    const submissions = JSON.parse(localStorage.getItem('marketplace_submissions') || '[]');
    const userId = localStorage.getItem('naijaAmeboCurrentUser')
      ? JSON.parse(localStorage.getItem('naijaAmeboCurrentUser') || '{}').id
      : 'anonymous';

    const newSubmission = {
      id: Math.random().toString(36).substr(2, 9),
      ...formData,
      vendorId: userId,
      status: 'pending' as const,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    submissions.push(newSubmission);
    localStorage.setItem('marketplace_submissions', JSON.stringify(submissions));

    setShowSuccess(true);
    setTimeout(() => {
      window.location.href = '/marketplace/my-products';
    }, 2000);
  };

  const handleNextStep = () => {
    if (validateStep(step)) {
      setStep(step + 1);
    }
  };

  const discountPercentage = formData.originalPrice > 0
    ? Math.round(((formData.originalPrice - formData.price) / formData.originalPrice) * 100)
    : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/marketplace" className="text-purple-600 hover:text-purple-700 dark:text-purple-400 mb-4 inline-block">
            ← Back to Marketplace
          </Link>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            📦 List Your Product
          </h1>
          <p className="text-gray-600 dark:text-gray-400 max-w-xl mx-auto">
            Sell your products on Naija Marketplace. Fill in the details below and our team will review and approve your listing.
          </p>
        </div>

        {/* Success Message */}
        {showSuccess && (
          <div className="mb-6 p-4 bg-green-100 dark:bg-green-900 border-l-4 border-green-500 rounded">
            <p className="text-green-700 dark:text-green-300 font-bold">
              ✓ Product submitted successfully! Redirecting to your products...
            </p>
          </div>
        )}

        {/* Progress Steps */}
        <div className="mb-8 bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            {[1, 2, 3, 4].map((stepNum) => (
              <div key={stepNum} className="flex items-center flex-1">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition ${
                    step >= stepNum
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-300 dark:bg-gray-600 text-gray-600 dark:text-gray-400'
                  }`}
                >
                  {stepNum}
                </div>
                {stepNum < 4 && (
                  <div
                    className={`h-1 flex-1 mx-2 rounded transition ${
                      step > stepNum
                        ? 'bg-purple-600'
                        : 'bg-gray-300 dark:bg-gray-600'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-4 text-sm font-semibold text-gray-600 dark:text-gray-400">
            <span>Basic Info</span>
            <span>Pricing</span>
            <span>Contact</span>
            <span>Review</span>
          </div>
        </div>

        {/* Form Content */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
          {/* Step 1: Basic Information */}
          {step === 1 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Product Information</h2>

              {/* Title */}
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                  Product Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="e.g., Samsung Galaxy S21 Ultra 256GB"
                  className={`w-full px-4 py-3 rounded-lg border-2 transition ${
                    errors.title
                      ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                      : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700'
                  } text-gray-900 dark:text-white`}
                />
                {errors.title && <p className="text-red-600 dark:text-red-400 text-sm mt-1">{errors.title}</p>}
                <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
                  {formData.title.length}/100 characters
                </p>
              </div>

              {/* Short Description */}
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                  Short Description *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Brief description of your product (1-2 sentences)"
                  rows={3}
                  className={`w-full px-4 py-3 rounded-lg border-2 transition ${
                    errors.description
                      ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                      : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700'
                  } text-gray-900 dark:text-white`}
                />
                {errors.description && <p className="text-red-600 dark:text-red-400 text-sm mt-1">{errors.description}</p>}
              </div>

              {/* Long Description */}
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                  Detailed Description
                </label>
                <textarea
                  value={formData.longDescription}
                  onChange={(e) => handleInputChange('longDescription', e.target.value)}
                  placeholder="Detailed description with features, condition, specifications..."
                  rows={5}
                  className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                  Category *
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => handleInputChange('category', e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  {CATEGORIES.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              {/* Tags */}
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                  Tags (Max 5)
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    placeholder="Add tags (e.g., New, Original, Warranty)"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        handleTagAdd(e.currentTarget.value);
                        e.currentTarget.value = '';
                      }
                    }}
                    className="flex-1 px-4 py-2 rounded-lg border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.tags.map((tag, idx) => (
                    <div
                      key={idx}
                      className="bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 px-3 py-1 rounded-full text-sm flex items-center gap-2"
                    >
                      {tag}
                      <button
                        onClick={() => setFormData(prev => ({
                          ...prev,
                          tags: prev.tags.filter((_, i) => i !== idx)
                        }))}
                        className="hover:text-purple-900 dark:hover:text-purple-100"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Pricing & Images */}
          {step === 2 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Pricing & Images</h2>

              {/* Sale Price */}
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                  Sale Price (₦) *
                </label>
                <input
                  type="number"
                  value={formData.price || ''}
                  onChange={(e) => handleInputChange('price', parseInt(e.target.value) || 0)}
                  placeholder="0"
                  className={`w-full px-4 py-3 rounded-lg border-2 transition ${
                    errors.price
                      ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                      : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700'
                  } text-gray-900 dark:text-white`}
                />
                {errors.price && <p className="text-red-600 dark:text-red-400 text-sm mt-1">{errors.price}</p>}
              </div>

              {/* Original Price */}
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                  Original Price (₦)
                </label>
                <input
                  type="number"
                  value={formData.originalPrice || ''}
                  onChange={(e) => handleInputChange('originalPrice', parseInt(e.target.value) || 0)}
                  placeholder="Leave empty if no discount"
                  className={`w-full px-4 py-3 rounded-lg border-2 transition ${
                    errors.originalPrice
                      ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                      : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700'
                  } text-gray-900 dark:text-white`}
                />
                {errors.originalPrice && <p className="text-red-600 dark:text-red-400 text-sm mt-1">{errors.originalPrice}</p>}
                {discountPercentage > 0 && (
                  <p className="text-green-600 dark:text-green-400 font-bold text-sm mt-1">
                    💰 Discount: {discountPercentage}% OFF
                  </p>
                )}
              </div>

              {/* Shipping Cost */}
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                  Shipping Cost (₦)
                </label>
                <input
                  type="number"
                  value={formData.shippingCost}
                  onChange={(e) => handleInputChange('shippingCost', parseInt(e.target.value) || 0)}
                  className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              {/* Delivery Time */}
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                  Estimated Delivery Time
                </label>
                <select
                  value={formData.deliveryTime}
                  onChange={(e) => handleInputChange('deliveryTime', e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="1-2 days">1-2 days (Express)</option>
                  <option value="2-3 days">2-3 days (Standard)</option>
                  <option value="3-5 days">3-5 days (Regular)</option>
                  <option value="5-7 days">5-7 days (Economy)</option>
                </select>
              </div>

              {/* Product Images */}
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                  Product Images (Max 5) - Click to upload
                </label>
                <label className="block border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center cursor-pointer hover:border-purple-500 transition">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  <div className="text-gray-600 dark:text-gray-400">
                    <p className="text-2xl mb-2">📸</p>
                    <p className="font-bold">Click to upload or drag and drop</p>
                    <p className="text-sm">PNG, JPG, GIF up to 10MB</p>
                  </div>
                </label>

                {/* Image Previews */}
                {formData.images.length > 0 && (
                  <div className="mt-4">
                    <p className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-3">
                      Your images ({formData.images.length}/5)
                    </p>
                    <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
                      {formData.images.map((img, idx) => (
                        <div key={idx} className="relative group">
                          <img
                            src={img}
                            alt={`Preview ${idx + 1}`}
                            className="w-full h-24 object-cover rounded-lg"
                          />
                          <button
                            onClick={() => removeImage(idx)}
                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 3: Contact Information */}
          {step === 3 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Contact Information</h2>

              {/* Phone Number */}
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  value={formData.phoneNumber}
                  onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                  placeholder="e.g., +234 802 123 4567"
                  className={`w-full px-4 py-3 rounded-lg border-2 transition ${
                    errors.phoneNumber
                      ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                      : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700'
                  } text-gray-900 dark:text-white`}
                />
                {errors.phoneNumber && <p className="text-red-600 dark:text-red-400 text-sm mt-1">{errors.phoneNumber}</p>}
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="e.g., seller@example.com"
                  className={`w-full px-4 py-3 rounded-lg border-2 transition ${
                    errors.email
                      ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                      : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700'
                  } text-gray-900 dark:text-white`}
                />
                {errors.email && <p className="text-red-600 dark:text-red-400 text-sm mt-1">{errors.email}</p>}
              </div>

              {/* Location */}
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                  Location
                </label>
                <select
                  value={formData.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="Lagos">Lagos</option>
                  <option value="Abuja">Abuja</option>
                  <option value="Portharcourt">Portharcourt</option>
                  <option value="Kano">Kano</option>
                  <option value="Ibadan">Ibadan</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              {/* Terms & Conditions */}
              <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 p-4 rounded">
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  <span className="font-bold">📋 Important:</span> By submitting this product, you agree that:
                </p>
                <ul className="list-disc list-inside text-sm text-gray-600 dark:text-gray-400 mt-2 space-y-1">
                  <li>The product information is accurate and truthful</li>
                  <li>You own the rights to all images and descriptions</li>
                  <li>The product complies with Nigerian laws</li>
                  <li>Your contact information is correct for approval communication</li>
                  <li>You accept our marketplace terms and conditions</li>
                </ul>
              </div>
            </div>
          )}

          {/* Step 4: Review */}
          {step === 4 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Review Your Listing</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Preview Card */}
                <div className="bg-gradient-to-br from-gray-100 to-gray-50 dark:from-gray-700 dark:to-gray-800 rounded-lg p-6">
                  <h3 className="font-bold text-gray-900 dark:text-white mb-4">Product Preview</h3>

                  {formData.images.length > 0 && (
                    <img
                      src={formData.images[0]}
                      alt="Product"
                      className="w-full h-48 object-cover rounded-lg mb-4"
                    />
                  )}

                  <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                    {formData.title}
                  </h4>

                  <p className="text-gray-700 dark:text-gray-300 text-sm mb-4">
                    {formData.description}
                  </p>

                  <div className="mb-3">
                    <div className="text-2xl font-bold text-purple-600">
                      ₦{formData.price.toLocaleString('en-NG')}
                    </div>
                    {discountPercentage > 0 && (
                      <div className="text-sm text-gray-500 line-through">
                        ₦{formData.originalPrice.toLocaleString('en-NG')}
                      </div>
                    )}
                  </div>

                  <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                    <p>📦 {formData.category}</p>
                    <p>🚚 {formData.deliveryTime}</p>
                    <p>💵 Shipping: ₦{formData.shippingCost.toLocaleString('en-NG')}</p>
                  </div>
                </div>

                {/* Summary */}
                <div>
                  <h3 className="font-bold text-gray-900 dark:text-white mb-4">Details Summary</h3>

                  <div className="space-y-3 text-sm">
                    <div className="border-b dark:border-gray-700 pb-3">
                      <p className="text-gray-500 dark:text-gray-400">Title</p>
                      <p className="font-bold text-gray-900 dark:text-white">{formData.title}</p>
                    </div>

                    <div className="border-b dark:border-gray-700 pb-3">
                      <p className="text-gray-500 dark:text-gray-400">Category</p>
                      <p className="font-bold text-gray-900 dark:text-white">
                        {CATEGORIES.find(c => c.id === formData.category)?.name}
                      </p>
                    </div>

                    <div className="border-b dark:border-gray-700 pb-3">
                      <p className="text-gray-500 dark:text-gray-400">Price</p>
                      <p className="font-bold text-gray-900 dark:text-white">
                        ₦{formData.price.toLocaleString('en-NG')}
                        {discountPercentage > 0 && (
                          <span className="ml-2 text-red-600 font-bold">-{discountPercentage}%</span>
                        )}
                      </p>
                    </div>

                    <div className="border-b dark:border-gray-700 pb-3">
                      <p className="text-gray-500 dark:text-gray-400">Images</p>
                      <p className="font-bold text-gray-900 dark:text-white">{formData.images.length}/5</p>
                    </div>

                    <div className="border-b dark:border-gray-700 pb-3">
                      <p className="text-gray-500 dark:text-gray-400">Seller Contact</p>
                      <p className="font-bold text-gray-900 dark:text-white text-xs break-all">
                        {formData.phoneNumber}
                      </p>
                    </div>

                    <div className="border-b dark:border-gray-700 pb-3">
                      <p className="text-gray-500 dark:text-gray-400">Location</p>
                      <p className="font-bold text-gray-900 dark:text-white">{formData.location}</p>
                    </div>

                    {formData.tags.length > 0 && (
                      <div>
                        <p className="text-gray-500 dark:text-gray-400 mb-2">Tags</p>
                        <div className="flex flex-wrap gap-2">
                          {formData.tags.map((tag, idx) => (
                            <span key={idx} className="bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 text-xs px-2 py-1 rounded">
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Status Info */}
                  <div className="mt-6 bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-500 p-4 rounded">
                    <p className="text-sm text-yellow-800 dark:text-yellow-300">
                      <span className="font-bold">⏳ Pending Review:</span> Your product will be reviewed by our admin team within 24 hours. You'll receive an email notification once it's approved or if changes are needed.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between gap-4 mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
            {step > 1 && (
              <button
                onClick={() => setStep(step - 1)}
                className="px-6 py-3 rounded-lg border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-bold hover:bg-gray-100 dark:hover:bg-gray-700 transition"
              >
                ← Previous
              </button>
            )}

            {step < 4 ? (
              <button
                onClick={handleNextStep}
                className="ml-auto px-6 py-3 rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold hover:from-purple-700 hover:to-blue-700 transition"
              >
                Next →
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                className="ml-auto px-6 py-3 rounded-lg bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold hover:from-green-600 hover:to-emerald-700 transition flex items-center gap-2"
              >
                ✓ Submit for Approval
              </button>
            )}
          </div>
        </div>

        {/* Info Box */}
        <div className="mt-8 bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6 border-l-4 border-blue-500">
          <h3 className="font-bold text-blue-900 dark:text-blue-300 mb-3">💡 Listing Tips</h3>
          <ul className="text-sm text-blue-800 dark:text-blue-400 space-y-2">
            <li>✓ Use clear, descriptive titles (at least 10 characters)</li>
            <li>✓ Include high-quality product photos from different angles</li>
            <li>✓ Be honest about product condition and features</li>
            <li>✓ Price competitively while maintaining profit margins</li>
            <li>✓ Set realistic delivery times to build customer trust</li>
            <li>✓ Include relevant tags to help customers find your product</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
