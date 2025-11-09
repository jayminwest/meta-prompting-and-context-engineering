import { useNavigate } from 'react-router-dom';
import { Cart } from '../components/Cart';

export function CheckoutPage() {
  const navigate = useNavigate();

  return (
    <div className="container mx-auto px-4 py-8">
      <button
        onClick={() => navigate('/')}
        className="mb-4 text-blue-600 hover:text-blue-800"
      >
        ← Back to Shopping
      </button>

      <h1 className="text-3xl font-bold mb-8">Checkout</h1>

      <div className="max-w-2xl mx-auto">
        <Cart />
      </div>
    </div>
  );
}
