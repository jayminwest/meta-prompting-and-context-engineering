import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CartItem } from '../api/client';

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

// BUG 4: Cart Total Calculation Excludes Last Item
// The calculation happens before the last item is added due to async state update timing
export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      cartId: null,
      items: [],
      total: 0,

      setCartId: (id) => set({ cartId: id }),

      setCart: (items, total) => set({ items, total }),

      addItem: (item) => {
        const items = get().items;
        const existingItem = items.find((i) => i.productId === item.productId);

        if (existingItem) {
          set({
            items: items.map((i) =>
              i.productId === item.productId
                ? { ...i, quantity: i.quantity + item.quantity }
                : i
            ),
          });
        } else {
          set({ items: [...items, item] });
        }

        // BUG: This calculation runs before the state update completes
        // The reduce will not include the item we just added
        const total = get().items.reduce(
          (sum, item) => sum + item.price * item.quantity,
          0
        );
        set({ total });
      },

      updateItem: (productId, quantity) => {
        const items = get().items;
        set({
          items: items.map((i) =>
            i.productId === productId ? { ...i, quantity } : i
          ),
        });

        const total = get().items.reduce(
          (sum, item) => sum + item.price * item.quantity,
          0
        );
        set({ total });
      },

      removeItem: (productId) => {
        const items = get().items;
        set({ items: items.filter((i) => i.productId !== productId) });

        const total = get().items.reduce(
          (sum, item) => sum + item.price * item.quantity,
          0
        );
        set({ total });
      },

      clearCart: () => set({ cartId: null, items: [], total: 0 }),
    }),
    {
      name: 'cart-storage',
    }
  )
);
