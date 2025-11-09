# State Management Patterns

## Zustand Store

The application uses Zustand for client-side state management, specifically for the shopping cart.

### Cart Store (`src/store/cartStore.ts`)

```typescript
interface CartStore {
  cartId: string | null;
  items: CartItem[];
  total: number;
  setCartId: (id: string) => void;
  setCart: (items: CartItem[], total: number) => void;
  addItem: (item: CartItem) => void;
  updateItem: (productId: number, quantity: number) => void;
  removeItem: (productId: number) => void;
  clearCart: () => void;
}
```

### Key Features

1. **Persistence**: Cart state is persisted to localStorage using Zustand's `persist` middleware
2. **Sync with Backend**: Cart operations trigger API calls, and responses update the store
3. **Optimistic Updates**: Store updates immediately, then syncs with backend

### Common Patterns

**Adding an item:**
```typescript
const addToCart = useAddToCart();
const addItem = useCartStore((state) => state.addItem);

// Optimistic update
addItem({ productId, quantity, price });

// Sync with backend
await addToCart.mutateAsync({ productId, quantity, price });
```

**Reading cart state:**
```typescript
const cartId = useCartStore((state) => state.cartId);
const items = useCartStore((state) => state.items);
const total = useCartStore((state) => state.total);
```

## TanStack Query

Used for server state management and caching.

### Configuration
- Default `staleTime`: 1 minute
- `refetchOnWindowFocus`: disabled
- Automatic cache invalidation on mutations

### Query Keys
- `['products']` - All products
- `['product', id]` - Single product
- `['cart', cartId]` - Cart data
- `['order', orderId]` - Order status

### Mutations
All mutations automatically invalidate related queries to keep UI in sync.
