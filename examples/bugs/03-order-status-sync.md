# Bug 3: Order Status Not Updating in Frontend

## Summary

The order status page displays the initial "processing" status but never updates to "completed" even after the webhook updates the database. The page appears frozen.

## How to Reproduce

1. Place an order and navigate to `/order/:id`
2. Manually update order status in database:
```bash
sqlite3 apps/backend/data.db "UPDATE orders SET status='completed' WHERE id='ORDER_ID'"
```
3. Wait 30 seconds
4. Observe: UI still shows "processing"

## Root Cause

The `useOrder` hook in `apps/frontend/src/hooks/useOrder.ts` uses TanStack Query's `useQuery` without polling enabled:

```typescript
export function useOrder(orderId: string | undefined) {
  return useQuery({
    queryKey: ['order', orderId],
    queryFn: () => {
      if (!orderId) throw new Error('No order ID');
      return api.getOrder(orderId);
    },
    enabled: !!orderId,
    // BUG: No refetchInterval configured
    // Status appears frozen because there's no polling
  });
}
```

The query fetches once on mount, then never refetches. Without polling or manual invalidation, the UI is out of sync with the database.

## Affected Files

- `apps/frontend/src/hooks/useOrder.ts:8-18` - Missing polling configuration
- `apps/frontend/src/components/OrderStatus.tsx:6` - Consumes the hook
- `apps/backend/src/webhooks/payment.ts` - Updates database (correct)

## Fix

Add `refetchInterval` to the query config:

```typescript
export function useOrder(orderId: string | undefined) {
  return useQuery({
    queryKey: ['order', orderId],
    queryFn: () => {
      if (!orderId) throw new Error('No order ID');
      return api.getOrder(orderId);
    },
    enabled: !!orderId,
    refetchInterval: 2000,  // Poll every 2 seconds
  });
}
```

Alternative solutions:
- Use WebSockets for real-time updates
- Use Server-Sent Events (SSE)
- Manually invalidate query when user focuses window

## Test Strategy

1. Unit test: Mock timer, verify query refetches every 2s
2. Integration test: Update order status, wait 2s, verify UI updates
3. Manual test: Place order, simulate webhook, watch status change

## Context Required for Meta-Prompt

- TanStack Query polling patterns
- React Query configuration
- Real-time update alternatives
- Frontend/backend sync strategies
