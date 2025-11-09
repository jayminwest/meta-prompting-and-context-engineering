# Bug 2: Cart Race Condition on Concurrent Updates

## Summary

When two items are added to the cart rapidly (< 100ms apart), only one item appears in the cart. The second update overwrites the first.

## How to Reproduce

1. Open browser DevTools
2. Run this script to add two items rapidly:
```javascript
Promise.all([
  fetch('/api/cart/YOUR_CART_ID/items', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ productId: 1, quantity: 1 })
  }),
  fetch('/api/cart/YOUR_CART_ID/items', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ productId: 2, quantity: 1 })
  })
])
```
3. Check cart - only one item is present

## Root Cause

The `addItemToCart` function in `apps/backend/src/services/cart.service.ts` performs read-modify-write without a transaction:

```typescript
export function addItemToCart(cartId: string, item: CartItem): Cart | null {
  const cart = getCart(cartId);  // READ
  // ... modify cart ...
  saveCart(cart);  // WRITE
  return cart;
}
```

Timeline:
- T=0ms: Request A reads cart (2 items)
- T=10ms: Request B reads cart (2 items)
- T=20ms: Request A writes cart (3 items)
- T=30ms: Request B writes cart (3 items, but different item)
- Result: Only 3 items instead of 4

## Affected Files

- `apps/backend/src/services/cart.service.ts:39-64` - Race condition in `addItemToCart`
- `apps/backend/src/db.ts` - SQLite connection (supports transactions)

## Fix

Wrap operations in a transaction:

```typescript
export function addItemToCart(cartId: string, item: CartItem): Cart | null {
  return db.transaction(() => {
    const cart = getCart(cartId);
    if (!cart) return null;

    // ... modify cart ...

    saveCart(cart);
    return cart;
  })();
}
```

Or use `BEGIN IMMEDIATE` transaction for SQLite:

```typescript
db.exec('BEGIN IMMEDIATE');
try {
  const cart = getCart(cartId);
  // ... operations ...
  saveCart(cart);
  db.exec('COMMIT');
  return cart;
} catch (err) {
  db.exec('ROLLBACK');
  throw err;
}
```

## Test Strategy

1. Unit test: Simulate concurrent requests with Promise.all
2. Load test: Use artillery to send 100 concurrent cart updates
3. Verify: All items are present in final cart state

## Context Required for Meta-Prompt

- SQLite transaction patterns
- better-sqlite3 API
- Cart service architecture
- Concurrency patterns in Express
