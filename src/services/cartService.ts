import { api } from '../utils/apiClient';
import { 
  CartDto, 
  CartItemDto, 
  AddToCartRequest, 
  UpdateCartItemRequest,
  ApiResponse
} from '../types/api';

export const cartService = {
  // Cart management
  getCart: async (): Promise<CartDto> => {
    const response = await api.get<CartDto>('/cart');
    return response;
  },

  // Alias for getCart to match hook expectations
  getCurrentCart: async (): Promise<CartDto> => {
    const response = await api.get<CartDto>('/cart');
    return response;
  },

  clearCart: async (): Promise<void> => {
    await api.delete('/cart');
  },

  // Cart items management
  addToCart: async (item: AddToCartRequest): Promise<CartDto> => {
    const response = await api.post<CartDto>('/cart/items', item);
    return response;
  },

  // Alias for addToCart to match hook expectations
  addItemToCart: async (item: AddToCartRequest): Promise<CartDto> => {
    const response = await api.post<CartDto>('/cart/items', item);
    return response;
  },

  updateCartItem: async (itemId: string, update: UpdateCartItemRequest): Promise<CartDto> => {
    const response = await api.put<CartDto>(`/cart/items/${itemId}`, update);
    return response;
  },

  removeFromCart: async (itemId: string): Promise<CartDto> => {
    const response = await api.delete<CartDto>(`/cart/items/${itemId}`);
    return response;
  },

  // Alias for removeFromCart to match hook expectations
  removeCartItem: async (itemId: string): Promise<CartDto> => {
    const response = await api.delete<CartDto>(`/cart/items/${itemId}`);
    return response;
  },

  // Alternative endpoints for product-based operations
  quickAddToCart: async (productId: string, quantity: number = 1): Promise<CartDto> => {
    return cartService.addToCart({ productId, quantity });
  },

  // Alias for quickAddToCart to match hook expectations
  addProductToCart: async (productId: string, quantity: number = 1): Promise<CartDto> => {
    return cartService.addToCart({ productId, quantity });
  },

  updateProductQuantity: async (productId: string, quantity: number): Promise<CartDto> => {
    // First get the cart to find the item ID
    const cart = await cartService.getCart();
    const item = cart.items.find(item => item.productId === productId);
    
    if (!item) {
      throw new Error('Product not found in cart');
    }
    
    return await cartService.updateCartItem(item.id, { quantity });
  },

  removeProductFromCart: async (productId: string): Promise<CartDto> => {
    // First get the cart to find the item ID
    const cart = await cartService.getCart();
    const item = cart.items.find(item => item.productId === productId);
    
    if (!item) {
      throw new Error('Product not found in cart');
    }
    
    return await cartService.removeFromCart(item.id);
  },

  // Cart validation and pricing
  validateCart: async (): Promise<{
    isValid: boolean;
    issues: string[];
    updatedCart?: CartDto;
  }> => {
    const response = await api.post<{
      valid: boolean;
      errors?: { itemId: string; message: string }[];
      updatedCart?: CartDto;
    }>('/cart/validate');
    
    // Transform the response to match the hook expectations
    return {
      isValid: response.valid,
      issues: response.errors?.map(error => error.message) || [],
      updatedCart: response.updatedCart,
    };
  },

  recalculateCart: async (): Promise<CartDto> => {
    const response = await api.post<CartDto>('/cart/recalculate');
    return response;
  },

  // Cart persistence for guest users
  saveCart: async (): Promise<{ success: boolean; message: string }> => {
    const response = await api.post<{ success: boolean; message: string }>('/cart/save');
    return response;
  },

  // Restore saved cart
  restoreCart: async (): Promise<CartDto> => {
    const response = await api.post<CartDto>('/cart/restore');
    return response;
  },

  // Cart merging
  mergeGuestCart: async (sessionId?: string, deviceFingerprint?: string): Promise<CartDto> => {
    const response = await api.post<CartDto>('/cart/merge', { sessionId, deviceFingerprint });
    return response;
  },

  // Cart summary and totals
  getCartSummary: async (): Promise<{
    itemCount: number;
    subtotal: number;
    taxes: number;
    shipping: number;
    discounts: number;
    total: number;
  }> => {
    const response = await api.get<{
      itemCount: number;
      subtotal: number;
      taxes: number;
      shipping: number;
      discounts: number;
      total: number;
    }>('/cart/summary');
    return response;
  },

  // Apply/remove coupons or discounts
  applyDiscount: async (discountCode: string): Promise<CartDto> => {
    const response = await api.post<CartDto>('/cart/discount', { code: discountCode });
    return response;
  },

  // Alias for applyDiscount to match hook expectations
  applyCoupon: async (couponCode: string): Promise<CartDto> => {
    const response = await api.post<CartDto>('/cart/discount', { code: couponCode });
    return response;
  },

  removeDiscount: async (discountId: string): Promise<CartDto> => {
    const response = await api.delete<CartDto>('/cart/discount');
    return response;
  },

  // Alias for removeDiscount to match hook expectations
  removeCoupon: async (): Promise<CartDto> => {
    const response = await api.delete<CartDto>('/cart/discount');
    return response;
  },

  // Shipping calculation
  calculateShipping: async (addressId: string): Promise<{
    shippingOptions: Array<{
      id: string;
      name: string;
      price: number;
      estimatedDays: number;
    }>;
  }> => {
    const response = await api.post<{
      shippingMethods: Array<{
        id: string;
        name: string;
        price: number;
        estimatedDays: number;
      }>;
      defaultMethodId: string;
    }>('/cart/shipping', { addressId });
    
    // Transform the response to match the hook expectations
    return {
      shippingOptions: response.shippingMethods,
    };
  },

  calculateTax: async (addressId: string): Promise<{
    taxAmount: number;
    taxRate: number;
    breakdown: Array<{
      type: string;
      rate: number;
      amount: number;
    }>;
  }> => {
    const response = await api.post<{
      taxAmount: number;
      taxRate: number;
      breakdown: Array<{
        type: string;
        rate: number;
        amount: number;
      }>;
    }>('/cart/tax', { addressId });
    return response;
  },

  // Cart expiration management
  extendCartExpiry: async (): Promise<CartDto> => {
    const response = await api.post<CartDto>('/cart/extend');
    return response;
  },

  // Bulk operations
  bulkAddToCart: async (items: AddToCartRequest[]): Promise<CartDto> => {
    const response = await api.post<CartDto>('/cart/bulk-add', { items });
    return response;
  },

  bulkUpdateCartItems: async (updates: Array<{ itemId: string; quantity: number }>): Promise<CartDto> => {
    const response = await api.patch<CartDto>('/cart/bulk-update', { updates });
    return response;
  },

  bulkRemoveFromCart: async (itemIds: string[]): Promise<CartDto> => {
    const response = await api.delete<CartDto>('/cart/bulk-remove', { data: { itemIds } });
    return response;
  },

  // Save for later functionality
  saveForLater: async (itemId: string): Promise<CartDto> => {
    const response = await api.post<CartDto>(`/cart/items/${itemId}/save-for-later`);
    return response;
  },

  moveToCart: async (itemId: string): Promise<CartDto> => {
    const response = await api.post<CartDto>(`/cart/items/${itemId}/move-to-cart`);
    return response;
  },

  getSavedItems: async (): Promise<CartItemDto[]> => {
    const response = await api.get<CartItemDto[]>('/cart/saved-items');
    return response;
  },

  // Checkout
  checkout: async (): Promise<{ orderId: string; redirectUrl?: string }> => {
    const response = await api.post<{ orderId: string; redirectUrl?: string }>('/cart/checkout');
    return response;
  },

  // Estimate total with shipping and tax
  estimateTotal: async (addressId: string, shippingMethodId?: string): Promise<{
    subtotal: number;
    tax: number;
    shipping: number;
    discount: number;
    total: number;
  }> => {
    const response = await api.post<{
      subtotal: number;
      tax: number;
      shipping: number;
      discount: number;
      total: number;
    }>('/cart/estimate', { addressId, shippingMethodId });
    return response;
  },

  // Wishlist integration
  moveToWishlist: async (itemId: string): Promise<{ success: boolean; wishlistItemId: string }> => {
    const response = await api.post<{ success: boolean; wishlistItemId: string }>(`/cart/items/${itemId}/move-to-wishlist`);
    return response;
  },

  moveFromWishlist: async (wishlistItemId: string): Promise<CartDto> => {
    const response = await api.post<CartDto>(`/cart/move-from-wishlist/${wishlistItemId}`);
    return response;
  },
}; 