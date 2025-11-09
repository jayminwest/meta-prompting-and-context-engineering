import db from '../db.js';
import { Order } from '../types.js';
import { v4 as uuidv4 } from 'uuid';
import { getCart } from './cart.service.js';

export function createOrder(cartId: string): Order | null {
  const cart = getCart(cartId);
  if (!cart) return null;

  const order: Order = {
    id: uuidv4(),
    cartId,
    status: 'processing',
    total: cart.total,
    paymentIntentId: `pi_${uuidv4()}`, // Simulated payment intent
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const stmt = db.prepare(`
    INSERT INTO orders (id, cart_id, status, total, payment_intent_id, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  stmt.run(
    order.id,
    order.cartId,
    order.status,
    order.total,
    order.paymentIntentId,
    order.createdAt,
    order.updatedAt
  );

  return order;
}

export function getOrder(orderId: string): Order | null {
  const stmt = db.prepare('SELECT * FROM orders WHERE id = ?');
  const row = stmt.get(orderId) as any;

  if (!row) return null;

  return {
    id: row.id,
    cartId: row.cart_id,
    status: row.status,
    total: row.total,
    paymentIntentId: row.payment_intent_id,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function updateOrderStatus(paymentIntentId: string, status: 'completed' | 'failed'): boolean {
  const stmt = db.prepare(`
    UPDATE orders
    SET status = ?, updated_at = ?
    WHERE payment_intent_id = ?
  `);

  const result = stmt.run(status, new Date().toISOString(), paymentIntentId);

  return result.changes > 0;
}
