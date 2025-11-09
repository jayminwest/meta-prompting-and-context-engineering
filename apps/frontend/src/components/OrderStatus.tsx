import { useParams } from 'react-router-dom';
import { useOrder } from '../hooks/useOrder';

export function OrderStatus() {
  const { orderId } = useParams<{ orderId: string }>();
  const { data: order, isLoading } = useOrder(orderId);

  if (isLoading) {
    return <div className="text-center py-8">Loading order...</div>;
  }

  if (!order) {
    return <div className="text-center py-8">Order not found</div>;
  }

  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-800',
    processing: 'bg-blue-100 text-blue-800',
    completed: 'bg-green-100 text-green-800',
    failed: 'bg-red-100 text-red-800',
  };

  const statusMessages = {
    pending: 'Your order is pending...',
    processing: 'Processing your payment...',
    completed: 'Order completed successfully!',
    failed: 'Payment failed. Please try again.',
  };

  return (
    <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-6">Order Status</h2>

      <div className="space-y-4">
        <div>
          <p className="text-gray-600">Order ID</p>
          <p className="font-mono text-sm">{order.id}</p>
        </div>

        <div>
          <p className="text-gray-600">Status</p>
          <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${statusColors[order.status]}`}>
            {order.status.toUpperCase()}
          </span>
        </div>

        <div>
          <p className="text-gray-600">Total</p>
          <p className="text-2xl font-bold">${(order.total / 100).toFixed(2)}</p>
        </div>

        <div className="pt-4 border-t">
          <p className="text-lg">{statusMessages[order.status]}</p>
        </div>

        {order.status === 'processing' && (
          <div className="bg-blue-50 p-4 rounded">
            <p className="text-sm text-blue-800">
              We're processing your payment. This page will update automatically when the payment is complete.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
