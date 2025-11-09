import { Router } from 'express';
import { z } from 'zod';
import { updateOrderStatus } from '../services/order.service.js';

const router = Router();

const webhookSchema = z.object({
  eventType: z.enum(['payment.succeeded', 'payment.failed']),
  paymentIntentId: z.string(),
  amount: z.number(),
  timestamp: z.string(),
});

router.post('/payment', async (req, res) => {
  try {
    const payload = webhookSchema.parse(req.body);

    const newStatus = payload.eventType === 'payment.succeeded'
      ? 'completed'
      : 'failed';

    const updated = updateOrderStatus(payload.paymentIntentId, newStatus);

    if (!updated) {
      return res.status(404).json({ error: 'Order not found' });
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid webhook payload' });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
