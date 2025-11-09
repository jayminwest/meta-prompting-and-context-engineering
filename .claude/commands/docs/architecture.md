# Application Architecture

## Overview

Dead simple e-commerce demo: products → cart → order → payment webhook.

## Stack

- **Frontend**: Vite + React + TypeScript + Zustand + TanStack Query
- **Backend**: Express + TypeScript + SQLite
- **Data flow**: REST API, no WebSockets (polling for real-time updates)

## Request Flow

1. User adds product to cart
   - Frontend: `cartStore.addItem()` → POST `/api/cart/:id/items`
   - Backend: `cart.service.ts` updates SQLite, returns updated cart
   - Frontend: React Query invalidates, Zustand updates

2. User places order
   - Frontend: POST `/api/orders` with cartId
   - Backend: Creates order in "processing" state, returns orderId
   - Frontend: Redirects to `/order/:id`

3. Payment webhook arrives (simulated)
   - External service: POST `/api/webhooks/payment`
   - Backend: Updates order status to "completed" or "failed"
   - Frontend: Polling picks up status change

## State Management

**Frontend (Zustand)**
- `cartStore`: In-memory cart state (synced with backend)
- Persisted to localStorage
- Single source of truth for cart UI

**Backend (SQLite)**
- `products` table
- `carts` table (JSON column for items array)
- `orders` table

## Common Patterns

- **API calls**: Wrapped in TanStack Query hooks (`useProducts`, `useCart`, `useOrder`)
- **Error handling**: Try/catch in services, return `{ success, data?, error? }`
- **Validation**: Zod schemas on backend routes

## Known Issues (Intentional Bugs)

See `examples/bugs/` for details on planted bugs designed for meta-prompt demonstration.
