import { useCallback } from 'react';
import { useApi, useMutation, usePaginatedApi } from './useApi';
import { orderService } from '../services/orderService';
import { 
  OrderDto, 
  CreateOrderRequest, 
  OrderSearchRequest, 
  OrderSearchResponse 
} from '../types/api';

// Order data hooks
export const useOrder = (orderId: string, options?: { immediate?: boolean }) => {
  return useApi<OrderDto>(
    () => orderService.getOrderById(orderId),
    {
      immediate: options?.immediate ?? true,
      onError: (error) => {
        console.error('Failed to fetch order:', error);
      },
    }
  );
};

export const useUserOrders = (searchRequest?: OrderSearchRequest, pageSize: number = 20, options?: { immediate?: boolean }) => {
  return usePaginatedApi<OrderDto>(
    async (page, size) => {
      const response = await orderService.getUserOrders({ 
        ...searchRequest, 
        page, 
        size 
      });
      return {
        content: response.orders,
        totalPages: response.totalPages,
        currentPage: response.currentPage,
        hasNext: response.hasNext,
      };
    },
    pageSize,
    {
      immediate: options?.immediate ?? true,
      onError: (error) => {
        console.error('Failed to fetch user orders:', error);
      },
    }
  );
};

export const useOrderHistory = (pageSize: number = 20, options?: { immediate?: boolean }) => {
  return usePaginatedApi<OrderDto>(
    async (page, size) => {
      const response = await orderService.getOrderHistory({ page, size });
      return {
        content: response.orders,
        totalPages: response.totalPages,
        currentPage: response.currentPage,
        hasNext: response.hasNext,
      };
    },
    pageSize,
    {
      immediate: options?.immediate ?? true,
      onError: (error) => {
        console.error('Failed to fetch order history:', error);
      },
    }
  );
};

export const useOrderSummary = (options?: { immediate?: boolean }) => {
  return useApi<{
    totalOrders: number;
    totalSpent: number;
    averageOrderValue: number;
    ordersByStatus: Record<string, number>;
    recentOrders: OrderDto[];
  }>(
    () => orderService.getOrderSummary(),
    {
      immediate: options?.immediate ?? true,
      onError: (error) => {
        console.error('Failed to fetch order summary:', error);
      },
    }
  );
};

// Order mutation hooks
export const useCreateOrder = () => {
  return useMutation<OrderDto>(
    async (request: CreateOrderRequest) => {
      return await orderService.createOrder(request);
    },
    {
      onSuccess: (order) => {
        console.log('Order created successfully:', order.orderNumber);
      },
      onError: (error) => {
        console.error('Failed to create order:', error);
      },
    }
  );
};

export const useCancelOrder = () => {
  return useMutation<OrderDto>(
    async ({ orderId, reason }: { orderId: string; reason?: string }) => {
      return await orderService.cancelOrder(orderId, reason);
    },
    {
      onSuccess: (order) => {
        console.log('Order cancelled successfully:', order.orderNumber);
      },
      onError: (error) => {
        console.error('Failed to cancel order:', error);
      },
    }
  );
};

export const useUpdateOrderNotes = () => {
  return useMutation<OrderDto>(
    async ({ orderId, notes }: { orderId: string; notes: string }) => {
      return await orderService.updateOrderNotes(orderId, notes);
    },
    {
      onSuccess: (order) => {
        console.log('Order notes updated successfully');
      },
      onError: (error) => {
        console.error('Failed to update order notes:', error);
      },
    }
  );
};

export const useUpdateShippingAddress = () => {
  return useMutation<OrderDto>(
    async ({ orderId, addressId }: { orderId: string; addressId: string }) => {
      return await orderService.updateShippingAddress(orderId, addressId);
    },
    {
      onSuccess: (order) => {
        console.log('Shipping address updated successfully');
      },
      onError: (error) => {
        console.error('Failed to update shipping address:', error);
      },
    }
  );
};

// Order tracking hooks
export const useOrderTracking = (orderId: string, options?: { immediate?: boolean }) => {
  return useApi<{
    trackingNumber?: string;
    carrier?: string;
    trackingUrl?: string;
    status: string;
    estimatedDelivery?: string;
    actualDelivery?: string;
    trackingEvents: Array<{
      timestamp: string;
      location: string;
      description: string;
    }>;
  }>(
    () => orderService.trackOrder(orderId),
    {
      immediate: options?.immediate ?? false,
      onError: (error) => {
        console.error('Failed to fetch order tracking:', error);
      },
    }
  );
};

export const useTrackByTrackingNumber = () => {
  return useMutation<{
    order: OrderDto;
    trackingInfo: {
      trackingNumber: string;
      carrier: string;
      trackingUrl?: string;
      status: string;
      estimatedDelivery?: string;
      actualDelivery?: string;
      trackingEvents: Array<{
        timestamp: string;
        location: string;
        description: string;
      }>;
    };
  }>(
    async (trackingNumber: string) => {
      return await orderService.trackOrderByTrackingNumber(trackingNumber);
    },
    {
      onSuccess: (result) => {
        console.log('Order tracking retrieved successfully');
      },
      onError: (error) => {
        console.error('Failed to track order by tracking number:', error);
      },
    }
  );
};

export const useOrderStatus = (orderId: string, options?: { immediate?: boolean }) => {
  return useApi<{
    status: string;
    statusHistory: Array<{
      status: string;
      timestamp: string;
      notes?: string;
    }>;
  }>(
    () => orderService.getOrderStatus(orderId),
    {
      immediate: options?.immediate ?? false,
      onError: (error) => {
        console.error('Failed to fetch order status:', error);
      },
    }
  );
};

// Invoice hooks
export const useOrderInvoice = (orderId: string, options?: { immediate?: boolean }) => {
  return useApi<{
    invoiceNumber: string;
    invoiceDate: string;
    dueDate: string;
    items: Array<{
      description: string;
      quantity: number;
      unitPrice: number;
      total: number;
    }>;
    subtotal: number;
    taxes: number;
    shipping: number;
    total: number;
  }>(
    () => orderService.getOrderInvoice(orderId),
    {
      immediate: options?.immediate ?? false,
      onError: (error) => {
        console.error('Failed to fetch order invoice:', error);
      },
    }
  );
};

export const useDownloadInvoice = () => {
  return useMutation<Blob>(
    async (orderId: string) => {
      return await orderService.downloadInvoice(orderId);
    },
    {
      onSuccess: () => {
        console.log('Invoice downloaded successfully');
      },
      onError: (error) => {
        console.error('Failed to download invoice:', error);
      },
    }
  );
};

// Returns and refunds
export const useRequestReturn = () => {
  return useMutation<{
    returnId: string;
    returnNumber: string;
    status: string;
    refundAmount: number;
  }>(
    async ({ 
      orderId, 
      items, 
      reason 
    }: { 
      orderId: string; 
      items: Array<{
        orderItemId: string;
        quantity: number;
        reason: string;
      }>; 
      reason: string;
    }) => {
      return await orderService.requestReturn(orderId, items, reason);
    },
    {
      onSuccess: (result) => {
        console.log('Return requested successfully:', result.returnNumber);
      },
      onError: (error) => {
        console.error('Failed to request return:', error);
      },
    }
  );
};

export const useReturnStatus = (returnId: string, options?: { immediate?: boolean }) => {
  return useApi<{
    returnId: string;
    returnNumber: string;
    status: string;
    refundAmount: number;
    refundStatus: string;
    createdAt: string;
    updatedAt: string;
  }>(
    () => orderService.getReturnStatus(returnId),
    {
      immediate: options?.immediate ?? false,
      onError: (error) => {
        console.error('Failed to fetch return status:', error);
      },
    }
  );
};

// Reorder functionality
export const useReorder = () => {
  return useMutation<{
    cartId: string;
    message: string;
    unavailableItems: Array<{
      productId: string;
      productName: string;
      reason: string;
    }>;
  }>(
    async (orderId: string) => {
      return await orderService.reorder(orderId);
    },
    {
      onSuccess: (result) => {
        console.log('Reorder successful');
        if (result.unavailableItems.length > 0) {
          console.warn('Some items are no longer available:', result.unavailableItems);
        }
      },
      onError: (error) => {
        console.error('Failed to reorder:', error);
      },
    }
  );
};

// Order verification
export const useVerifyOrder = () => {
  return useMutation<OrderDto>(
    async ({ orderId, verificationCode }: { orderId: string; verificationCode: string }) => {
      return await orderService.verifyOrder(orderId, verificationCode);
    },
    {
      onSuccess: (order) => {
        console.log('Order verified successfully:', order.orderNumber);
      },
      onError: (error) => {
        console.error('Failed to verify order:', error);
      },
    }
  );
};

// Request order update
export const useRequestOrderUpdate = () => {
  return useMutation<void>(
    async (orderId: string) => {
      await orderService.requestOrderUpdate(orderId);
    },
    {
      onSuccess: () => {
        console.log('Order update requested successfully');
      },
      onError: (error) => {
        console.error('Failed to request order update:', error);
      },
    }
  );
};

// Combined order actions hook for convenience
export const useOrderActions = () => {
  const createOrder = useCreateOrder();
  const cancelOrder = useCancelOrder();
  const requestReturn = useRequestReturn();
  const reorder = useReorder();
  const verifyOrder = useVerifyOrder();
  const trackByTrackingNumber = useTrackByTrackingNumber();

  const placeOrder = useCallback(async (request: CreateOrderRequest) => {
    return await createOrder.mutate(request);
  }, [createOrder]);

  const cancelOrderById = useCallback(async (orderId: string, reason?: string) => {
    return await cancelOrder.mutate({ orderId, reason });
  }, [cancelOrder]);

  const requestOrderReturn = useCallback(async (
    orderId: string,
    items: Array<{
      orderItemId: string;
      quantity: number;
      reason: string;
    }>,
    reason: string
  ) => {
    return await requestReturn.mutate({ orderId, items, reason });
  }, [requestReturn]);

  const reorderById = useCallback(async (orderId: string) => {
    return await reorder.mutate(orderId);
  }, [reorder]);

  const verifyOrderById = useCallback(async (orderId: string, verificationCode: string) => {
    return await verifyOrder.mutate({ orderId, verificationCode });
  }, [verifyOrder]);

  const trackOrderByNumber = useCallback(async (trackingNumber: string) => {
    return await trackByTrackingNumber.mutate(trackingNumber);
  }, [trackByTrackingNumber]);

  return {
    placeOrder,
    cancelOrderById,
    requestOrderReturn,
    reorderById,
    verifyOrderById,
    trackOrderByNumber,
    createLoading: createOrder.loading,
    cancelLoading: cancelOrder.loading,
    returnLoading: requestReturn.loading,
    reorderLoading: reorder.loading,
    verifyLoading: verifyOrder.loading,
    trackLoading: trackByTrackingNumber.loading,
    createError: createOrder.error,
    cancelError: cancelOrder.error,
    returnError: requestReturn.error,
    reorderError: reorder.error,
    verifyError: verifyOrder.error,
    trackError: trackByTrackingNumber.error,
  };
}; 