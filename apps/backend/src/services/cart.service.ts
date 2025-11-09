import db from '../db.js';
import { Cart, CartItem } from '../types.js';
import { v4 as uuidv4 } from 'uuid';

export function createCart(): Cart {
  const cart: Cart = {
    id: uuidv4(),
    items: [],
    total: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const stmt = db.prepare(`
    INSERT INTO carts (id, items, total, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?)
  `);

  stmt.run(cart.id, JSON.stringify(cart.items), cart.total, cart.createdAt, cart.updatedAt);

  return cart;
}

export function getCart(cartId: string): Cart | null {
  const stmt = db.prepare('SELECT * FROM carts WHERE id = ?');
  const row = stmt.get(cartId) as any;

  if (!row) return null;

  return {
    id: row.id,
    items: JSON.parse(row.items),
    total: row.total,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function saveCart(cart: Cart): void {
  const stmt = db.prepare(`
    UPDATE carts
    SET items = ?, total = ?, updated_at = ?
    WHERE id = ?
  `);

  stmt.run(JSON.stringify(cart.items), cart.total, cart.updatedAt, cart.id);
}

// BUG 2: Race Condition on Concurrent Updates
// These two operations are not atomic - if two requests arrive within ~50ms,
// one update overwrites the other because there's no transaction
export function addItemToCart(cartId: string, item: CartItem): Cart | null {
  // BUG: Read operation
  const cart = getCart(cartId);
  if (!cart) return null;

  // Find if item already exists
  const existingItem = cart.items.find(i => i.productId === item.productId);

  if (existingItem) {
    existingItem.quantity += item.quantity;
  } else {
    cart.items.push(item);
  }

  cart.total += item.price * item.quantity;
  cart.updatedAt = new Date().toISOString();

  // BUG: Write operation - if two requests happen concurrently, second overwrites first
  saveCart(cart);

  return cart;
}

export function updateCartItem(cartId: string, productId: number, quantity: number): Cart | null {
  const cart = getCart(cartId);
  if (!cart) return null;

  const item = cart.items.find(i => i.productId === productId);
  if (!item) return null;

  const oldQuantity = item.quantity;
  item.quantity = quantity;

  // Recalculate total
  cart.total += item.price * (quantity - oldQuantity);
  cart.updatedAt = new Date().toISOString();

  saveCart(cart);

  return cart;
}

export function removeCartItem(cartId: string, productId: number): Cart | null {
  const cart = getCart(cartId);
  if (!cart) return null;

  const itemIndex = cart.items.findIndex(i => i.productId === productId);
  if (itemIndex === -1) return null;

  const item = cart.items[itemIndex];
  cart.total -= item.price * item.quantity;
  cart.items.splice(itemIndex, 1);
  cart.updatedAt = new Date().toISOString();

  saveCart(cart);

  return cart;
}
