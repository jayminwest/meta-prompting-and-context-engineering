import { useNavigate } from 'react-router-dom';
import { useCart, useUpdateCartItem, useRemoveFromCart } from '../hooks/useCart';
import { useCreateOrder } from '../hooks/useOrder';
import { useCartStore } from '../store/cartStore';
import { useProducts } from '../hooks/useProducts';

export function Cart() {
  const navigate = useNavigate();
  const { data: cart } = useCart();
  const { data: products } = useProducts();
  const cartId = useCartStore((state) => state.cartId);
  const updateItem = useUpdateCartItem();
  const removeItem = useRemoveFromCart();
  const createOrder = useCreateOrder();

  const handleCheckout = async () => {
    if (!cartId) return;

    try {
      const order = await createOrder.mutateAsync(cartId);
      navigate(`/order/${order.id}`);
    } catch (error) {
      console.error('Failed to create order:', error);
    }
  };

  if (!cart || cart.items.length === 0) {
    return (
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-bold mb-4">Shopping Cart</h2>
        <p className="text-gray-600">Your cart is empty</p>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h2 className="text-xl font-bold mb-4">Shopping Cart</h2>
      <div className="space-y-4">
        {cart.items.map((item) => {
          const product = products?.find((p) => p.id === item.productId);
          return (
            <div key={item.productId} className="flex items-center justify-between border-b pb-4">
              <div className="flex-1">
                <h3 className="font-semibold">{product?.name || `Product ${item.productId}`}</h3>
                <p className="text-gray-600">${(item.price / 100).toFixed(2)} each</p>
              </div>
              <div className="flex items-center gap-4">
                <input
                  type="number"
                  min="1"
                  value={item.quantity}
                  onChange={(e) => updateItem.mutate({ productId: item.productId, quantity: parseInt(e.target.value) })}
                  className="w-16 border rounded px-2 py-1"
                />
                <p className="font-semibold w-20 text-right">
                  ${((item.price * item.quantity) / 100).toFixed(2)}
                </p>
                <button
                  onClick={() => removeItem.mutate(item.productId)}
                  className="text-red-600 hover:text-red-800"
                >
                  Remove
                </button>
              </div>
            </div>
          );
        })}
      </div>
      <div className="mt-6 pt-4 border-t">
        <div className="flex justify-between items-center mb-4">
          <span className="text-xl font-bold">Total:</span>
          <span className="text-2xl font-bold">${(cart.total / 100).toFixed(2)}</span>
        </div>
        <button
          onClick={handleCheckout}
          disabled={createOrder.isPending}
          className="w-full bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 disabled:bg-gray-300"
        >
          {createOrder.isPending ? 'Processing...' : 'Checkout'}
        </button>
      </div>
    </div>
  );
}
