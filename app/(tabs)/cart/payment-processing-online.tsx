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
} from 'react-native';
import { useRouter, useLocalSearchParams, useFocusEffect } from 'expo-router';
import { theme } from '../../../src/styles/theme';
import { Ionicons } from '@expo/vector-icons';
import { useCartStore } from '../../../src/store/cartStore';
import { useAuthStore } from '../../../src/store/authStore';
import { useOrderStore } from '../../../src/store/orderStore';
import { useRazorpayPayment } from '../../../src/hooks/useRazorpayPayment';
import orderService from '../../../src/services/orderService';
import { PaymentMethod } from '../../../src/types/order';
import { Button } from '../../../src/components/Button';

export default function PaymentProcessingOnlineScreen() {
  const router = useRouter();
  const { selectedAddressId, paymentMethod, amount } = useLocalSearchParams<{
    selectedAddressId: string;
    paymentMethod: string;
    amount: string;
  }>();
  
  const { clearCart, items, total } = useCartStore();
  const { user } = useAuthStore();
  const { addNewOrder } = useOrderStore();
  const { initiatePayment, isLoading: isPaymentLoading } = useRazorpayPayment();
  
  const [step, setStep] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [paymentCollected, setPaymentCollected] = useState(false);
  const [paymentData, setPaymentData] = useState<{
    paymentId: string;
    orderId: string;
    signature: string;
  } | null>(null);

  const finalAmount = parseFloat(amount || '0');

  // Prevent back button during payment processing
  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => {
        if (step > 0) {
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
    }, [step])
  );



  const steps = [
    { title: 'Ready to Pay', icon: 'card' },
    { title: 'Processing Payment', icon: 'sync' },
    { title: 'Creating Order', icon: 'cube' },
    { title: 'Order Confirmed', icon: 'checkmark-circle' },
  ];

  const mapPaymentMethod = (method: string): PaymentMethod => {
    switch (method.toLowerCase()) {
      case 'razorpay_card':
        return PaymentMethod.RAZORPAY_CARD;
      case 'razorpay_upi':
        return PaymentMethod.RAZORPAY_UPI;
      default:
        return PaymentMethod.RAZORPAY_CARD;
    }
  };

  const getPaymentMethodDisplayName = (method: string) => {
    switch (method.toLowerCase()) {
      case 'razorpay_card':
        return 'Card Payment';
      case 'razorpay_upi':
        return 'UPI Payment';
      default:
        return 'Online Payment';
    }
  };

  const getPaymentMethodIcon = (method: string) => {
    switch (method.toLowerCase()) {
      case 'razorpay_card':
        return 'card';
      case 'razorpay_upi':
        return 'phone-portrait';
      default:
        return 'card';
    }
  };

  const initiatePaymentProcess = async () => {
    if (!user || !selectedAddressId || !paymentMethod) {
      setError('Missing required information');
      return;
    }

    try {
      // Step 1: Processing Payment
      setStep(1);
      setError(null);

             const paymentResult = await initiatePayment({
         amount: finalAmount,
         currency: 'INR',
         orderId: `temp_${Date.now()}`,
         name: 'E-Commerce App',
         description: `${getPaymentMethodDisplayName(paymentMethod || 'razorpay_card')} for cart items (${items.length} items)`,
         email: user.email || 'user@example.com',
         receipt: `receipt_${Date.now()}`
       });

      if (!paymentResult.success) {
        throw new Error(paymentResult.error || 'Payment failed');
      }

      // Step 2: Payment successful, store payment data
      setPaymentData({
        paymentId: paymentResult.paymentId!,
        orderId: paymentResult.orderId!,
        signature: paymentResult.signature!
      });
      setPaymentCollected(true);
      
      // Step 3: Creating Order
      setStep(2);
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mappedPaymentMethod = mapPaymentMethod(paymentMethod);
      const orderRequest = {
        billingAddressId: selectedAddressId,
        shippingAddressId: selectedAddressId,
        paymentMethod: mappedPaymentMethod,
        customerNotes: `Payment ID: ${paymentResult.paymentId}, Order ID: ${paymentResult.orderId}`
      };

      const createdOrder = await orderService.createOrderFromCart(orderRequest);
      
      // Step 4: Order Confirmed
      setStep(3);
      
      // Add order to store
      addNewOrder(createdOrder);
      
      // Clear cart
      await clearCart();
      
      // Wait a moment before navigating
      await new Promise(resolve => setTimeout(resolve, 1000));
      
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
      console.error('Payment process failed:', error);
      setError(error.message || 'Payment failed. Please try again.');
      setStep(0); // Reset to initial step
    }
  };

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          <View style={styles.errorContainer}>
            <Ionicons name="alert-circle" size={64} color={theme.colors.error[600]} />
            <Text style={styles.errorTitle}>Payment Failed</Text>
            <Text style={styles.errorMessage}>{error}</Text>
            <Button
              title="Try Again"
              onPress={() => {
                setError(null);
                setStep(0);
                setPaymentCollected(false);
                setPaymentData(null);
              }}
              variant="primary"
              size="lg"
              style={styles.retryButton}
            />
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <Ionicons name="arrow-back" size={16} color={theme.colors.text.secondary} />
              <Text style={styles.backButtonText}>Choose Different Payment Method</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Payment Method Card */}
        <View style={styles.paymentCard}>
          <View style={styles.paymentHeader}>
            <View style={styles.paymentIcon}>
              <Ionicons 
                name={getPaymentMethodIcon(paymentMethod || 'razorpay_card')} 
                size={24} 
                color={theme.colors.primary[600]} 
              />
            </View>
            <View style={styles.paymentInfo}>
              <Text style={styles.paymentMethodName}>
                {getPaymentMethodDisplayName(paymentMethod || 'razorpay_card')}
              </Text>
              <Text style={styles.paymentAmount}>${finalAmount.toFixed(2)}</Text>
            </View>
          </View>
        </View>

        {/* Status Section */}
        <View style={styles.statusSection}>
          {step === 0 && (
            <View style={styles.readyContainer}>
              <Text style={styles.statusTitle}>Ready to Pay</Text>
              <Text style={styles.statusSubtitle}>
                Tap the button below to proceed with your secure payment
              </Text>
            </View>
          )}

          {step > 0 && (
            <View style={styles.processingContainer}>
              <View style={styles.processingIcon}>
                <ActivityIndicator size="large" color={theme.colors.primary[600]} />
              </View>
              <Text style={styles.statusTitle}>
                {step === 1 ? 'Processing Payment' : step === 2 ? 'Creating Order' : 'Order Confirmed'}
              </Text>
              <Text style={styles.statusSubtitle}>
                {step === 1 
                  ? 'Securely processing your payment...'
                  : step === 2 
                  ? 'Payment successful! Creating your order...'
                  : 'Your order has been created successfully!'
                }
              </Text>
            </View>
          )}

          <View style={styles.progressBadge}>
            <Text style={styles.progressText}>
              Step {step + 1} of {steps.length}
            </Text>
          </View>
        </View>

        {/* Steps Card */}
        <View style={styles.stepsCard}>
          <Text style={styles.stepsTitle}>Payment Progress</Text>
          <View style={styles.stepsList}>
            {steps.map((stepItem, index) => (
              <View key={index} style={styles.stepRow}>
                <View style={[
                  styles.stepIconContainer,
                  index <= step ? styles.stepActive : styles.stepInactive
                ]}>
                  {index < step ? (
                    <Ionicons name="checkmark" size={16} color={theme.colors.success[600]} />
                  ) : index === step && step > 0 ? (
                    <ActivityIndicator size="small" color={theme.colors.primary[600]} />
                  ) : (
                    <Ionicons name={stepItem.icon as any} size={16} color={theme.colors.gray[400]} />
                  )}
                </View>
                <Text style={[
                  styles.stepLabel,
                  index <= step ? styles.stepLabelActive : styles.stepLabelInactive
                ]}>
                  {stepItem.title}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Success Card */}
        {paymentCollected && (
          <View style={styles.successCard}>
            <View style={styles.successIcon}>
              <Ionicons name="checkmark-circle" size={20} color={theme.colors.success[600]} />
            </View>
            <View style={styles.successContent}>
              <Text style={styles.successTitle}>Payment Collected Successfully</Text>
              {paymentData && (
                <Text style={styles.paymentId}>Payment ID: {paymentData.paymentId}</Text>
              )}
            </View>
          </View>
        )}
      </View>

      {/* Action Footer */}
      {step === 0 && (
        <View style={styles.footer}>
          <Button
            title={`Pay $${finalAmount.toFixed(2)}`}
            onPress={initiatePaymentProcess}
            disabled={isPaymentLoading}
            variant="primary"
            size="lg"
            fullWidth
          />
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={16} color={theme.colors.text.secondary} />
            <Text style={styles.backButtonText}>Choose Different Method</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.surface,
  },
  content: {
    flex: 1,
    padding: theme.spacing.md,
  },
  
  // Payment Method Card
  paymentCard: {
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    ...theme.shadows.md,
  },
  paymentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  paymentIcon: {
    width: 48,
    height: 48,
    borderRadius: theme.borderRadius.lg,
    backgroundColor: theme.colors.primary[50],
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.md,
  },
  paymentInfo: {
    flex: 1,
  },
  paymentMethodName: {
    fontSize: theme.typography.sizes.base,
    fontWeight: '600',
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs,
  },
  paymentAmount: {
    fontSize: theme.typography.sizes.xl,
    fontWeight: '700',
    color: theme.colors.primary[600],
  },
  
  // Status Section
  statusSection: {
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    alignItems: 'center',
    ...theme.shadows.md,
  },
  readyContainer: {
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  processingContainer: {
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  processingIcon: {
    marginBottom: theme.spacing.sm,
  },
  statusTitle: {
    fontSize: theme.typography.sizes.xl,
    fontWeight: '700',
    color: theme.colors.text.primary,
    textAlign: 'center',
    marginBottom: theme.spacing.xs,
  },
  statusSubtitle: {
    fontSize: theme.typography.sizes.base,
    color: theme.colors.text.secondary,
    textAlign: 'center',
    lineHeight: theme.typography.lineHeights.relaxed * theme.typography.sizes.base,
  },
  progressBadge: {
    backgroundColor: theme.colors.primary[50],
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.full,
    borderWidth: 1,
    borderColor: theme.colors.primary[200],
  },
  progressText: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.primary[700],
    fontWeight: '600',
  },
  
  // Steps Card
  stepsCard: {
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    ...theme.shadows.md,
  },
  stepsTitle: {
    fontSize: theme.typography.sizes.lg,
    fontWeight: '600',
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.sm,
  },
  stepsList: {
    gap: theme.spacing.md,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stepIconContainer: {
    width: 32,
    height: 32,
    borderRadius: theme.borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.md,
  },
  stepActive: {
    backgroundColor: theme.colors.primary[50],
    borderWidth: 2,
    borderColor: theme.colors.primary[200],
  },
  stepInactive: {
    backgroundColor: theme.colors.gray[100],
  },
  stepLabel: {
    fontSize: theme.typography.sizes.base,
    fontWeight: '500',
    flex: 1,
  },
  stepLabelActive: {
    color: theme.colors.text.primary,
  },
  stepLabelInactive: {
    color: theme.colors.text.secondary,
  },
  
  // Success Card
  successCard: {
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.success[200],
    ...theme.shadows.md,
  },
  successIcon: {
    width: 40,
    height: 40,
    borderRadius: theme.borderRadius.lg,
    backgroundColor: theme.colors.success[50],
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.md,
  },
  successContent: {
    flex: 1,
  },
  successTitle: {
    fontSize: theme.typography.sizes.base,
    fontWeight: '600',
    color: theme.colors.success[700],
    marginBottom: theme.spacing.xs,
  },
  paymentId: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.success[600],
  },
  
  // Footer
  footer: {
    backgroundColor: theme.colors.background,
    padding: theme.spacing.md,
    paddingBottom: theme.spacing.md + theme.spacing.sm, // Safe area
    borderTopWidth: 1,
    borderTopColor: theme.colors.gray[200],
    ...theme.shadows.md,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.sm,
    marginTop: theme.spacing.sm,
  },
  backButtonText: {
    fontSize: theme.typography.sizes.base,
    color: theme.colors.text.secondary,
    marginLeft: theme.spacing.sm,
  },
  
  // Error States
  errorContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    padding: theme.spacing['3xl'],
  },
  errorTitle: {
    fontSize: theme.typography.sizes['2xl'],
    fontWeight: '700',
    color: theme.colors.error[600],
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.sm,
    textAlign: 'center',
  },
  errorMessage: {
    fontSize: theme.typography.sizes.base,
    color: theme.colors.text.secondary,
    textAlign: 'center',
    marginBottom: theme.spacing['2xl'],
    lineHeight: theme.typography.lineHeights.relaxed * theme.typography.sizes.base,
  },
  retryButton: {
    marginBottom: theme.spacing.lg,
  },
}); 