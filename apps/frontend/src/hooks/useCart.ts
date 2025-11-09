import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../api/client';
import { useCartStore } from '../store/cartStore';

export function useCart() {
  const cartId = useCartStore((state) => state.cartId);
  const setCart = useCartStore((state) => state.setCart);

  return useQuery({
    queryKey: ['cart', cartId],
    queryFn: async () => {
      if (!cartId) return null;
      const cart = await api.getCart(cartId);
      setCart(cart.items, cart.total);
      return cart;
    },
    enabled: !!cartId,
  });
}

export function useCreateCart() {
  const setCartId = useCartStore((state) => state.setCartId);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: api.createCart,
    onSuccess: (cart) => {
      setCartId(cart.id);
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
  });
}

export function useAddToCart() {
  const cartId = useCartStore((state) => state.cartId);
  const addItem = useCartStore((state) => state.addItem);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ productId, quantity, price }: { productId: number; quantity: number; price: number }) => {
      if (!cartId) throw new Error('No cart');
      return api.addToCart(cartId, productId, quantity);
    },
    onSuccess: (cart) => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
  });
}

export function useUpdateCartItem() {
  const cartId = useCartStore((state) => state.cartId);
  const updateItem = useCartStore((state) => state.updateItem);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ productId, quantity }: { productId: number; quantity: number }) => {
      if (!cartId) throw new Error('No cart');
      return api.updateCartItem(cartId, productId, quantity);
    },
    onSuccess: (cart) => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
  });
}

export function useRemoveFromCart() {
  const cartId = useCartStore((state) => state.cartId);
  const removeItem = useCartStore((state) => state.removeItem);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (productId: number) => {
      if (!cartId) throw new Error('No cart');
      return api.removeFromCart(cartId, productId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
  });
}
