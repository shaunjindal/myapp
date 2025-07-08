import { useCallback } from 'react';
import { useApi, useMutation } from './useApi';
import { authService } from '../services/authService';
import { setAuthToken } from '../utils/apiClient';
import { 
  LoginRequest, 
  RegisterRequest, 
  AuthResponse, 
  UserDto, 
  AddressDto, 
  CreateAddressRequest, 
  UpdateAddressRequest 
} from '../types/api';

// Auth hooks
export const useLogin = () => {
  return useMutation<AuthResponse>(
    async (credentials: LoginRequest) => {
      const response = await authService.login(credentials);
      // Set the token for future requests
      setAuthToken(response.token);
      return response;
    },
    {
      onSuccess: (response) => {
        console.log('Login successful:', response.user.email);
      },
      onError: (error) => {
        console.error('Login failed:', error);
      },
    }
  );
};

export const useRegister = () => {
  return useMutation<AuthResponse>(
    async (userData: RegisterRequest) => {
      const response = await authService.register(userData);
      // Set the token for future requests
      setAuthToken(response.token);
      return response;
    },
    {
      onSuccess: (response) => {
        console.log('Registration successful:', response.user.email);
      },
      onError: (error) => {
        console.error('Registration failed:', error);
      },
    }
  );
};

export const useLogout = () => {
  return useMutation<void>(
    async () => {
      await authService.logout();
      // Clear the token
      setAuthToken(null);
    },
    {
      onSuccess: () => {
        console.log('Logout successful');
      },
      showErrorAlert: false, // Don't show alert for logout errors
    }
  );
};

export const useChangePassword = () => {
  return useMutation<void>(
    async ({ currentPassword, newPassword }: { currentPassword: string; newPassword: string }) => {
      await authService.changePassword(currentPassword, newPassword);
    },
    {
      onSuccess: () => {
        console.log('Password changed successfully');
      },
    }
  );
};

// User profile hooks
export const useCurrentUser = (options?: { immediate?: boolean }) => {
  return useApi<UserDto>(
    () => authService.getCurrentUser(),
    {
      immediate: options?.immediate ?? true,
      onError: (error) => {
        console.error('Failed to fetch current user:', error);
      },
    }
  );
};

export const useUpdateProfile = () => {
  return useMutation<UserDto>(
    async (userData: Partial<UserDto>) => {
      return await authService.updateProfile(userData);
    },
    {
      onSuccess: (user) => {
        console.log('Profile updated successfully:', user.name);
      },
    }
  );
};

// Address management hooks
export const useUserAddresses = (options?: { immediate?: boolean }) => {
  return useApi<{ addresses: AddressDto[]; message?: string; totalAddresses: number; hasDefault: boolean }>(
    () => authService.getUserAddresses(),
    {
      immediate: options?.immediate ?? true,
      onError: (error) => {
        console.error('Failed to fetch user addresses:', error);
      },
    }
  );
};

export const useCreateAddress = () => {
  return useMutation<AddressDto>(
    async (addressData: CreateAddressRequest) => {
      return await authService.createAddress(addressData);
    },
    {
      onSuccess: (address) => {
        console.log('Address created successfully:', address.id);
      },
    }
  );
};

export const useUpdateAddress = () => {
  return useMutation<AddressDto>(
    async ({ addressId, addressData }: { addressId: string; addressData: UpdateAddressRequest }) => {
      return await authService.updateAddress(addressId, addressData);
    },
    {
      onSuccess: (address) => {
        console.log('Address updated successfully:', address.id);
      },
    }
  );
};

export const useDeleteAddress = () => {
  return useMutation<void>(
    async (addressId: string) => {
      await authService.deleteAddress(addressId);
    },
    {
      onSuccess: () => {
        console.log('Address deleted successfully');
      },
    }
  );
};

export const useSetDefaultAddress = () => {
  return useMutation<AddressDto>(
    async (addressId: string) => {
      return await authService.setDefaultAddress(addressId);
    },
    {
      onSuccess: (address) => {
        console.log('Default address set successfully:', address.id);
      },
    }
  );
};

// Password reset hooks
export const useRequestPasswordReset = () => {
  return useMutation<void>(
    async (email: string) => {
      await authService.requestPasswordReset(email);
    },
    {
      onSuccess: () => {
        console.log('Password reset requested successfully');
      },
    }
  );
};

export const useResetPassword = () => {
  return useMutation<void>(
    async ({ token, newPassword }: { token: string; newPassword: string }) => {
      await authService.resetPassword(token, newPassword);
    },
    {
      onSuccess: () => {
        console.log('Password reset successful');
      },
    }
  );
};

// Email verification hooks
export const useVerifyEmail = () => {
  return useMutation<void>(
    async (token: string) => {
      await authService.verifyEmail(token);
    },
    {
      onSuccess: () => {
        console.log('Email verified successfully');
      },
    }
  );
};

export const useResendVerificationEmail = () => {
  return useMutation<void>(
    async () => {
      await authService.resendVerificationEmail();
    },
    {
      onSuccess: () => {
        console.log('Verification email sent successfully');
      },
    }
  );
};

// Account management hooks
export const useDeactivateAccount = () => {
  return useMutation<void>(
    async () => {
      await authService.deactivateAccount();
      // Clear the token
      setAuthToken(null);
    },
    {
      onSuccess: () => {
        console.log('Account deactivated successfully');
      },
    }
  );
};

export const useDeleteAccount = () => {
  return useMutation<void>(
    async () => {
      await authService.deleteAccount();
      // Clear the token
      setAuthToken(null);
    },
    {
      onSuccess: () => {
        console.log('Account deleted successfully');
      },
    }
  );
};

// Combined hooks for convenience
export const useAuthActions = () => {
  const login = useLogin();
  const register = useRegister();
  const logout = useLogout();
  const changePassword = useChangePassword();

  const loginUser = useCallback(async (credentials: LoginRequest) => {
    return await login.mutate(credentials);
  }, [login]);

  const registerUser = useCallback(async (userData: RegisterRequest) => {
    return await register.mutate(userData);
  }, [register]);

  const logoutUser = useCallback(async () => {
    return await logout.mutate();
  }, [logout]);

  const changeUserPassword = useCallback(async (currentPassword: string, newPassword: string) => {
    return await changePassword.mutate({ currentPassword, newPassword });
  }, [changePassword]);

  return {
    loginUser,
    registerUser,
    logoutUser,
    changeUserPassword,
    loginLoading: login.loading,
    registerLoading: register.loading,
    logoutLoading: logout.loading,
    changePasswordLoading: changePassword.loading,
    loginError: login.error,
    registerError: register.error,
    logoutError: logout.error,
    changePasswordError: changePassword.error,
  };
}; 