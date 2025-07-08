import { create } from 'zustand';
import { authService } from '../services/authService';
import { AddressDto, CreateAddressRequest, UpdateAddressRequest } from '../types/api';

interface AddressState {
  addresses: AddressDto[];
  loading: boolean;
  error: string | null;
  message?: string;
  isLoaded: boolean; // Track if addresses have been loaded
  
  // Actions
  fetchAddresses: (forceRefresh?: boolean) => Promise<void>;
  addAddress: (address: CreateAddressRequest) => Promise<AddressDto>;
  updateAddress: (addressId: string, address: UpdateAddressRequest) => Promise<AddressDto>;
  deleteAddress: (addressId: string) => Promise<void>;
  setDefaultAddress: (addressId: string) => Promise<void>;
  clearError: () => void;
  reset: () => void;
}

export const useAddressStore = create<AddressState>((set, get) => ({
  addresses: [],
  loading: false,
  error: null,
  message: undefined,
  isLoaded: false,

  fetchAddresses: async (forceRefresh = false) => {
    const { isLoaded, loading } = get();
    
    // Skip if already loaded and not forcing refresh
    if (isLoaded && !forceRefresh) {
      console.log('🏠 AddressStore: Using cached addresses');
      return;
    }
    
    // Skip if already loading
    if (loading) {
      console.log('🏠 AddressStore: Already loading addresses');
      return;
    }

    set({ loading: true, error: null });
    try {
      console.log('🏠 AddressStore: Fetching addresses from API...');
      const response = await authService.getUserAddresses();
      console.log('✅ AddressStore: Addresses fetched:', response);
      
      set({ 
        addresses: response.addresses, 
        loading: false, 
        message: response.message,
        isLoaded: true
      });
    } catch (error) {
      console.error('❌ AddressStore: Failed to fetch addresses:', error);
      set({ 
        loading: false, 
        error: 'Failed to load addresses',
        isLoaded: false
      });
    }
  },

  addAddress: async (address: CreateAddressRequest) => {
    set({ error: null });
    try {
      console.log('🏠 AddressStore: Adding address...');
      const newAddress = await authService.createAddress(address);
      console.log('✅ AddressStore: Address added:', newAddress);
      
      // If the new address is default, update existing addresses to be non-default
      set(state => {
        if (newAddress.isDefault) {
          // Set all existing addresses to non-default and add the new one as default
          const updatedExistingAddresses = state.addresses.map(addr => ({
            ...addr,
            isDefault: false
          }));
          return {
            addresses: [newAddress, ...updatedExistingAddresses]
          };
        } else {
          // Just add the new address to the beginning
          return {
            addresses: [newAddress, ...state.addresses]
          };
        }
      });
      
      return newAddress;
    } catch (error) {
      console.error('❌ AddressStore: Failed to add address:', error);
      set({ error: 'Failed to add address' });
      throw error;
    }
  },

  updateAddress: async (addressId: string, address: UpdateAddressRequest) => {
    set({ error: null });
    try {
      console.log('🏠 AddressStore: Updating address:', addressId);
      const updatedAddress = await authService.updateAddress(addressId, address);
      console.log('✅ AddressStore: Address updated:', updatedAddress);
      
      // If the updated address is now default, update all other addresses to be non-default
      set(state => {
        if (updatedAddress.isDefault) {
          return {
            addresses: state.addresses.map(addr => ({
              ...addr,
              isDefault: addr.id === addressId ? true : false
            }))
          };
        } else {
          return {
            addresses: state.addresses.map(addr => 
              addr.id === addressId ? updatedAddress : addr
            )
          };
        }
      });
      
      return updatedAddress;
    } catch (error) {
      console.error('❌ AddressStore: Failed to update address:', error);
      set({ error: 'Failed to update address' });
      throw error;
    }
  },

  deleteAddress: async (addressId: string) => {
    set({ error: null });
    try {
      console.log('🏠 AddressStore: Deleting address:', addressId);
      await authService.deleteAddress(addressId);
      console.log('✅ AddressStore: Address deleted');
      
      const { addresses } = get();
      const addressToDelete = addresses.find(addr => addr.id === addressId);
      let updatedAddresses = addresses.filter(addr => addr.id !== addressId);
      
      // If deleting the default address and there are other addresses, 
      // set the first remaining address as default
      if (addressToDelete?.isDefault && updatedAddresses.length > 0) {
        try {
          await authService.setDefaultAddress(updatedAddresses[0].id);
          updatedAddresses[0].isDefault = true;
        } catch (error) {
          console.error('Failed to set new default address:', error);
        }
      }
      
      set({ addresses: updatedAddresses });
    } catch (error) {
      console.error('❌ AddressStore: Failed to delete address:', error);
      set({ error: 'Failed to delete address' });
      throw error;
    }
  },

  setDefaultAddress: async (addressId: string) => {
    set({ error: null });
    try {
      console.log('🏠 AddressStore: Setting default address:', addressId);
      await authService.setDefaultAddress(addressId);
      console.log('✅ AddressStore: Default address set');
      
      set(state => ({
        addresses: state.addresses.map(addr => ({
          ...addr,
          isDefault: addr.id === addressId
        }))
      }));
    } catch (error) {
      console.error('❌ AddressStore: Failed to set default address:', error);
      set({ error: 'Failed to set default address' });
      throw error;
    }
  },

  clearError: () => set({ error: null }),

  reset: () => set({ 
    addresses: [], 
    loading: false, 
    error: null, 
    message: undefined,
    isLoaded: false
  }),
})); 