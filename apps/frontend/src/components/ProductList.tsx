import { useProducts } from '../hooks/useProducts';
import { useAddToCart, useCreateCart } from '../hooks/useCart';
import { useCartStore } from '../store/cartStore';

export function ProductList() {
  const { data: products, isLoading } = useProducts();
  const cartId = useCartStore((state) => state.cartId);
  const createCart = useCreateCart();
  const addToCart = useAddToCart();

  const handleAddToCart = async (productId: number, price: number) => {
    if (!cartId) {
      await createCart.mutateAsync();
    }
    await addToCart.mutateAsync({ productId, quantity: 1, price });
  };

  if (isLoading) {
    return <div className="text-center py-8">Loading products...</div>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {products?.map((product) => (
        <div key={product.id} className="border rounded-lg p-4 shadow-sm">
          <h3 className="font-semibold text-lg mb-2">{product.name}</h3>
          <p className="text-gray-600 text-sm mb-2">{product.description}</p>
          <p className="text-xl font-bold mb-2">${(product.price / 100).toFixed(2)}</p>
          <p className="text-sm text-gray-500 mb-4">Stock: {product.stock}</p>
          <button
            onClick={() => handleAddToCart(product.id, product.price)}
            disabled={product.stock === 0 || addToCart.isPending}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            {addToCart.isPending ? 'Adding...' : 'Add to Cart'}
          </button>
        </div>
      ))}
    </div>
  );
}
