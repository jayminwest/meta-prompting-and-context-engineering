import { Router } from 'express';
import { z } from 'zod';
import * as orderService from '../services/order.service.js';

const router = Router();

const createOrderSchema = z.object({
  cartId: z.string(),
});

router.post('/', (req, res) => {
  try {
    const { cartId } = createOrderSchema.parse(req.body);
    const order = orderService.createOrder(cartId);

    if (!order) {
      return res.status(404).json({ error: 'Cart not found' });
    }

    res.json(order);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/:id', (req, res) => {
  const { id } = req.params;
  const order = orderService.getOrder(id);

  if (!order) {
    return res.status(404).json({ error: 'Order not found' });
  }

  res.json(order);
});

export default router;
