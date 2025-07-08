import { create } from 'zustand';
import { useCartStore } from './cartStore';
import { useAuthStore } from './authStore';

interface InitState {
  isInitialized: boolean;
  initialize: () => Promise<void>;
}

export const useInitStore = create<InitState>((set, get) => ({
  isInitialized: false,
  
  initialize: async () => {
    const { isInitialized } = get();
    
    if (isInitialized) return;
    
    // Initialize auth state (restore token from storage)
    const { initializeAuth } = useAuthStore.getState();
    await initializeAuth();
    
    // Handle cart based on auth state
    const { isAuthenticated } = useAuthStore.getState();
    const { syncCart, initializeCart } = useCartStore.getState();
    
    if (isAuthenticated) {
      // For authenticated users, sync with backend to restore cart
      await syncCart();
    } else {
      // For guest users, initialize cart session (preserves existing items)
      await initializeCart();
    }
    
    set({ isInitialized: true });
  },
})); 