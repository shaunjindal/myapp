import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  Alert,
  BackHandler,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { useRouter, useLocalSearchParams, useFocusEffect } from 'expo-router';
import { theme } from '../../../src/styles/theme';
import { Ionicons } from '@expo/vector-icons';
import { useCartStore } from '../../../src/store/cartStore';
import { useAuthStore } from '../../../src/store/authStore';
import { useAddressStore } from '../../../src/store/addressStore';
import { useOrderStore } from '../../../src/store/orderStore';
import { useRazorpayPayment } from '../../../src/hooks/useRazorpayPayment';
import orderService from '../../../src/services/orderService';
import { PaymentMethod } from '../../../src/types/order';
import { Button } from '../../../src/components/Button';
import { BackButtonHeader } from '../../../src/components/BackButtonHeader';

export default function PaymentScreen() {
  const router = useRouter();
  const { selectedAddressId, paymentMethod } = useLocalSearchParams<{
    selectedAddressId: string;
    paymentMethod: string;
  }>();
  
  const { clearCart, items, total, subtotal, tax, shipping, finalTotal } = useCartStore();
  const { user } = useAuthStore();
  const { addresses } = useAddressStore();
  const { addNewOrder } = useOrderStore();
  const { initiatePayment, isLoading: isPaymentLoading, resetLoading, isTestMode } = useRazorpayPayment();
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paymentCollected, setPaymentCollected] = useState(false);
  const [paymentData, setPaymentData] = useState<{
    paymentId: string;
    orderId: string;
    signature: string;
  } | null>(null);

  // Totals are now calculated centrally in useCartStore

  // Get selected address
  const selectedAddress = addresses.find(addr => addr.id === selectedAddressId);

  // Reset processing state when screen regains focus (after payment flow)
  useFocusEffect(
    React.useCallback(() => {
      // Reset processing state when screen regains focus, unless payment was collected
      if ((isProcessing || isPaymentLoading) && !paymentCollected) {
        console.log('🔄 Resetting processing state on screen focus');
        setIsProcessing(false);
        setError(null);
        resetLoading();
      }

      const onBackPress = () => {
        if (isProcessing) {
          Alert.alert(
            'Payment in Progress',
            'Please do not go back while we process your payment.',
            [{ text: 'Stay Here', style: 'default' }]
          );
          return true;
        }
        return false;
      };

      const backHandler = BackHandler.addEventListener('hardwareBackPress', onBackPress);
      return () => backHandler.remove();
    }, [isProcessing, isPaymentLoading, paymentCollected, resetLoading])
  );

  const mapPaymentMethod = (method: string): PaymentMethod => {
    switch (method.toLowerCase()) {
      case 'credit':
      case 'credit_card':
        return PaymentMethod.CREDIT_CARD;
      case 'debit':
      case 'debit_card':
        return PaymentMethod.DEBIT_CARD;
      case 'paypal':
        return PaymentMethod.PAYPAL;
      case 'apple_pay':
        return PaymentMethod.APPLE_PAY;
      case 'google_pay':
        return PaymentMethod.GOOGLE_PAY;
      case 'bank_transfer':
        return PaymentMethod.BANK_TRANSFER;
      case 'cash_on_delivery':
        return PaymentMethod.CASH_ON_DELIVERY;
      case 'razorpay_card':
        return PaymentMethod.RAZORPAY_CARD;
      case 'razorpay_upi':
        return PaymentMethod.RAZORPAY_UPI;
      default:
        return PaymentMethod.CREDIT_CARD;
    }
  };

  const handlePayment = async () => {
    if (!user || !selectedAddressId || !paymentMethod) {
      setError('Missing required information');
      return;
    }

    // Ensure selectedAddressId is defined
    if (!selectedAddressId) {
      setError('Please select an address');
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      const mappedPaymentMethod = mapPaymentMethod(paymentMethod);
      const isRazorpayPayment = mappedPaymentMethod === PaymentMethod.RAZORPAY_CARD || 
                                mappedPaymentMethod === PaymentMethod.RAZORPAY_UPI;

      if (isRazorpayPayment) {
        // For Razorpay payments, collect payment first
        console.log('💳 Initiating Razorpay payment first...');
        
        const paymentResult = await initiatePayment({
          amount: finalTotal,
          currency: 'INR',
          orderId: `temp_${Date.now()}`, // Temporary order ID for payment
          name: 'E-Commerce App',
          description: `Payment for cart items (${items.length} items)`,
          email: user.email,
          receipt: `receipt_${Date.now()}`
        });

        if (!paymentResult.success) {
          throw new Error(paymentResult.error || 'Payment failed');
        }

        // Payment successful, store payment data
        setPaymentData({
          paymentId: paymentResult.paymentId!,
          orderId: paymentResult.orderId!,
          signature: paymentResult.signature!
        });
        setPaymentCollected(true);
        
        // Now create the order with payment information
        await createOrderWithPayment(mappedPaymentMethod, paymentResult);
        
      } else {
        // For non-Razorpay payments (like COD), create order directly
        await createOrderWithoutPayment(mappedPaymentMethod);
      }

    } catch (error: any) {
      console.error('Payment process failed:', error);
      setError(error.message || 'Payment failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const createOrderWithPayment = async (paymentMethod: PaymentMethod, paymentResult: any) => {
    try {
      console.log('📦 Creating order after successful payment...');
      
      const orderRequest = {
        billingAddressId: selectedAddressId!,
        shippingAddressId: selectedAddressId!,
        paymentMethod: paymentMethod,
        customerNotes: `Payment ID: ${paymentResult.paymentId}, Order ID: ${paymentResult.orderId}`
      };

      const createdOrder = await orderService.createOrderFromCart(orderRequest);
      
      // Add order to store
      addNewOrder(createdOrder);
      
      // Clear cart
      await clearCart();
      
      // Navigate to success screen
      router.replace({
        pathname: '/(tabs)/cart/order-success',
        params: { 
          orderNumber: createdOrder.orderNumber, 
          orderId: createdOrder.id,
          paymentId: paymentResult.paymentId
        }
      });
      
    } catch (error: any) {
      console.error('Order creation failed:', error);
      throw new Error('Payment was successful but order creation failed. Please contact support.');
    }
  };

  const createOrderWithoutPayment = async (paymentMethod: PaymentMethod) => {
    try {
      console.log('📦 Creating order without payment (COD)...');
      
      const orderRequest = {
        billingAddressId: selectedAddressId!,
        shippingAddressId: selectedAddressId!,
        paymentMethod: paymentMethod,
        customerNotes: 'Cash on Delivery'
      };

      const createdOrder = await orderService.createOrderFromCart(orderRequest);
      
      // Add order to store
      addNewOrder(createdOrder);
      
      // Clear cart
      await clearCart();
      
      // Navigate to success screen
      router.replace({
        pathname: '/(tabs)/cart/order-success',
        params: { 
          orderNumber: createdOrder.orderNumber, 
          orderId: createdOrder.id
        }
      });
      
    } catch (error: any) {
      console.error('Order creation failed:', error);
      throw new Error('Failed to create order. Please try again.');
    }
  };

  const getPaymentMethodDisplayName = (method: string) => {
    switch (method.toLowerCase()) {
      case 'razorpay_card':
        return 'Razorpay Card Payment';
      case 'razorpay_upi':
        return 'Razorpay UPI Payment';
      case 'cash_on_delivery':
        return 'Cash on Delivery';
      case 'credit':
        return 'Credit Card';
      case 'paypal':
        return 'PayPal';
      case 'apple':
        return 'Apple Pay';
      default:
        return 'Unknown Payment Method';
    }
  };

  const getPaymentMethodIcon = (method: string) => {
    switch (method.toLowerCase()) {
      case 'razorpay_card':
        return 'card';
      case 'razorpay_upi':
        return 'phone-portrait';
      case 'cash_on_delivery':
        return 'cash';
      case 'credit':
        return 'card';
      case 'paypal':
        return 'logo-paypal';
      case 'apple':
        return 'logo-apple';
      default:
        return 'card';
    }
  };

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <BackButtonHeader
          title="Payment"
          onBack={() => router.back()}
        />
        
        {/* Test Mode Banner */}
        {isTestMode && (
          <View style={styles.testModeBanner}>
            <View style={styles.testModeIcon}>
              <Ionicons name="warning" size={16} color="#d97706" />
            </View>
            <Text style={styles.testModeText}>TEST MODE - No real money will be charged</Text>
          </View>
        )}

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <View style={styles.content}>
            <View style={styles.errorContainer}>
              <Ionicons name="alert-circle" size={80} color={theme.colors.error[600]} />
              <Text style={styles.errorTitle}>Payment Failed</Text>
              <Text style={styles.errorMessage}>{error}</Text>
              <Button
                title="Try Again"
                onPress={() => {
                  setError(null);
                  setPaymentCollected(false);
                  setPaymentData(null);
                }}
                style={styles.retryButton}
              />
              <TouchableOpacity
                style={styles.backButton}
                onPress={() => router.back()}
              >
                <Text style={styles.backButtonText}>Go Back to Checkout</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <BackButtonHeader
        title="Payment"
        onBack={() => router.back()}
      />
      
      {/* Test Mode Banner */}
      {isTestMode && (
        <View style={styles.testModeBanner}>
          <View style={styles.testModeIcon}>
            <Ionicons name="warning" size={16} color="#d97706" />
          </View>
          <Text style={styles.testModeText}>TEST MODE - No real money will be charged</Text>
        </View>
      )}

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <View style={styles.header}>
            <Ionicons name="lock-closed" size={24} color={theme.colors.primary[600]} />
            <Text style={styles.title}>Secure Payment</Text>
            <Text style={styles.subtitle}>Complete your payment to place your order</Text>
          </View>

          {/* Order Summary */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Order Summary</Text>
            {items.map((item) => (
              <View key={item.id} style={styles.orderItem}>
                <Text style={styles.itemName}>{item.product.name}</Text>
                <Text style={styles.itemQuantity}>Qty: {item.quantity}</Text>
                <Text style={styles.itemPrice}>${(item.product.price * item.quantity).toFixed(2)}</Text>
              </View>
            ))}
            
            <View style={styles.orderSummary}>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Subtotal:</Text>
                <Text style={styles.summaryValue}>${subtotal.toFixed(2)}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Tax:</Text>
                <Text style={styles.summaryValue}>${tax.toFixed(2)}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Shipping:</Text>
                <Text style={styles.summaryValue}>${shipping.toFixed(2)}</Text>
              </View>
              <View style={[styles.summaryRow, styles.totalRow]}>
                <Text style={styles.totalLabel}>Total:</Text>
                <Text style={styles.totalValue}>${finalTotal.toFixed(2)}</Text>
              </View>
            </View>
          </View>

          {/* Payment Method */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Payment Method</Text>
            <View style={styles.paymentMethodCard}>
              <Ionicons 
                name={getPaymentMethodIcon(paymentMethod)} 
                size={24} 
                color={theme.colors.primary[600]} 
              />
              <Text style={styles.paymentMethodText}>
                {getPaymentMethodDisplayName(paymentMethod)}
              </Text>
            </View>
          </View>

          {/* Shipping Address */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Shipping Address</Text>
            {selectedAddress && (
              <View style={styles.addressCard}>
                <Text style={styles.addressText}>
                  {selectedAddress.street}
                </Text>
                <Text style={styles.addressText}>
                  {selectedAddress.city}, {selectedAddress.state} {selectedAddress.zipCode}
                </Text>
                <Text style={styles.addressText}>
                  {selectedAddress.country}
                </Text>
              </View>
            )}
          </View>

          {/* Payment Status */}
          {paymentCollected && (
            <View style={styles.section}>
              <View style={styles.successCard}>
                <Ionicons name="checkmark-circle" size={24} color={theme.colors.success[600]} />
                <Text style={styles.successText}>Payment Collected Successfully</Text>
                <Text style={styles.successSubtext}>Creating your order...</Text>
              </View>
            </View>
          )}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button
          title={isProcessing ? 'Processing...' : `Pay $${finalTotal.toFixed(2)}`}
          onPress={handlePayment}
          disabled={isProcessing || isPaymentLoading}
          style={styles.payButton}
        />
        {isProcessing && (
          <View style={styles.processingContainer}>
            <ActivityIndicator size="small" color={theme.colors.primary[600]} />
            <Text style={styles.processingText}>Please wait while we process your payment...</Text>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginTop: 8,
  },
  subtitle: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    marginTop: 4,
    textAlign: 'center',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 12,
  },
  orderItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  itemName: {
    flex: 1,
    fontSize: 16,
    color: theme.colors.text,
  },
  itemQuantity: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginHorizontal: 12,
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
  },
  orderSummary: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 16,
    color: theme.colors.textSecondary,
  },
  summaryValue: {
    fontSize: 16,
    color: theme.colors.text,
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    paddingTop: 8,
    marginTop: 8,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  totalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.primary[600],
  },
  paymentMethodCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  paymentMethodText: {
    fontSize: 16,
    color: theme.colors.text,
    marginLeft: 12,
  },
  addressCard: {
    padding: 16,
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  addressText: {
    fontSize: 14,
    color: theme.colors.text,
    marginBottom: 4,
  },
  successCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: theme.colors.success[50],
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.colors.success[200],
  },
  successText: {
    fontSize: 16,
    color: theme.colors.success[700],
    marginLeft: 12,
    flex: 1,
  },
  successSubtext: {
    fontSize: 14,
    color: theme.colors.success[600],
    marginLeft: 12,
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  payButton: {
    marginBottom: 8,
  },
  processingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  processingText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginLeft: 8,
  },
  errorContainer: {
    alignItems: 'center',
    padding: 32,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.error[600],
    marginTop: 16,
    textAlign: 'center',
  },
  errorMessage: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    marginTop: 8,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 24,
  },
  backButton: {
    marginTop: 16,
  },
  backButtonText: {
    fontSize: 16,
    color: theme.colors.primary[600],
    textAlign: 'center',
  },
  testModeBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.warning[50],
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: theme.colors.warning[200],
  },
  testModeIcon: {
    marginRight: 8,
  },
  testModeText: {
    fontSize: 14,
    color: theme.colors.warning[700],
    fontWeight: '500',
  },
  scrollView: {
    flex: 1,
  },
}); 