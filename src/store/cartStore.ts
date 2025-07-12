import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CartState, Product, CartItem, Order } from '../types';
import { cartService } from '../services/cartService';
import { mapProductDtoToProduct, CartDto, CartItemDto } from '../types/api';
import { sessionManager } from '../utils/sessionManager';

// Generate a simple device fingerprint for guest cart tracking
const generateDeviceFingerprint = (): string => {
  const navigator = window.navigator;
  const screen = window.screen;
  
  const components = [
    navigator.userAgent,
    navigator.language,
    screen.width,
    screen.height,
    screen.colorDepth,
    new Date().getTimezoneOffset(),
  ];
  
  const fingerprint = components.join('|');
  return btoa(fingerprint).slice(0, 32); // Base64 encode and truncate
};

// Generate a session ID for the current session
const generateSessionId = (): string => {
  const timestamp = Date.now().toString();
  const random = Math.random().toString(36).substr(2, 9);
  return `${timestamp}-${random}`;
};

// Calculate totals from items and process payment components from backend
const calculateTotals = (items: CartItem[], backendCart?: any) => {
  const subtotal = items.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  
  // Process payment components from backend
  const paymentComponents = backendCart?.paymentComponents || [];
  let tax = 0;
  let shipping = 0;
  let discount = 0;
  let fees = 0;
  
  // Component info for display
  let taxLabel = 'Tax';
  let shippingLabel = 'Shipping'; 
  let discountLabel = 'Discount';
  let taxDescription = 'Tax amount';
  let shippingDescription = 'Shipping cost';
  let discountDescription = 'Discount applied';
  
  // Process each component
  paymentComponents.forEach((component: any) => {
    const amount = component.amount || 0;
    const effectiveAmount = component.isNegative ? -amount : amount;
    
    switch (component.type) {
      case 'TAX':
        tax = amount;
        taxLabel = component.text || 'Tax';
        taxDescription = `Tax component: ${component.text}`;
        break;
      case 'SHIPPING':
        shipping = amount;
        shippingLabel = component.text || 'Shipping';
        shippingDescription = `Shipping: ${component.text}`;
        break;
      case 'DISCOUNT':
        discount = amount;
        discountLabel = component.text || 'Discount';
        discountDescription = `Discount: ${component.text}`;
        break;
      case 'FEE':
        fees += amount;
        break;
      default:
        // Handle other component types as fees
        fees += effectiveAmount;
    }
  });
  
  // Calculate final total using backend amount or fallback calculation
  const finalTotal = backendCart?.totalAmount || (subtotal + tax + shipping + fees - discount);
  
  return {
    total: subtotal, // Keep legacy total for backward compatibility
    subtotal,
    tax,
    shipping,
    discount,
    fees,
    finalTotal,
    // Component labels and descriptions from backend
    taxLabel,
    shippingLabel,
    discountLabel,
    taxDescription,
    shippingDescription,
    discountDescription,
    // Include full component list for advanced UI
    paymentComponents,
    currency: backendCart?.currency || 'USD',
  };
};

// Helper function to convert API cart to frontend format
const convertApiCartToFrontend = (apiCart: any) => {
  const items: CartItem[] = (apiCart.items || []).map((item: any) => ({
    id: item.id,
    product: {
      id: item.productId,
      name: item.productName,
      price: item.unitPrice,
      image: item.productImageUrl,
      images: [item.productImageUrl],
      sku: item.productSku,
      description: '',
      category: '',
      stock: 0,
      rating: 0,
      reviews: 0,
      reviewCount: 0,
      tags: [],
      inStock: true,
      featured: false,
      salePrice: item.unitPrice,
      brand: item.productBrand || 'Unknown', // Add brand field
      stockQuantity: item.stockQuantity || 999, // Set reasonable default stock
      originalPrice: item.unitPrice,
      specifications: {},
    },
    quantity: item.quantity || 0,
  }));
  
  const totals = calculateTotals(items, apiCart);
  
  return {
    items,
    ...totals,
    cartId: apiCart.id,
    itemCount: apiCart.totalItems || 0,
    discountAmount: apiCart.discountAmount || 0,
    expiresAt: apiCart.expiresAt,
  };
};

export interface CartStoreState extends CartState {
  // Session management
  sessionId: string | null;
  deviceFingerprint: string | null;
  cartId: string | null;
  isGuest: boolean;
  lastSyncAt: Date | null;
  
  // Centralized total calculations
  subtotal: number;
  tax: number;
  shipping: number;
  discount: number;
  fees: number;
  finalTotal: number;
  
  // Payment component labels and descriptions from backend
  taxLabel: string;
  shippingLabel: string;
  discountLabel: string;
  taxDescription: string;
  shippingDescription: string;
  discountDescription: string;
  
  // Payment components from backend
  paymentComponents: any[];
  currency: string;
  
  // Cart persistence methods
  initializeCart: () => Promise<void>;
  mergeGuestCart: (userId: string) => Promise<void>;
  syncWithServer: () => Promise<void>;
  handleUserAuthentication: (userId: string) => Promise<void>;
  handleUserLogout: () => Promise<void>;
  
  // Enhanced cart methods with session awareness
  addItemWithSession: (product: Product, quantity?: number) => Promise<void>;
  updateQuantityWithSession: (productId: string, quantity: number) => Promise<void>;
  removeItemWithSession: (productId: string) => Promise<void>;
  clearCartWithSession: () => Promise<void>;
}

export const useCartStore = create<CartStoreState>()(
  persist(
    (set, get) => ({
      items: [],
      total: 0,
      subtotal: 0,
      tax: 0,
      shipping: 0,
      discount: 0,
      fees: 0,
      finalTotal: 0,
      taxLabel: 'Tax',
      shippingLabel: 'Shipping',
      discountLabel: 'Discount',
      taxDescription: 'Tax amount',
      shippingDescription: 'Shipping cost',
      discountDescription: 'Discount applied',
      paymentComponents: [],
      currency: 'USD',
      sessionId: null,
      deviceFingerprint: null,
      cartId: null,
      isGuest: true,
      lastSyncAt: null,
      
      // Initialize cart with session management
      initializeCart: async () => {
        try {
          // Initialize session manager
          const sessionInfo = await sessionManager.initialize();
          
          set({
            sessionId: sessionInfo.sessionId,
            deviceFingerprint: sessionInfo.deviceFingerprint,
            isGuest: sessionInfo.isGuest,
          });
          
          // Check for existing cart session
          const cartSession = await sessionManager.getCartSession();
          if (cartSession && !await sessionManager.isCartSessionExpired()) {
            // Sync with existing cart
            await get().syncWithServer();
          } else {
            // Get or create cart session
            const apiCart = await cartService.getCart();
                                  const { items, total, subtotal, tax, shipping, discount, fees, finalTotal, cartId, taxLabel, shippingLabel, discountLabel, taxDescription, shippingDescription, discountDescription, paymentComponents, currency } = convertApiCartToFrontend(apiCart);
            
            set({ 
              items, 
              total,
              subtotal,
              tax,
              shipping,
              discount,
              fees,
              finalTotal,
              cartId,
              taxLabel,
              shippingLabel,
              discountLabel,
              taxDescription,
              shippingDescription,
              discountDescription,
              paymentComponents,
              currency,
              lastSyncAt: new Date(),
            });
            
            await sessionManager.createCartSession(cartId, items.length);
          }
        } catch (error) {
          console.error('Failed to initialize cart:', error);
          // Fallback to basic initialization
          set({
            sessionId: generateSessionId(),
            deviceFingerprint: generateDeviceFingerprint(),
            isGuest: true,
          });
        }
      },
      
      // Merge guest cart when user authenticates
      mergeGuestCart: async (userId: string) => {
        try {
          const state = get();
          
          // Get session info for merge
          const sessionInfo = await sessionManager.getSessionInfo();
          
          // Call backend merge endpoint
          const mergedCart = await cartService.mergeGuestCart(
            sessionInfo.sessionId,
            sessionInfo.deviceFingerprint
          );
          
          const { items, total, subtotal, tax, shipping, finalTotal, cartId } = convertApiCartToFrontend(mergedCart);
          
          // Authenticate user in session manager
          await sessionManager.authenticateUser(userId);
          
          // Update state with merged cart
          set({
            items,
            total,
            subtotal,
            tax,
            shipping,
            finalTotal,
            cartId,
            isGuest: false,
            lastSyncAt: new Date(),
          });
          
          await sessionManager.createCartSession(cartId, items.length);
        } catch (error) {
          console.error('Failed to merge guest cart:', error);
          // If merge fails, at least switch to user cart
          try {
            await get().syncWithServer();
            await sessionManager.authenticateUser(userId);
            set({ isGuest: false });
          } catch (syncError) {
            console.error('Failed to sync with server after merge error:', syncError);
          }
        }
      },
      
      // Sync with server
      syncWithServer: async () => {
        try {
          console.log('Syncing with server...');
          const apiCart = await cartService.getCart();
          const { items, total, subtotal, tax, shipping, discount, fees, finalTotal, cartId, taxLabel, shippingLabel, discountLabel, taxDescription, shippingDescription, discountDescription, paymentComponents, currency } = convertApiCartToFrontend(apiCart);
          
          console.log('Server sync successful:', { items, total, subtotal, tax, shipping, discount, fees, finalTotal, cartId });
          set({
            items,
            total,
            subtotal,
            tax,
            shipping,
            discount,
            fees,
            finalTotal,
            cartId,
            taxLabel,
            shippingLabel,
            discountLabel,
            taxDescription,
            shippingDescription,
            discountDescription,
            paymentComponents,
            currency,
            lastSyncAt: new Date(),
          });
          
          await sessionManager.updateCartActivity(items.length);
        } catch (error) {
          console.error('Failed to sync with server:', error);
        }
      },
      
      // Handle user authentication
      handleUserAuthentication: async (userId: string) => {
        await get().mergeGuestCart(userId);
      },
      
      // Handle user logout
      handleUserLogout: async () => {
        try {
          await sessionManager.logout();
          
          // Clear cart and reinitialize as guest
          set({
            items: [],
            total: 0,
            subtotal: 0,
            tax: 0,
            shipping: 0,
            discount: 0,
            fees: 0,
            finalTotal: 0,
            taxLabel: 'Tax',
            shippingLabel: 'Shipping',
            discountLabel: 'Discount',
            taxDescription: 'Tax amount',
            shippingDescription: 'Shipping cost',
            discountDescription: 'Discount applied',
            paymentComponents: [],
            currency: 'USD',
            cartId: null,
            isGuest: true,
            lastSyncAt: null,
          });
          
          await get().initializeCart();
        } catch (error) {
          console.error('Failed to handle user logout:', error);
        }
      },
      
      // Enhanced add item with session awareness
      addItemWithSession: async (product: Product, quantity: number = 1) => {
        try {
          const apiCart = await cartService.quickAddToCart(product.id, quantity);
          const { items, total, subtotal, tax, shipping, finalTotal } = convertApiCartToFrontend(apiCart);
          
          set({ items, total, subtotal, tax, shipping, finalTotal, lastSyncAt: new Date() });
          await sessionManager.updateCartActivity(items.length);
        } catch (error) {
          console.error('Failed to add item to cart:', error);
          // Fallback to local state for offline support
          const { items } = get();
          const existingItem = items.find(item => item.product.id === product.id);
          
          if (existingItem) {
            const updatedItems = items.map(item =>
              item.product.id === product.id
                ? { ...item, quantity: item.quantity + quantity }
                : item
            );
            const totals = calculateTotals(updatedItems);
            set({ items: updatedItems, ...totals });
          } else {
            const newItem = { id: product.id, product, quantity };
            const updatedItems = [...items, newItem];
            const totals = calculateTotals(updatedItems);
            set({ items: updatedItems, ...totals });
          }
        }
      },
      
      // Enhanced update quantity with session awareness
      updateQuantityWithSession: async (productId: string, quantity: number) => {
        if (quantity <= 0) {
          await get().removeItemWithSession(productId);
          return;
        }
        
        try {
          // Find the item in the current cart state to get its ID
          const { items } = get();
          const item = items.find(item => item.product.id === productId);
          
          if (!item) {
            throw new Error('Product not found in cart');
          }
          
          // Use the item ID directly to avoid unnecessary GET call
          const apiCart = await cartService.updateCartItem(item.id, { quantity });
          const { items: updatedItems, total, subtotal, tax, shipping, discount, fees, finalTotal, paymentComponents, currency } = convertApiCartToFrontend(apiCart);
          
          set({ items: updatedItems, total, subtotal, tax, shipping, discount, fees, finalTotal, paymentComponents, currency, lastSyncAt: new Date() });
          await sessionManager.updateCartActivity(updatedItems.length);
        } catch (error) {
          console.error('Failed to update item quantity:', error);
          // Fallback to local state
          const { items } = get();
          const updatedItems = items.map(item =>
            item.product.id === productId
              ? { ...item, quantity }
              : item
          );
          const totals = calculateTotals(updatedItems);
          set({ items: updatedItems, ...totals });
        }
      },
      
      // Enhanced remove item with session awareness
      removeItemWithSession: async (productId: string) => {
        try {
          // Find the item in the current cart state to get its ID
          const { items } = get();
          const item = items.find(item => item.product.id === productId);
          
          if (!item) {
            throw new Error('Product not found in cart');
          }
          
          // Use the item ID directly to avoid unnecessary GET call
          const apiCart = await cartService.removeFromCart(item.id);
          const { items: updatedItems, total, subtotal, tax, shipping, discount, fees, finalTotal, paymentComponents, currency } = convertApiCartToFrontend(apiCart);
          
          set({ items: updatedItems, total, subtotal, tax, shipping, discount, fees, finalTotal, paymentComponents, currency, lastSyncAt: new Date() });
          await sessionManager.updateCartActivity(updatedItems.length);
        } catch (error) {
          console.error('Failed to remove item from cart:', error);
          // Fallback to local state
          const { items } = get();
          const updatedItems = items.filter(item => item.product.id !== productId);
          const totals = calculateTotals(updatedItems);
          set({ items: updatedItems, ...totals });
        }
      },
      
      // Enhanced clear cart with session awareness
      clearCartWithSession: async () => {
        try {
          console.log('Clearing cart with session...');
          await cartService.clearCart();
          console.log('Cart cleared on backend');
          
          set({ items: [], total: 0, subtotal: 0, tax: 0, shipping: 0, discount: 0, fees: 0, finalTotal: 0, paymentComponents: [], currency: 'USD', lastSyncAt: new Date() });
          await sessionManager.updateCartActivity(0);
        } catch (error) {
          console.error('Failed to clear cart:', error);
          // Still clear local state
          set({ items: [], total: 0, subtotal: 0, tax: 0, shipping: 0, discount: 0, fees: 0, finalTotal: 0, paymentComponents: [], currency: 'USD' });
        }
      },
      
      // Legacy methods for backward compatibility
      addItem: async (product: Product, quantity: number = 1) => {
        await get().addItemWithSession(product, quantity);
      },
      
      removeItem: async (productId: string) => {
        await get().removeItemWithSession(productId);
      },
      
      updateQuantity: async (productId: string, quantity: number) => {
        await get().updateQuantityWithSession(productId, quantity);
      },
      
      clearCart: async () => {
        console.log('Clearing cart...');
        try {
          // Clear cart on backend
          await cartService.clearCart();
          console.log('Cart cleared on backend');
          
          // Update local state
          set({ items: [], total: 0, subtotal: 0, tax: 0, shipping: 0, discount: 0, fees: 0, finalTotal: 0, paymentComponents: [], currency: 'USD', lastSyncAt: new Date() });
          
          // Update session manager
          await sessionManager.updateCartActivity(0);
        } catch (error) {
          console.error('Failed to clear cart on backend:', error);
          // Still clear local state even if backend fails
          set({ items: [], total: 0, subtotal: 0, tax: 0, shipping: 0, discount: 0, fees: 0, finalTotal: 0, paymentComponents: [], currency: 'USD' });
        }
      },
      

      
      // Create order from current cart items
      createOrder: (): Order | null => {
        const { items, total } = get();
        
        if (items.length === 0) return null;
        
        // Note: This is now just a helper for creating the order object
        // The actual order creation should be done through the order service
        const order: Order = {
          id: Date.now().toString(),
          userId: '1',
          items: items.map(item => ({
            id: item.id,
            product: item.product,
            quantity: item.quantity,
          })),
          total: total * 1.08, // Including tax
          status: 'processing' as const,
          createdAt: new Date(),
          deliveryAddress: {
            id: '1',
            type: 'home' as const,
            street: '123 Main St',
            city: 'New York',
            state: 'NY',
            zipCode: '10001',
            country: 'USA',
            isDefault: true,
          },
          paymentMethod: 'Credit Card',
          trackingNumber: `TRK${Date.now()}`,
        };
        
        return order;
      },

      // Sync cart with server (legacy method)
      syncCart: async () => {
        try {
          console.log('Syncing cart from backend...');
          const apiCart = await cartService.getCart();
          const { items, total, subtotal, tax, shipping, discount, fees, finalTotal, cartId, paymentComponents, currency } = convertApiCartToFrontend(apiCart);
          
          console.log('Cart synced successfully:', { items, total, subtotal, tax, shipping, discount, fees, finalTotal, cartId });
          set({
            items,
            total,
            subtotal,
            tax,
            shipping,
            discount,
            fees,
            finalTotal,
            cartId,
            paymentComponents,
            currency,
            lastSyncAt: new Date(),
          });
        } catch (error) {
          console.error('Failed to sync cart:', error);
          // If sync fails, just clear the cart
          set({ items: [], total: 0, subtotal: 0, tax: 0, shipping: 0, discount: 0, fees: 0, finalTotal: 0, paymentComponents: [], currency: 'USD' });
        }
      },
    }),
    {
      name: 'cart-storage-v4', // Updated version for auth handling
      version: 3,
      migrate: (persistedState: any, version: number) => {
        // Preserve guest cart items when migrating versions
        return {
          sessionId: persistedState?.sessionId || null,
          deviceFingerprint: persistedState?.deviceFingerprint || null,
          cartId: persistedState?.cartId || null,
          isGuest: persistedState?.isGuest ?? true,
          lastSyncAt: persistedState?.lastSyncAt || null,
          items: persistedState?.items || [],
          total: persistedState?.total || 0,
          subtotal: persistedState?.subtotal || 0,
          tax: persistedState?.tax || 0,
          shipping: persistedState?.shipping || 0,
          finalTotal: persistedState?.finalTotal || 0,
        };
      },
      // Persist cart items for guest users, session info for all users
      partialize: (state) => ({
        sessionId: state.sessionId,
        deviceFingerprint: state.deviceFingerprint,
        cartId: state.cartId,
        isGuest: state.isGuest,
        lastSyncAt: state.lastSyncAt,
        // Persist cart items for guest users to survive app restarts
        items: state.isGuest ? state.items : [],
        total: state.isGuest ? state.total : 0,
        subtotal: state.isGuest ? state.subtotal : 0,
        tax: state.isGuest ? state.tax : 0,
        shipping: state.isGuest ? state.shipping : 0,
        finalTotal: state.isGuest ? state.finalTotal : 0,
      }),
    }
  )
); 