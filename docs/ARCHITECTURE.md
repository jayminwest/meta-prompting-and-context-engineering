# Architecture Deep Dive

Detailed system design for the Claude Meta-Prompting Demo.

## Overview

A full-stack TypeScript application demonstrating AI-assisted debugging through intentional bugs.

**Design Goals**:
- Simple enough to understand quickly
- Complex enough to require multi-file analysis
- Realistic patterns (REST API, state management, webhooks)

## Technology Choices

### Why These Technologies?

| Technology | Reason |
|-----------|--------|
| **Vite** | Fast dev server, minimal config |
| **React 18** | Most popular frontend framework |
| **Zustand** | Simpler than Redux, shows state patterns |
| **TanStack Query** | Modern data fetching, caching |
| **Express** | Minimal, familiar backend |
| **SQLite** | Zero-config database, file-based |
| **TypeScript** | Type safety, better for AI analysis |
| **pnpm** | Fast, efficient monorepo |

### What We Avoided

- ❌ **Next.js**: Too much abstraction
- ❌ **GraphQL**: Overkill for demo
- ❌ **ORMs**: Raw SQL is clearer
- ❌ **Authentication**: Not needed for bug demo
- ❌ **Styling Libraries**: Tailwind is enough

## Frontend Architecture

### Component Hierarchy

```
App
├── BrowserRouter
│   ├── HomePage
│   │   ├── ProductList
│   │   └── Cart
│   ├── CheckoutPage
│   │   └── Cart
│   └── OrderStatus (route: /order/:id)
```

### State Management Strategy

**Two-Layer State**:

1. **Server State** (TanStack Query)
   - Products (cached for 1 minute)
   - Cart data (invalidated on mutations)
   - Order status (should poll every 2s - BUG!)

2. **Client State** (Zustand)
   - Cart ID (persisted to localStorage)
   - Optimistic cart updates
   - Total calculation (BUG!)

### Data Flow Example: Adding to Cart

```
User clicks "Add to Cart"
  ↓
useAddToCart mutation triggered
  ↓
Optimistic update: cartStore.addItem()
  ↓
API call: POST /api/cart/:id/items
  ↓
Backend: cart.service.ts (RACE CONDITION BUG)
  ↓
Response: Updated cart object
  ↓
React Query invalidates ['cart', cartId]
  ↓
UI re-renders with fresh data
```

### Query Configuration

```typescript
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60,  // 1 minute
      refetchOnWindowFocus: false,
    },
  },
});
```

**Why these settings?**
- `staleTime: 60s` - Products don't change often
- `refetchOnWindowFocus: false` - Reduce unnecessary requests
- Order status SHOULD override with `refetchInterval` (BUG #3)

## Backend Architecture

### Layered Design

```
Routes (HTTP)
  ↓
Services (Business Logic)
  ↓
Database (SQLite)
```

### Route Organization

| Route | Purpose | Service |
|-------|---------|---------|
| `/api/products` | Product catalog | Direct DB access |
| `/api/cart` | Cart CRUD | `cart.service.ts` |
| `/api/orders` | Order creation | `order.service.ts` |
| `/api/webhooks/payment` | Payment events | `order.service.ts` |

### Database Schema

**SQLite with JSON columns** for flexibility:

```sql
-- products: Standard relational table
CREATE TABLE products (
  id INTEGER PRIMARY KEY,
  name TEXT,
  price INTEGER,  -- Cents to avoid float issues
  description TEXT,
  stock INTEGER
);

-- carts: Uses JSON for items array
CREATE TABLE carts (
  id TEXT PRIMARY KEY,
  items TEXT,  -- JSON: [{ productId, quantity, price }]
  total INTEGER,
  created_at TEXT,
  updated_at TEXT
);

-- orders: Links to cart, tracks payment
CREATE TABLE orders (
  id TEXT PRIMARY KEY,
  cart_id TEXT,
  status TEXT,  -- pending|processing|completed|failed
  total INTEGER,
  payment_intent_id TEXT,  -- For webhook matching
  created_at TEXT,
  updated_at TEXT
);
```

**Why JSON column for cart items?**
- Simpler than join table
- Cart is ephemeral (no complex queries needed)
- Easier to understand for demo purposes

### Service Patterns

**cart.service.ts**:

```typescript
// Read-Modify-Write pattern
export function addItemToCart(cartId, item) {
  const cart = getCart(cartId);     // READ
  cart.items.push(item);            // MODIFY
  saveCart(cart);                   // WRITE (BUG: Not atomic!)
  return cart;
}
```

**order.service.ts**:

```typescript
// Create order from cart
export function createOrder(cartId) {
  const cart = getCart(cartId);
  const order = {
    id: uuid(),
    cartId,
    status: 'processing',
    paymentIntentId: `pi_${uuid()}`,
    total: cart.total
  };
  insertOrder(order);
  return order;
}
```

## Webhook Flow

Simulates Stripe-style payment webhooks:

```
[Simulated Payment Provider]
  ↓
POST /api/webhooks/payment
{
  "eventType": "payment.succeeded",
  "paymentIntentId": "pi_...",
  "amount": 10000
}
  ↓
[BUG: Route not registered!]
  ↓
404 Not Found
  ↓
Order stays in "processing" forever
```

**After fix**:

```
Webhook arrives
  ↓
payment.ts validates payload (Zod)
  ↓
order.service.updateOrderStatus()
  ↓
UPDATE orders SET status='completed'
  ↓
Frontend polling (every 2s) picks up change
  ↓
UI updates to show "completed"
```

## Intentional Bug Design

Each bug demonstrates a different debugging skill:

### Bug 1: Missing Route Registration
**Demonstrates**: Tracing request flow, checking route setup

### Bug 2: Race Condition
**Demonstrates**: Understanding concurrency, transactions

### Bug 3: Missing Polling
**Demonstrates**: Frontend/backend sync, real-time updates

### Bug 4: State Timing Issue
**Demonstrates**: React state batching, derived state

## Meta-Prompt Context

The `/issue` command needs context from:

1. **File Structure**: Where to search
2. **Data Flow**: How components connect
3. **Common Patterns**: How similar bugs are fixed
4. **Architecture Docs**: System design

This is provided via:
- `.claude/commands/docs/` - Reference docs
- `examples/bugs/` - Similar issues
- Well-structured code with comments
- Consistent naming conventions

## Performance Considerations

**Not optimized for production** - this is a demo. Missing:

- ❌ Connection pooling
- ❌ Request rate limiting
- ❌ Caching layers
- ❌ Error boundaries
- ❌ Loading skeletons
- ❌ Retry logic

**Good enough for demo** because:
- ✅ Single-user local development
- ✅ Small dataset (4 products)
- ✅ No network latency
- ✅ Focus is on bug patterns, not performance

## Security Considerations

**Intentionally insecure** for demo simplicity:

- ❌ No authentication
- ❌ No webhook signature verification
- ❌ No input sanitization (beyond Zod)
- ❌ No CORS restrictions
- ❌ No rate limiting

**Production would need**:
- ✅ JWT or session auth
- ✅ Stripe webhook signature validation
- ✅ SQL injection prevention (better-sqlite3 helps)
- ✅ CSRF tokens
- ✅ Rate limiting (express-rate-limit)

## Scalability

**Single-file SQLite** doesn't scale. Production would use:

- PostgreSQL or MySQL for relational data
- Redis for cart sessions
- Message queue (RabbitMQ/SQS) for webhooks
- Load balancer for multiple backend instances

**But for a demo**:
- ✅ Zero configuration
- ✅ Portable (commit the .db file)
- ✅ Easy to inspect (sqlite3 CLI)
- ✅ Fast enough for local dev

## Extensibility

Easy to add:

- ✅ New products (just seed data)
- ✅ New bugs (modify service code)
- ✅ New meta-prompts (add to `.claude/commands/`)
- ✅ New automation scripts (add to `automation/`)

Hard to add (would require refactoring):

- ❌ User accounts
- ❌ Multiple carts per user
- ❌ Order history
- ❌ Inventory management

**Design philosophy**: Keep it simple, focus on the meta-prompting demo.

## Summary

| Aspect | Choice | Reason |
|--------|--------|--------|
| **Monorepo** | pnpm workspaces | Share types, simple setup |
| **Database** | SQLite + JSON | Zero config, portable |
| **State** | Zustand + React Query | Clear separation of concerns |
| **API** | REST | Simple, familiar, easy to debug |
| **Bugs** | Intentional, documented | Teaching tool for AI agents |

The architecture is **deliberately minimal** to keep the focus on meta-prompting patterns, not production engineering.
