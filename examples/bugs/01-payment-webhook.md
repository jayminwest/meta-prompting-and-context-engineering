# Bug 1: Payment Webhook Not Updating Order Status

## Summary

Orders remain stuck in "processing" state indefinitely after payment is completed. The webhook handler exists but is never registered with Express.

## How to Reproduce

1. Start the application: `pnpm dev`
2. Add items to cart
3. Place an order
4. Navigate to order status page
5. Simulate webhook: `curl -X POST http://localhost:3001/api/webhooks/payment -H "Content-Type: application/json" -d '{"eventType":"payment.succeeded","paymentIntentId":"pi_xxx","amount":10000,"timestamp":"2024-01-01T00:00:00.000Z"}'`
6. Observe: 404 error from webhook, order status never updates

## Root Cause

The webhook handler is implemented in `apps/backend/src/webhooks/payment.ts` but:
- It's not imported in `apps/backend/src/server.ts`
- The route is not registered with Express

See lines 5-6 in `server.ts`:
```typescript
// import paymentWebhook from './webhooks/payment.js';  // <-- COMMENTED OUT
```

And lines 18-19:
```typescript
// app.use('/api/webhooks', paymentWebhook);  // <-- NOT REGISTERED
```

## Affected Files

- `apps/backend/src/server.ts` - Missing import and route registration
- `apps/backend/src/webhooks/payment.ts` - Handler implementation (correct)
- `apps/backend/src/services/order.service.ts` - Status update logic (correct)

## Fix

Uncomment the import and route registration in `server.ts`:

```typescript
import paymentWebhook from './webhooks/payment.js';

// ...

app.use('/api/webhooks', paymentWebhook);
```

## Test Strategy

1. Unit test: Mock webhook POST to `/api/webhooks/payment`, verify order status updates
2. Integration test: Create order, send webhook, query order status
3. Manual test: Use curl to simulate webhook, refresh order page

## Context Required for Meta-Prompt

- Backend routing setup
- Order status flow
- Frontend polling behavior
- Webhook payload structure
