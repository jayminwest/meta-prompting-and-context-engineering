import { Router } from 'express';
import { z } from 'zod';
import * as cartService from '../services/cart.service.js';
import db from '../db.js';
import { Product } from '../types.js';

const router = Router();

const addItemSchema = z.object({
  productId: z.number(),
  quantity: z.number().min(1),
});

const updateItemSchema = z.object({
  quantity: z.number().min(0),
});

router.post('/', (req, res) => {
  const cart = cartService.createCart();
  res.json(cart);
});

router.get('/:id', (req, res) => {
  const { id } = req.params;
  const cart = cartService.getCart(id);

  if (!cart) {
    return res.status(404).json({ error: 'Cart not found' });
  }

  res.json(cart);
});

router.post('/:id/items', (req, res) => {
  try {
    const { id } = req.params;
    const { productId, quantity } = addItemSchema.parse(req.body);

    // Get product to verify it exists and get current price
    const stmt = db.prepare('SELECT * FROM products WHERE id = ?');
    const product = stmt.get(productId) as Product | undefined;

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    if (product.stock < quantity) {
      return res.status(400).json({ error: 'Insufficient stock' });
    }

    const cart = cartService.addItemToCart(id, {
      productId,
      quantity,
      price: product.price,
    });

    if (!cart) {
      return res.status(404).json({ error: 'Cart not found' });
    }

    res.json(cart);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.put('/:id/items/:productId', (req, res) => {
  try {
    const { id, productId } = req.params;
    const { quantity } = updateItemSchema.parse(req.body);

    if (quantity === 0) {
      const cart = cartService.removeCartItem(id, parseInt(productId));
      if (!cart) {
        return res.status(404).json({ error: 'Cart or item not found' });
      }
      return res.json(cart);
    }

    const cart = cartService.updateCartItem(id, parseInt(productId), quantity);

    if (!cart) {
      return res.status(404).json({ error: 'Cart or item not found' });
    }

    res.json(cart);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.delete('/:id/items/:productId', (req, res) => {
  const { id, productId } = req.params;
  const cart = cartService.removeCartItem(id, parseInt(productId));

  if (!cart) {
    return res.status(404).json({ error: 'Cart or item not found' });
  }

  res.json(cart);
});

export default router;
