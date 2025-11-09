# API Routes Reference

Base URL: `http://localhost:3001/api`

## Products

### GET /products
List all products

**Response:**
```json
[
  {
    "id": 1,
    "name": "Wireless Keyboard",
    "price": 7999,
    "description": "Mechanical switches, RGB backlight",
    "stock": 50
  }
]
```

### GET /products/:id
Get single product

**Response:**
```json
{
  "id": 1,
  "name": "Wireless Keyboard",
  "price": 7999,
  "description": "Mechanical switches, RGB backlight",
  "stock": 50
}
```

## Cart

### POST /cart
Create a new cart

**Response:**
```json
{
  "id": "uuid-here",
  "items": [],
  "total": 0,
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

### GET /cart/:id
Get cart by ID

### POST /cart/:id/items
Add item to cart

**Request:**
```json
{
  "productId": 1,
  "quantity": 2
}
```

**Response:** Updated cart object

### PUT /cart/:id/items/:productId
Update item quantity

**Request:**
```json
{
  "quantity": 3
}
```

### DELETE /cart/:id/items/:productId
Remove item from cart

## Orders

### POST /orders
Create order from cart

**Request:**
```json
{
  "cartId": "uuid-here"
}
```

**Response:**
```json
{
  "id": "order-uuid",
  "cartId": "cart-uuid",
  "status": "processing",
  "total": 15998,
  "paymentIntentId": "pi_uuid",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

### GET /orders/:id
Get order status

## Webhooks

### POST /webhooks/payment
Payment webhook (simulated Stripe)

**Request:**
```json
{
  "eventType": "payment.succeeded",
  "paymentIntentId": "pi_uuid",
  "amount": 15998,
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

**Response:**
```json
{
  "received": true
}
```

**Note:** This endpoint is currently NOT registered in server.ts (intentional bug for demo).
