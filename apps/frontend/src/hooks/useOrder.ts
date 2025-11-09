import { useMutation, useQuery } from '@tanstack/react-query';
import { api } from '../api/client';

export function useOrder(orderId: string | undefined) {
  // BUG 3: Order Status Not Updating in Frontend
  // Component uses useQuery with default staleTime, so it doesn't poll for updates
  // Status appears frozen even when webhook updates the backend
  return useQuery({
    queryKey: ['order', orderId],
    queryFn: () => {
      if (!orderId) throw new Error('No order ID');
      return api.getOrder(orderId);
    },
    enabled: !!orderId,
    // FIX WOULD BE: refetchInterval: 2000,
  });
}

export function useCreateOrder() {
  return useMutation({
    mutationFn: api.createOrder,
  });
}
