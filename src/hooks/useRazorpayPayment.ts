import { useState } from 'react';
import { Alert, Platform, Linking } from 'react-native';

// Cross-platform Razorpay integration
declare global {
  interface Window {
    Razorpay: any;
  }
}

// Native RazorpayCheckout for mobile
let RazorpayCheckout: any = null;
try {
  if (Platform.OS !== 'web') {
    RazorpayCheckout = require('react-native-razorpay');
  }
} catch (error) {
  console.log('react-native-razorpay not available for mobile, using fallback');
}

// Load Razorpay script for web
const loadRazorpayScript = (): Promise<boolean> => {
  return new Promise((resolve) => {
    if (Platform.OS !== 'web') {
      resolve(false);
      return;
    }

    if (typeof window !== 'undefined' && window.Razorpay) {
      resolve(true);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

// Mock payment dialog for development
const showMockPaymentDialog = (orderId: string): Promise<any> => {
  return new Promise((resolve, reject) => {
    Alert.alert(
      'Mock Payment',
      'This is a simulated payment for development. In production, this would open the real Razorpay checkout.',
      [
        {
          text: 'Simulate Success',
          onPress: () => {
            // Simulate payment delay
            setTimeout(() => {
              resolve({
                razorpay_payment_id: `pay_mock_${Date.now()}`,
                razorpay_order_id: orderId,
                razorpay_signature: `mock_signature_${Date.now()}`,
              });
            }, 2000);
          },
        },
        {
          text: 'Cancel',
          onPress: () => {
            reject(new Error('Payment cancelled by user'));
          },
          style: 'cancel',
        },
      ]
    );
  });
};
import { 
  paymentService, 
  PaymentOrderRequest, 
  PaymentOrderResponse, 
  PaymentVerificationRequest,
  PaymentVerificationResponse 
} from '../services/paymentService';
import { useAuthStore } from '../store/authStore';

export interface RazorpayPaymentOptions {
  amount: number;
  currency?: string;
  receipt?: string;
  orderId: string;
  name?: string;
  description?: string;
  email?: string;
  contact?: string;
  notes?: Record<string, string>;
}

export interface PaymentResult {
  success: boolean;
  paymentId?: string;
  orderId?: string;
  signature?: string;
  error?: string;
}

export interface UseRazorpayPaymentReturn {
  isLoading: boolean;
  isTestMode: boolean;
  initiatePayment: (options: RazorpayPaymentOptions) => Promise<PaymentResult>;
  verifyPayment: (verificationData: PaymentVerificationRequest) => Promise<PaymentVerificationResponse>;
  resetLoading: () => void;
}

export const useRazorpayPayment = (): UseRazorpayPaymentReturn => {
  const [isLoading, setIsLoading] = useState(false);
  const [isTestMode, setIsTestMode] = useState(false);
  const { user } = useAuthStore();

  const initiatePayment = async (options: RazorpayPaymentOptions): Promise<PaymentResult> => {
    if (!user) {
      Alert.alert('Error', 'Please login to continue with payment');
      return { success: false, error: 'User not authenticated' };
    }

    setIsLoading(true);

    try {
      console.log('🚀 Starting Razorpay payment with options:', options);
      console.log('🚀 User ID:', user.id);

      // Step 1: Create payment order on backend without existing order
      const orderRequest: PaymentOrderRequest = {
        amount: options.amount,
        currency: options.currency || 'INR',
        receipt: options.receipt,
      };

      console.log('📡 Calling backend API for payment order (payment-first flow)...');
      const paymentOrder: PaymentOrderResponse = await paymentService.createPaymentOrderWithoutExistingOrder(
        orderRequest,
        user.id
      );
      console.log('✅ Backend payment order created:', paymentOrder);

      // Detect test mode based on key ID
      const isTestModeDetected = paymentOrder.keyId?.startsWith('rzp_test_') || paymentOrder.keyId?.includes('dummy');
      setIsTestMode(isTestModeDetected);

      // Show test mode alert if in test mode
      if (isTestModeDetected) {
        console.log('⚠️ Running in TEST MODE - No real money will be charged');
      }

      // Step 2: Prepare Razorpay options
      const razorpayOptions = {
        description: options.description || 'Payment for your order',
        image: 'https://i.imgur.com/3g7nmJC.png', // Replace with your app logo
        currency: paymentOrder.currency,
        key: paymentOrder.keyId,
        amount: Math.round(paymentOrder.amount * 100), // Convert to paise
        order_id: paymentOrder.orderId,
        name: options.name || 'E-Commerce App',
        prefill: {
          email: options.email || user.email || '',
          contact: options.contact || '+919876543210', // Valid Indian mobile number format
          name: user.name || '',
        },
        theme: {
          color: '#3399cc',
        },
        modal: {
          ondismiss: () => {
            console.log('💳 Payment cancelled by user');
          },
        },
        notes: options.notes || {},
      };

      console.log('💳 Opening Razorpay with options:', razorpayOptions);

      // Step 3: Open Razorpay checkout - Cross-platform
      let paymentData;
      
      if (Platform.OS === 'web') {
        // Web platform - use Razorpay Web SDK
        const razorpayLoaded = await loadRazorpayScript();
        
        if (razorpayLoaded && window.Razorpay) {
          paymentData = await new Promise((resolve, reject) => {
            const rzp = new window.Razorpay({
              ...razorpayOptions,
              handler: (response: any) => {
                console.log('✅ Web payment completed:', response);
                resolve({
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_signature: response.razorpay_signature,
                });
              },
              modal: {
                ondismiss: () => {
                  console.log('💳 Payment cancelled by user');
                  reject(new Error('Payment cancelled by user'));
                },
              },
            });
            rzp.open();
          });
        } else {
          throw new Error('Failed to load Razorpay. Please check your internet connection.');
        }
      } else {
        // Mobile platform - use react-native-razorpay
        if (RazorpayCheckout && RazorpayCheckout.open) {
          console.log('📱 Using native Razorpay SDK for mobile');
          paymentData = await RazorpayCheckout.open(razorpayOptions);
        } else {
          // Fallback for development when react-native-razorpay is not available
          console.log('🔄 Using mock payment flow - react-native-razorpay not available');
          console.log('📝 To use real payments on mobile, install: npm install react-native-razorpay');
          paymentData = await showMockPaymentDialog(paymentOrder.orderId);
        }
      }

      console.log('✅ Payment completed:', paymentData);

      // Step 4: Verify payment on backend
      const verificationRequest: PaymentVerificationRequest = {
        razorpayPaymentId: paymentData.razorpay_payment_id,
        razorpayOrderId: paymentData.razorpay_order_id,
        razorpaySignature: paymentData.razorpay_signature,
      };

      const verificationResult = await paymentService.verifyPayment(verificationRequest);

      if (verificationResult.verified) {
        Alert.alert('Success', 'Payment completed successfully!');
        return {
          success: true,
          paymentId: paymentData.razorpay_payment_id,
          orderId: paymentData.razorpay_order_id,
          signature: paymentData.razorpay_signature,
        };
      } else {
        Alert.alert('Error', 'Payment verification failed. Please contact support.');
        return {
          success: false,
          error: 'Payment verification failed',
        };
      }

    } catch (error: any) {
      console.error('Payment error:', error);
      
      let errorMessage = 'Payment failed. Please try again.';
      
      if (error.code === 'payment_cancelled') {
        errorMessage = 'Payment was cancelled by user.';
      } else if (error.code === 'payment_failed') {
        errorMessage = 'Payment failed. Please check your payment details and try again.';
      } else if (error.message) {
        errorMessage = error.message;
      }

      Alert.alert('Payment Error', errorMessage);
      
      return {
        success: false,
        error: errorMessage,
      };
    } finally {
      setIsLoading(false);
    }
  };

  const verifyPayment = async (verificationData: PaymentVerificationRequest): Promise<PaymentVerificationResponse> => {
    try {
      const result = await paymentService.verifyPayment(verificationData);
      return result;
    } catch (error: any) {
      console.error('Payment verification error:', error);
      throw new Error('Failed to verify payment');
    }
  };

  const resetLoading = () => {
    setIsLoading(false);
  };

  return {
    isLoading,
    isTestMode,
    initiatePayment,
    verifyPayment,
    resetLoading,
  };
}; 