import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AuthState, Address, Order } from '../types';
import { authService } from '../services/authService';
import { setAuthToken, setAuthStateCallback } from '../utils/apiClient';
import { 
  LoginRequest, 
  RegisterRequest, 
  UserDto
} from '../types/api';

// Helper function to convert UserDto to frontend User type
const mapUserDtoToUser = (userDto: any, orders: Order[] = []) => ({
  id: userDto.id,
  email: userDto.email,
  name: userDto.firstName && userDto.lastName ? `${userDto.firstName} ${userDto.lastName}` : userDto.name || 'User',
  avatar: userDto.avatar || userDto.profileImageUrl,
  orders,
});

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isInitializing: true,
      token: null,
      
      initializeAuth: async () => {
        try {
          const { token, user, isAuthenticated } = get();
          
          if (token && user && isAuthenticated) {
            setAuthToken(token);
          }
          
          // Register callback for auth state clearing on 401 errors
          setAuthStateCallback(() => {
            // Clear auth state
            set({ user: null, isAuthenticated: false, token: null });
            
            // Clear address store cache
            const { useAddressStore } = require('./addressStore');
            useAddressStore.getState().reset();
          });
          
        } catch (error) {
          console.error('Auth initialization failed:', error);
          set({ user: null, isAuthenticated: false, token: null });
        } finally {
          // Always set initializing to false when done
          set({ isInitializing: false });
        }
      },
      
      login: async (email: string, password: string) => {
        try {

          const credentials: LoginRequest = { email, password };
          const response = await authService.login(credentials);
          // Set the auth token
          setAuthToken(response.token);
          
          // Convert to frontend format
          const user = mapUserDtoToUser(response.user, []);
          set({ user, isAuthenticated: true, token: response.token });

          // Merge guest cart after login
          try {
            const { useCartStore } = require('./cartStore');
            await useCartStore.getState().handleUserAuthentication(user.id);
          } catch (error) {
            // Ignore cart merge errors during login
          }

          return true;
        } catch (error) {
          console.error('❌ AuthStore: Login failed:', error);
          set({ user: null, isAuthenticated: false, token: null });
          setAuthToken(null);
          return false;
        }
      },
      
      register: async (name: string, email: string, password: string, autoLogin: boolean = true) => {
        try {
          console.log('🔐 AuthStore: Starting registration process with autoLogin:', autoLogin);
          
          // Split name into first and last name
          const nameParts = name.trim().split(' ');
          const firstName = nameParts[0] || '';
          const lastName = nameParts.slice(1).join(' ') || '';
          
          console.log('🔐 AuthStore: Prepared registration data:', { firstName, lastName, email, autoLogin });
          
          const userData: RegisterRequest = { 
            firstName, 
            lastName, 
            email, 
            password, 
            confirmPassword: password 
          };
          
          const response = await authService.register(userData);
          
          if (autoLogin) {
            // Set the auth token
            setAuthToken(response.token);
            // Convert to frontend format
            const user = mapUserDtoToUser(response.user, []);
            set({ user, isAuthenticated: true, token: response.token });
            
            // Merge guest cart after registration
            try {
              const { useCartStore } = require('./cartStore');
              await useCartStore.getState().handleUserAuthentication(user.id);
            } catch (error) {
              // Ignore cart merge errors during registration
            }
          } else {
            setAuthToken(null);
            set({ user: null, isAuthenticated: false, token: null });
          }
          return true;
        } catch (error) {
          console.error('❌ AuthStore: Registration failed:', error);
          set({ user: null, isAuthenticated: false, token: null });
          setAuthToken(null);
          return false;
        }
      },
      
      logout: async () => {
        try {
          await authService.logout();
        } catch (error) {
          console.error('Logout failed:', error);
        } finally {
          // Clear token and state regardless of API call success
          setAuthToken(null);
          set({ user: null, isAuthenticated: false, token: null });
          
          // Clear address store cache
          const { useAddressStore } = require('./addressStore');
          useAddressStore.getState().reset();
          
          // Clear order store cache
          const { useOrderStore } = require('./orderStore');
          useOrderStore.getState().reset();
          
          // Handle cart logout properly
          try {
            const { useCartStore } = require('./cartStore');
            await useCartStore.getState().handleUserLogout();
          } catch (error) {
            // Ignore cart logout errors during logout
          }
        }
      },
      
      // Add order to user's order history
      addOrder: (order: Order) => {
        const { user } = get();
        if (user) {
          const updatedUser = {
            ...user,
            orders: [order, ...user.orders],
          };
          set({ user: updatedUser });
        }
      },
      
      // Set token manually (for token refresh)
      setToken: (token: string) => {
        setAuthToken(token);
        set({ token });
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ 
        user: state.user, 
        isAuthenticated: state.isAuthenticated,
        token: state.token 
        // Exclude isInitializing from persistence
      }),
    }
  )
); 