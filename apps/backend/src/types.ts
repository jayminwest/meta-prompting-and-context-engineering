export interface Product {
  id: number;
  name: string;
  price: number;
  description: string;
  stock: number;
}

export interface CartItem {
  productId: number;
  quantity: number;
  price: number; // Snapshot at add-to-cart time
}

export interface Cart {
  id: string; // UUID
  items: CartItem[];
  total: number;
  createdAt: string;
  updatedAt: string;
}

export interface Order {
  id: string; // UUID
  cartId: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  total: number;
  paymentIntentId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentWebhook {
  eventType: 'payment.succeeded' | 'payment.failed';
  paymentIntentId: string;
  amount: number;
  timestamp: string;
}
