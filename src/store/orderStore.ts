import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import orderService from '../services/orderService';
import { OrderDto } from '../types/order';
import { PageResponse } from '../types/api';

interface OrderStore {
  // Recent orders (for profile page)
  recentOrder: OrderDto | null;
  recentOrderLoading: boolean;
  recentOrderError: string | null;
  
  // Orders list (for orders list page)
  orders: OrderDto[];
  ordersLoading: boolean;
  ordersError: string | null;
  hasMoreOrders: boolean;
  currentPage: number;
  
  // Individual order details
  orderDetails: Record<string, OrderDto>;
  orderDetailsLoading: Record<string, boolean>;
  orderDetailsError: Record<string, string | null>;
  
  // Actions
  fetchRecentOrder: (force?: boolean) => Promise<void>;
  fetchOrders: (page?: number, force?: boolean) => Promise<void>;
  fetchOrderDetails: (orderId: string, force?: boolean) => Promise<void>;
  addNewOrder: (order: OrderDto) => void;
  clearOrders: () => void;
  reset: () => void;
}

export const useOrderStore = create<OrderStore>()(
  subscribeWithSelector((set, get) => ({
    // Initial state
    recentOrder: null,
    recentOrderLoading: false,
    recentOrderError: null,
    
    orders: [],
    ordersLoading: false,
    ordersError: null,
    hasMoreOrders: true,
    currentPage: 0,
    
    orderDetails: {},
    orderDetailsLoading: {},
    orderDetailsError: {},
    
    // Fetch recent order for profile
    fetchRecentOrder: async (force = false) => {
      const state = get();
      
      // Use cached data if available and not forcing
      if (!force && state.recentOrder && !state.recentOrderLoading) {
        return;
      }
      
      set({ recentOrderLoading: true, recentOrderError: null });
      
      try {
        const response = await orderService.getUserOrders(0, 1);
        const recentOrder = response.content[0] || null;
        
        set({ 
          recentOrder, 
          recentOrderLoading: false,
          recentOrderError: null 
        });
      } catch (error) {
        console.error('Failed to fetch recent order:', error);
        set({ 
          recentOrderLoading: false,
          recentOrderError: 'Failed to load recent order' 
        });
      }
    },
    
    // Fetch orders list
    fetchOrders: async (page = 0, force = false) => {
      const state = get();
      
      // Use cached data if available and not forcing refresh
      if (!force && page === 0 && state.orders.length > 0 && !state.ordersLoading) {
        return;
      }
      
      set({ ordersLoading: true, ordersError: null });
      
      try {
        const response = await orderService.getUserOrders(page, 10);
        
        set({ 
          orders: page === 0 ? response.content : [...state.orders, ...response.content],
          ordersLoading: false,
          ordersError: null,
          hasMoreOrders: response.hasNext,
          currentPage: page
        });
      } catch (error) {
        console.error('Failed to fetch orders:', error);
        set({ 
          ordersLoading: false,
          ordersError: 'Failed to load orders' 
        });
      }
    },
    
    // Fetch individual order details
    fetchOrderDetails: async (orderId: string, force = false) => {
      const state = get();
      
      // Use cached data if available and not forcing
      if (!force && state.orderDetails[orderId] && !state.orderDetailsLoading[orderId]) {
        return;
      }
      
      set({ 
        orderDetailsLoading: { ...state.orderDetailsLoading, [orderId]: true },
        orderDetailsError: { ...state.orderDetailsError, [orderId]: null }
      });
      
      try {
        const orderData = await orderService.getOrderById(orderId);
        
        set({ 
          orderDetails: { ...state.orderDetails, [orderId]: orderData },
          orderDetailsLoading: { ...state.orderDetailsLoading, [orderId]: false },
          orderDetailsError: { ...state.orderDetailsError, [orderId]: null }
        });
      } catch (error) {
        console.error('Failed to fetch order details:', error);
        set({ 
          orderDetailsLoading: { ...state.orderDetailsLoading, [orderId]: false },
          orderDetailsError: { ...state.orderDetailsError, [orderId]: 'Failed to load order details' }
        });
      }
    },
    
    // Add new order (from checkout)
    addNewOrder: (order: OrderDto) => {
      const state = get();
      
      // Update recent order
      set({ recentOrder: order });
      
      // Add to orders list at the beginning
      set({ orders: [order, ...state.orders] });
      
      // Add to order details cache
      set({ 
        orderDetails: { ...state.orderDetails, [order.id]: order }
      });
    },
    
    // Clear orders (on logout)
    clearOrders: () => {
      set({
        orders: [],
        recentOrder: null,
        orderDetails: {},
        orderDetailsLoading: {},
        orderDetailsError: {}
      });
    },
    
    // Reset all state
    reset: () => {
      set({
        recentOrder: null,
        recentOrderLoading: false,
        recentOrderError: null,
        orders: [],
        ordersLoading: false,
        ordersError: null,
        hasMoreOrders: true,
        currentPage: 0,
        orderDetails: {},
        orderDetailsLoading: {},
        orderDetailsError: {}
      });
    }
  }))
); 