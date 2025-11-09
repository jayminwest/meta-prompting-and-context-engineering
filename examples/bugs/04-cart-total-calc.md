# Bug 4: Cart Total Calculation Excludes Last Item

## Summary

The cart total is calculated incorrectly when adding items. The displayed total is always missing the most recently added item's price.

## How to Reproduce

1. Add item A ($79.99) to cart
2. Observe total: $0.00 (should be $79.99)
3. Add item B ($49.99) to cart
4. Observe total: $79.99 (should be $129.98)
5. Refresh page
6. Observe total: $129.98 (correct after reload)

## Root Cause

The `addItem` function in `apps/frontend/src/store/cartStore.ts` calculates the total BEFORE the state update completes:

```typescript
addItem: (item) => {
  const items = get().items;
  const existingItem = items.find((i) => i.productId === item.productId);

  if (existingItem) {
    set({
      items: items.map((i) =>
        i.productId === item.productId
          ? { ...i, quantity: i.quantity + item.quantity }
          : i
      ),
    });
  } else {
    set({ items: [...items, item] });  // State update is async
  }

  // BUG: get().items still returns OLD state here
  const total = get().items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  set({ total });
}
```

The issue:
1. `set({ items: [...items, item] })` schedules state update
2. `get().items` returns stale state (doesn't include new item yet)
3. Total calculation excludes new item

## Affected Files

- `apps/frontend/src/store/cartStore.ts:28-44` - Incorrect state timing
- `apps/frontend/src/components/Cart.tsx:53` - Displays incorrect total
- `apps/frontend/src/store/cartStore.ts:46-55` - Similar issue in `updateItem`

## Fix

Use derived state instead of storing total separately:

```typescript
// Option 1: Calculate total as derived state
const total = useCartStore((state) =>
  state.items.reduce((sum, item) => sum + item.price * item.quantity, 0)
);
```

Or calculate total from the updated items array:

```typescript
addItem: (item) => {
  const items = get().items;
  const existingItem = items.find((i) => i.productId === item.productId);

  let updatedItems;
  if (existingItem) {
    updatedItems = items.map((i) =>
      i.productId === item.productId
        ? { ...i, quantity: i.quantity + item.quantity }
        : i
    );
  } else {
    updatedItems = [...items, item];
  }

  // Calculate total from updated items, not from state
  const total = updatedItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  set({ items: updatedItems, total });
}
```

## Test Strategy

1. Unit test: Add item, verify total includes it immediately
2. Integration test: Add multiple items, verify total after each addition
3. Edge case: Add same item twice, verify quantity and total

## Context Required for Meta-Prompt

- Zustand state update patterns
- React state batching behavior
- Derived state vs stored state trade-offs
- Array reduce patterns
