import { useCallback } from 'react';
import { useApi, useMutation } from './useApi';
import { cartService } from '../services/cartService';
import { orderService } from '../services/orderService';
import { 
  CartDto, 
  AddToCartRequest, 
  UpdateCartItemRequest,
  CreateOrderRequest,
  OrderDto
} from '../types/api';

// Cart data hooks
export const useCart = (options?: { immediate?: boolean }) => {
  return useApi<CartDto>(
    () => cartService.getCurrentCart(),
    {
      immediate: options?.immediate ?? true,
      onError: (error) => {
        console.error('Failed to fetch cart:', error);
      },
    }
  );
};

export const useCartSummary = (options?: { immediate?: boolean }) => {
  return useApi<{
    itemCount: number;
    subtotal: number;
    taxes: number;
    shipping: number;
    discounts: number;
    total: number;
  }>(
    () => cartService.getCartSummary(),
    {
      immediate: options?.immediate ?? false,
      onError: (error) => {
        console.error('Failed to fetch cart summary:', error);
      },
    }
  );
};

// Cart mutation hooks
export const useAddToCart = () => {
  return useMutation<CartDto>(
    async (request: AddToCartRequest) => {
      return await cartService.addItemToCart(request);
    },
    {
      onSuccess: (cart) => {
        console.log('Item added to cart successfully');
      },
      onError: (error) => {
        console.error('Failed to add item to cart:', error);
      },
    }
  );
};

export const useUpdateCartItem = () => {
  return useMutation<CartDto>(
    async ({ itemId, request }: { itemId: string; request: UpdateCartItemRequest }) => {
      return await cartService.updateCartItem(itemId, request);
    },
    {
      onSuccess: (cart) => {
        console.log('Cart item updated successfully');
      },
      onError: (error) => {
        console.error('Failed to update cart item:', error);
      },
    }
  );
};

export const useRemoveCartItem = () => {
  return useMutation<CartDto>(
    async (itemId: string) => {
      return await cartService.removeCartItem(itemId);
    },
    {
      onSuccess: (cart) => {
        console.log('Item removed from cart successfully');
      },
      onError: (error) => {
        console.error('Failed to remove cart item:', error);
      },
    }
  );
};

export const useClearCart = () => {
  return useMutation<void>(
    async () => {
      await cartService.clearCart();
    },
    {
      onSuccess: () => {
        console.log('Cart cleared successfully');
      },
      onError: (error) => {
        console.error('Failed to clear cart:', error);
      },
    }
  );
};

// Product-based cart operations
export const useAddProductToCart = () => {
  return useMutation<CartDto>(
    async ({ productId, quantity }: { productId: string; quantity?: number }) => {
      return await cartService.addProductToCart(productId, quantity || 1);
    },
    {
      onSuccess: (cart) => {
        console.log('Product added to cart successfully');
      },
      onError: (error) => {
        console.error('Failed to add product to cart:', error);
      },
    }
  );
};

export const useUpdateProductQuantity = () => {
  return useMutation<CartDto>(
    async ({ productId, quantity }: { productId: string; quantity: number }) => {
      return await cartService.updateProductQuantity(productId, quantity);
    },
    {
      onSuccess: (cart) => {
        console.log('Product quantity updated successfully');
      },
      onError: (error) => {
        console.error('Failed to update product quantity:', error);
      },
    }
  );
};

export const useRemoveProductFromCart = () => {
  return useMutation<CartDto>(
    async (productId: string) => {
      return await cartService.removeProductFromCart(productId);
    },
    {
      onSuccess: (cart) => {
        console.log('Product removed from cart successfully');
      },
      onError: (error) => {
        console.error('Failed to remove product from cart:', error);
      },
    }
  );
};

// Cart validation and pricing
export const useValidateCart = () => {
  return useMutation<{
    isValid: boolean;
    issues: string[];
    updatedCart?: CartDto;
  }>(
    async () => {
      return await cartService.validateCart();
    },
    {
      showErrorAlert: false,
      onError: (error) => {
        console.error('Cart validation failed:', error);
      },
    }
  );
};

export const useRecalculateCart = () => {
  return useMutation<CartDto>(
    async () => {
      return await cartService.recalculateCart();
    },
    {
      onSuccess: (cart) => {
        console.log('Cart recalculated successfully');
      },
      onError: (error) => {
        console.error('Failed to recalculate cart:', error);
      },
    }
  );
};

// Coupon management
export const useApplyCoupon = () => {
  return useMutation<CartDto>(
    async (couponCode: string) => {
      return await cartService.applyCoupon(couponCode);
    },
    {
      onSuccess: (cart) => {
        console.log('Coupon applied successfully');
      },
      onError: (error) => {
        console.error('Failed to apply coupon:', error);
      },
    }
  );
};

export const useRemoveCoupon = () => {
  return useMutation<CartDto>(
    async () => {
      return await cartService.removeCoupon();
    },
    {
      onSuccess: (cart) => {
        console.log('Coupon removed successfully');
      },
      onError: (error) => {
        console.error('Failed to remove coupon:', error);
      },
    }
  );
};

// Shipping calculation
export const useCalculateShipping = () => {
  return useMutation<{
    shippingOptions: Array<{
      id: string;
      name: string;
      price: number;
      estimatedDays: number;
    }>;
  }>(
    async (addressId: string) => {
      return await cartService.calculateShipping(addressId);
    },
    {
      onSuccess: (result) => {
        console.log('Shipping calculated successfully');
      },
      onError: (error) => {
        console.error('Failed to calculate shipping:', error);
      },
    }
  );
};

// Note: Guest cart merging is now handled automatically in the cart store
// when user authenticates, so no manual merge hook is needed

// Save for later functionality
export const useSaveForLater = () => {
  return useMutation<CartDto>(
    async (itemId: string) => {
      return await cartService.saveForLater(itemId);
    },
    {
      onSuccess: (cart) => {
        console.log('Item saved for later successfully');
      },
      onError: (error) => {
        console.error('Failed to save item for later:', error);
      },
    }
  );
};

export const useMoveToCart = () => {
  return useMutation<CartDto>(
    async (itemId: string) => {
      return await cartService.moveToCart(itemId);
    },
    {
      onSuccess: (cart) => {
        console.log('Item moved to cart successfully');
      },
      onError: (error) => {
        console.error('Failed to move item to cart:', error);
      },
    }
  );
};

export const useSavedItems = (options?: { immediate?: boolean }) => {
  return useApi<any[]>(
    () => cartService.getSavedItems(),
    {
      immediate: options?.immediate ?? false,
      onError: (error) => {
        console.error('Failed to fetch saved items:', error);
      },
    }
  );
};

// Checkout
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

// Combined cart actions hook for convenience
export const useCartActions = () => {
  const addToCart = useAddToCart();
  const updateQuantity = useUpdateProductQuantity();
  const removeFromCart = useRemoveProductFromCart();
  const clearCart = useClearCart();
  const applyCoupon = useApplyCoupon();
  const removeCoupon = useRemoveCoupon();
  const validateCart = useValidateCart();

  const addProduct = useCallback(async (productId: string, quantity: number = 1) => {
    return await addToCart.mutate({ productId, quantity });
  }, [addToCart]);

  const updateProductQuantity = useCallback(async (productId: string, quantity: number) => {
    return await updateQuantity.mutate({ productId, quantity });
  }, [updateQuantity]);

  const removeProduct = useCallback(async (productId: string) => {
    return await removeFromCart.mutate(productId);
  }, [removeFromCart]);

  const clearAllItems = useCallback(async () => {
    return await clearCart.mutate();
  }, [clearCart]);

  const applyDiscountCode = useCallback(async (couponCode: string) => {
    return await applyCoupon.mutate(couponCode);
  }, [applyCoupon]);

  const removeDiscountCode = useCallback(async () => {
    return await removeCoupon.mutate();
  }, [removeCoupon]);

  const validateCartItems = useCallback(async () => {
    return await validateCart.mutate();
  }, [validateCart]);

  return {
    addProduct,
    updateProductQuantity,
    removeProduct,
    clearAllItems,
    applyDiscountCode,
    removeDiscountCode,
    validateCartItems,
    addLoading: addToCart.loading,
    updateLoading: updateQuantity.loading,
    removeLoading: removeFromCart.loading,
    clearLoading: clearCart.loading,
    couponLoading: applyCoupon.loading || removeCoupon.loading,
    validateLoading: validateCart.loading,
    addError: addToCart.error,
    updateError: updateQuantity.error,
    removeError: removeFromCart.error,
    clearError: clearCart.error,
    couponError: applyCoupon.error || removeCoupon.error,
    validateError: validateCart.error,
  };
}; 