import { api } from '../utils/apiClient';
import { 
  LoginRequest, 
  RegisterRequest, 
  AuthResponse, 
  UserDto,
  AddressDto,
  CreateAddressRequest,
  UpdateAddressRequest,
  ApiResponse
} from '../types/api';

export const authService = {
  // Authentication endpoints
  login: async (credentials: LoginRequest): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/login', credentials);
    return response;
  },

  register: async (userData: RegisterRequest): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/register', userData);
    return response;
  },

  logout: async (): Promise<void> => {
    await api.post('/auth/logout');
  },

  refreshToken: async (): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/refresh');
    return response;
  },

  // User profile endpoints
  getCurrentUser: async (): Promise<UserDto> => {
    const response = await api.get<UserDto>('/users/me');
    return response;
  },

  updateProfile: async (userData: Partial<UserDto>): Promise<UserDto> => {
    const response = await api.patch<UserDto>('/users/me', userData);
    return response;
  },

  changePassword: async (currentPassword: string, newPassword: string): Promise<void> => {
    await api.post('/users/me/change-password', {
      currentPassword,
      newPassword,
    });
  },

  // Address management endpoints
  getUserAddresses: async (): Promise<{ addresses: AddressDto[]; message?: string; totalAddresses: number; hasDefault: boolean }> => {
    const response = await api.get<{ addresses: AddressDto[]; message?: string; totalAddresses: number; hasDefault: boolean }>('/addresses');
    return response;
  },

  createAddress: async (addressData: CreateAddressRequest): Promise<AddressDto> => {
    const response = await api.post<{ data: AddressDto }>('/addresses', addressData);
    return response.data;
  },

  updateAddress: async (addressId: string, addressData: UpdateAddressRequest): Promise<AddressDto> => {
    const response = await api.put<{ data: AddressDto }>(`/addresses/${addressId}`, addressData);
    return response.data;
  },

  deleteAddress: async (addressId: string): Promise<void> => {
    await api.delete(`/addresses/${addressId}`);
  },

  setDefaultAddress: async (addressId: string): Promise<AddressDto> => {
    const response = await api.post<{ data: AddressDto }>(`/addresses/${addressId}/default`);
    return response.data;
  },

  // Account management
  deactivateAccount: async (): Promise<void> => {
    await api.post('/users/me/deactivate');
  },

  deleteAccount: async (): Promise<void> => {
    await api.delete('/users/me');
  },

  // Password reset
  requestPasswordReset: async (email: string): Promise<void> => {
    await api.post('/auth/forgot-password', { email });
  },

  resetPassword: async (token: string, newPassword: string): Promise<void> => {
    await api.post('/auth/reset-password', { token, newPassword });
  },

  // Email verification
  verifyEmail: async (token: string): Promise<void> => {
    await api.post('/auth/verify-email', { token });
  },

  resendVerificationEmail: async (): Promise<void> => {
    await api.post('/auth/resend-verification');
  },
}; 