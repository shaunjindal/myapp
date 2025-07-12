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

// Helper function to decode JWT and check expiration
const parseJWT = (token: string) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Failed to parse JWT token:', error);
    return null;
  }
};

// Helper function to set up automatic token refresh
const setupTokenRefresh = (token: string) => {
  try {
    const decoded = parseJWT(token);
    if (!decoded || !decoded.exp) {
      console.error('Invalid token payload');
      return;
    }
    
    const expirationTime = decoded.exp * 1000; // Convert to milliseconds
    const currentTime = Date.now();
    const timeUntilExpiry = expirationTime - currentTime;
    
    // Refresh token 5 minutes before expiry
    const refreshTime = timeUntilExpiry - (5 * 60 * 1000);
    
    if (refreshTime > 0) {
      console.log(`🔐 Token will be refreshed in ${Math.round(refreshTime / 1000 / 60)} minutes`);
      setTimeout(async () => {
        try {
          const { useAuthStore } = require('./authStore');
          const { authService } = require('../services/authService');
          
          const currentToken = useAuthStore.getState().token;
          if (currentToken) {
            const response = await authService.refreshToken();
            useAuthStore.getState().setToken(response.token);
            setupTokenRefresh(response.token); // Set up next refresh
          }
        } catch (error) {
          console.error('🔐 Automatic token refresh failed:', error);
        }
      }, refreshTime);
    } else {
      console.warn('🔐 Token is already expired or expires very soon');
    }
  } catch (error) {
    console.error('Failed to set up token refresh:', error);
  }
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isInitializing: true,
      token: null,
      
      initializeAuth: async () => {
        try {
          // Wait a bit to ensure persisted state is loaded
          await new Promise(resolve => setTimeout(resolve, 100));
          
          const { token, user, isAuthenticated } = get();
          
          console.log('🔐 AuthStore: Initializing auth with:', { 
            hasToken: !!token, 
            hasUser: !!user, 
            isAuthenticated 
          });
          
          if (token && user && isAuthenticated) {
            // Check if token is expired
            const decoded = parseJWT(token);
            if (decoded && decoded.exp) {
              const expirationTime = decoded.exp * 1000;
              const currentTime = Date.now();
              
              if (currentTime >= expirationTime) {
                console.log('🔐 AuthStore: Token is expired, clearing auth state');
                set({ user: null, isAuthenticated: false, token: null });
                setAuthToken(null);
                return;
              }
            }
            
            console.log('🔐 AuthStore: Setting auth token from storage');
            setAuthToken(token);
          } else {
            console.log('🔐 AuthStore: No valid auth state found, clearing token');
            setAuthToken(null);
          }
          
          // Register callback for auth state clearing on 401 errors
          setAuthStateCallback(() => {
            console.log('🔐 AuthStore: Clearing auth state due to 401 error');
            // Clear auth state
            set({ user: null, isAuthenticated: false, token: null });
            
            // Clear address store cache
            const { useAddressStore } = require('./addressStore');
            useAddressStore.getState().reset();
          });
          
          // Set up automatic token refresh
          if (token && user && isAuthenticated) {
            setupTokenRefresh(token);
          }
          
        } catch (error) {
          console.error('Auth initialization failed:', error);
          set({ user: null, isAuthenticated: false, token: null });
          setAuthToken(null);
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
          
          // Set up automatic token refresh
          setupTokenRefresh(response.token);

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
            
            // Set up automatic token refresh
            setupTokenRefresh(response.token);
            
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
        
        // Set up automatic token refresh for new token
        setupTokenRefresh(token);
      },
      
      // Manual token refresh
      refreshToken: async () => {
        try {
          const { token } = get();
          if (!token) {
            console.error('No token available for refresh');
            return false;
          }
          
          const response = await authService.refreshToken();
          set({ token: response.token });
          setAuthToken(response.token);
          setupTokenRefresh(response.token);
          
          console.log('🔐 Manual token refresh successful');
          return true;
        } catch (error) {
          console.error('🔐 Manual token refresh failed:', error);
          // Clear auth state on refresh failure
          set({ user: null, isAuthenticated: false, token: null });
          setAuthToken(null);
          return false;
        }
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