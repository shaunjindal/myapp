import { api } from '../utils/apiClient';

export interface PaymentOrderRequest {
  amount: number;
  currency: string;
  receipt?: string;
}

export interface PaymentOrderResponse {
  orderId: string;
  entity: string;
  amount: number;
  currency: string;
  receipt: string;
  status: string;
  createdAt: number;
  keyId: string;
}

export interface PaymentVerificationRequest {
  razorpayPaymentId: string;
  razorpayOrderId: string;
  razorpaySignature: string;
}

export interface PaymentVerificationResponse {
  verified: boolean;
  status: string;
  message: string;
  paymentId?: string;
  orderId?: string;
}

export interface PaymentDetails {
  id: number;
  paymentId: string;
  razorpayOrderId: string;
  razorpayPaymentId?: string;
  razorpaySignature?: string;
  amount: number;
  currency: string;
  status: string;
  paymentMethod?: string;
  receipt?: string;
  description?: string;
  errorCode?: string;
  errorDescription?: string;
  paidAt?: string;
  failedAt?: string;
  refundedAt?: string;
  refundAmount?: number;
  refundId?: string;
  createdAt: string;
  updatedAt: string;
}

class PaymentService {
  /**
   * Creates a Razorpay order
   */
  async createPaymentOrder(
    request: PaymentOrderRequest,
    userId: string,
    orderId: string
  ): Promise<PaymentOrderResponse> {
    try {
      const response = await api.post<PaymentOrderResponse>(
        '/payment/create-order',
        request,
        {
          params: {
            userId,
            orderId,
          },
        }
      );
      return response;
    } catch (error) {
      console.error('Error creating payment order:', error);
      throw new Error('Failed to create payment order');
    }
  }

  /**
   * Creates a Razorpay order without requiring an existing order
   * This is used for payment-first flow where we collect payment before creating the order
   */
  async createPaymentOrderWithoutExistingOrder(
    request: PaymentOrderRequest,
    userId: string
  ): Promise<PaymentOrderResponse> {
    try {
      const response = await api.post<PaymentOrderResponse>(
        '/payment/create-payment-order',
        request,
        {
          params: {
            userId,
          },
        }
      );
      return response;
    } catch (error) {
      console.error('Error creating payment order without existing order:', error);
      throw new Error('Failed to create payment order');
    }
  }

  /**
   * Verifies a Razorpay payment
   */
  async verifyPayment(request: PaymentVerificationRequest): Promise<PaymentVerificationResponse> {
    try {
      const response = await api.post<PaymentVerificationResponse>(
        '/payment/verify',
        request
      );
      return response;
    } catch (error) {
      console.error('Error verifying payment:', error);
      throw new Error('Failed to verify payment');
    }
  }

  /**
   * Gets payment details by payment ID
   */
  async getPaymentDetails(paymentId: string): Promise<PaymentDetails> {
    try {
      const response = await api.get<PaymentDetails>(`/payment/${paymentId}`);
      return response;
    } catch (error) {
      console.error('Error getting payment details:', error);
      throw new Error('Failed to get payment details');
    }
  }

  /**
   * Gets payment details by Razorpay order ID
   */
  async getPaymentByRazorpayOrderId(razorpayOrderId: string): Promise<PaymentDetails> {
    try {
      const response = await api.get<PaymentDetails>(`/payment/order/${razorpayOrderId}`);
      return response;
    } catch (error) {
      console.error('Error getting payment details:', error);
      throw new Error('Failed to get payment details');
    }
  }

  /**
   * Checks if the payment service is healthy
   */
  async healthCheck(): Promise<string> {
    try {
      const response = await api.get<string>('/payment/health');
      return response;
    } catch (error) {
      console.error('Error checking payment service health:', error);
      throw new Error('Payment service is not healthy');
    }
  }
}

export const paymentService = new PaymentService(); 