import { ProductList } from '../components/ProductList';
import { Cart } from '../components/Cart';

export function HomePage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">E-Commerce Demo</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <h2 className="text-2xl font-semibold mb-4">Products</h2>
          <ProductList />
        </div>

        <div>
          <Cart />
        </div>
      </div>
    </div>
  );
}
