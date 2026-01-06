/**
 * Payment Gateway Integration Helper
 * Supports: Paystack, Flutterwave, Pay on Delivery
 * Currency: Nigerian Naira (₦)
 */

export interface PaymentOption {
  id: string;
  name: string;
  description: string;
  icon: string;
  fee: number; // percentage
  processing_time: string;
  badge?: string;
}

export interface PaystackInitResponse {
  status: boolean;
  message: string;
  data?: {
    authorization_url: string;
    access_code: string;
    reference: string;
  };
}

export interface FlutterwaveInitResponse {
  status: string;
  message: string;
  data?: {
    link: string;
  };
}

// Payment options available for Nigerian market
export const PAYMENT_OPTIONS: PaymentOption[] = [
  {
    id: 'paystack',
    name: 'Paystack',
    description: 'Pay with Debit/Credit Card, Bank Transfer, USSD, QR Code',
    icon: '💳',
    fee: 1.5,
    processing_time: 'Instant',
    badge: 'RECOMMENDED'
  },
  {
    id: 'flutterwave',
    name: 'Flutterwave',
    description: 'Multiple payment methods including cards and mobile money',
    icon: '🌊',
    fee: 1.4,
    processing_time: 'Instant',
  },
  {
    id: 'cod',
    name: 'Pay on Delivery',
    description: 'Pay cash when your order arrives (Lagos, Abuja, other cities)',
    icon: '💰',
    fee: 0,
    processing_time: 'On Delivery',
    badge: 'POPULAR'
  },
];

/**
 * Initialize Paystack Payment
 * @param email Customer email
 * @param amount Amount in Naira
 * @param orderId Unique order ID
 */
export async function initPaystackPayment(
  email: string,
  amount: number,
  orderId: string
): Promise<PaystackInitResponse> {
  try {
    // In production, call your backend endpoint that initializes Paystack
    const response = await fetch('/api/payment/paystack/initialize', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        amount: Math.round(amount * 100), // Convert to kobo
        metadata: {
          order_id: orderId,
          custom_fields: []
        }
      })
    });

    return await response.json();
  } catch (error) {
    console.error('Paystack initialization error:', error);
    throw new Error('Failed to initialize Paystack payment');
  }
}

/**
 * Initialize Flutterwave Payment
 * @param email Customer email
 * @param amount Amount in Naira
 * @param orderId Unique order ID
 * @param customerName Customer name
 */
export async function initFlutterwavePayment(
  email: string,
  amount: number,
  orderId: string,
  customerName: string
): Promise<FlutterwaveInitResponse> {
  try {
    // In production, call your backend endpoint that initializes Flutterwave
    const response = await fetch('/api/payment/flutterwave/initialize', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        amount,
        order_id: orderId,
        customer_name: customerName,
      })
    });

    return await response.json();
  } catch (error) {
    console.error('Flutterwave initialization error:', error);
    throw new Error('Failed to initialize Flutterwave payment');
  }
}

/**
 * Verify Paystack Transaction
 * @param reference Transaction reference
 */
export async function verifyPaystackTransaction(reference: string): Promise<boolean> {
  try {
    const response = await fetch(`/api/payment/paystack/verify?reference=${reference}`);
    const data = await response.json();
    return data.status === true && data.data?.status === 'success';
  } catch (error) {
    console.error('Paystack verification error:', error);
    return false;
  }
}

/**
 * Verify Flutterwave Transaction
 * @param transactionId Transaction ID
 */
export async function verifyFlutterwaveTransaction(transactionId: string): Promise<boolean> {
  try {
    const response = await fetch(`/api/payment/flutterwave/verify?transaction_id=${transactionId}`);
    const data = await response.json();
    return data.status === 'success' && data.data?.status === 'successful';
  } catch (error) {
    console.error('Flutterwave verification error:', error);
    return false;
  }
}

/**
 * Calculate total with payment fee
 * @param subtotal Subtotal amount
 * @param paymentMethod Payment method ID
 */
export function calculateWithFee(subtotal: number, paymentMethod: string): {
  subtotal: number;
  fee: number;
  total: number;
} {
  const option = PAYMENT_OPTIONS.find(p => p.id === paymentMethod);
  const fee = Math.round(subtotal * (option?.fee || 0) / 100);
  
  return {
    subtotal,
    fee,
    total: subtotal + fee
  };
}

/**
 * Format currency for display
 */
export function formatNaira(amount: number): string {
  return '₦' + amount.toLocaleString('en-NG');
}

/**
 * Create order record
 */
export interface Order {
  id: string;
  userId: string;
  items: Array<{
    productId: string;
    quantity: number;
    price: number;
  }>;
  subtotal: number;
  shippingFee: number;
  paymentMethod: string;
  paymentFee: number;
  total: number;
  status: 'pending' | 'paid' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  deliveryAddress: {
    fullName: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
  };
  createdAt: Date;
  updatedAt: Date;
  paymentReference?: string;
}

/**
 * Save order to localStorage (in production, use database)
 */
export function saveOrder(order: Order): void {
  try {
    const orders = JSON.parse(localStorage.getItem('marketplace_orders') || '[]');
    orders.push(order);
    localStorage.setItem('marketplace_orders', JSON.stringify(orders));
  } catch (error) {
    console.error('Error saving order:', error);
  }
}

/**
 * Get order by ID
 */
export function getOrder(orderId: string): Order | null {
  try {
    const orders = JSON.parse(localStorage.getItem('marketplace_orders') || '[]');
    return orders.find((o: Order) => o.id === orderId) || null;
  } catch (error) {
    console.error('Error retrieving order:', error);
    return null;
  }
}

/**
 * Get all orders for a user
 */
export function getUserOrders(userId: string): Order[] {
  try {
    const orders = JSON.parse(localStorage.getItem('marketplace_orders') || '[]');
    return orders.filter((o: Order) => o.userId === userId);
  } catch (error) {
    console.error('Error retrieving user orders:', error);
    return [];
  }
}
