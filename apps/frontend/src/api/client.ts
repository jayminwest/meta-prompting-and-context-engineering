const API_BASE = '/api';

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
  price: number;
}

export interface Cart {
  id: string;
  items: CartItem[];
  total: number;
  createdAt: string;
  updatedAt: string;
}

export interface Order {
  id: string;
  cartId: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  total: number;
  paymentIntentId: string | null;
  createdAt: string;
  updatedAt: string;
}

async function fetchAPI<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${url}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`API Error: ${response.statusText}`);
  }

  return response.json();
}

export const api = {
  // Products
  getProducts: () => fetchAPI<Product[]>('/products'),
  getProduct: (id: number) => fetchAPI<Product>(`/products/${id}`),

  // Cart
  createCart: () => fetchAPI<Cart>('/cart', { method: 'POST' }),
  getCart: (id: string) => fetchAPI<Cart>(`/cart/${id}`),
  addToCart: (cartId: string, productId: number, quantity: number) =>
    fetchAPI<Cart>(`/cart/${cartId}/items`, {
      method: 'POST',
      body: JSON.stringify({ productId, quantity }),
    }),
  updateCartItem: (cartId: string, productId: number, quantity: number) =>
    fetchAPI<Cart>(`/cart/${cartId}/items/${productId}`, {
      method: 'PUT',
      body: JSON.stringify({ quantity }),
    }),
  removeFromCart: (cartId: string, productId: number) =>
    fetchAPI<Cart>(`/cart/${cartId}/items/${productId}`, {
      method: 'DELETE',
    }),

  // Orders
  createOrder: (cartId: string) =>
    fetchAPI<Order>('/orders', {
      method: 'POST',
      body: JSON.stringify({ cartId }),
    }),
  getOrder: (id: string) => fetchAPI<Order>(`/orders/${id}`),
};
