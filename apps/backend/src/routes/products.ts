import { Router } from 'express';
import db from '../db.js';
import { Product } from '../types.js';

const router = Router();

router.get('/', (req, res) => {
  const stmt = db.prepare('SELECT * FROM products');
  const products = stmt.all() as Product[];
  res.json(products);
});

router.get('/:id', (req, res) => {
  const { id } = req.params;
  const stmt = db.prepare('SELECT * FROM products WHERE id = ?');
  const product = stmt.get(id) as Product | undefined;

  if (!product) {
    return res.status(404).json({ error: 'Product not found' });
  }

  res.json(product);
});

export default router;
