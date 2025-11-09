import express from 'express';
import cors from 'cors';
import productsRouter from './routes/products.js';
import cartRouter from './routes/cart.js';
import ordersRouter from './routes/orders.js';
// BUG 1: Payment webhook handler exists but is not imported
// import paymentWebhook from './webhooks/payment.js';

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/products', productsRouter);
app.use('/api/cart', cartRouter);
app.use('/api/orders', ordersRouter);
// BUG 1: Webhook route is not registered with Express
// Orders will remain in 'processing' state indefinitely after successful payment
// app.use('/api/webhooks', paymentWebhook);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
