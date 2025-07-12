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
    
    console.log('🔄 InitStore: Starting initialization...');
    
    // Initialize auth state (restore token from storage)
    const { initializeAuth } = useAuthStore.getState();
    await initializeAuth();
    
    // Wait a bit more to ensure auth is fully restored
    await new Promise(resolve => setTimeout(resolve, 200));
    
    // Handle cart based on auth state
    const { isAuthenticated } = useAuthStore.getState();
    const { syncCart, initializeCart } = useCartStore.getState();
    
    console.log('🔄 InitStore: Auth state restored. isAuthenticated:', isAuthenticated);
    
    if (isAuthenticated) {
      // For authenticated users, sync with backend to restore cart
      console.log('🔄 InitStore: Syncing cart for authenticated user...');
      await syncCart();
    } else {
      // For guest users, initialize cart session (preserves existing items)
      console.log('🔄 InitStore: Initializing cart for guest user...');
      await initializeCart();
    }
    
    console.log('✅ InitStore: Initialization completed');
    set({ isInitialized: true });
  },
})); 