import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  Alert,
  BackHandler,
} from 'react-native';
import { useRouter, useLocalSearchParams, useFocusEffect } from 'expo-router';
import { theme } from '../../../src/styles/theme';
import { Ionicons } from '@expo/vector-icons';
import { useCartStore } from '../../../src/store/cartStore';
import { useAuthStore } from '../../../src/store/authStore';
import { useOrderStore } from '../../../src/store/orderStore';
import orderService from '../../../src/services/orderService';
import { PaymentMethod } from '../../../src/types/order';

export default function OrderProcessingScreen() {
  const router = useRouter();
  const { selectedAddressId, paymentMethod, skipPayment } = useLocalSearchParams<{
    selectedAddressId: string;
    paymentMethod: string;
    skipPayment?: string;
  }>();
  
  const { clearCart, items, total } = useCartStore();
  const { user } = useAuthStore();
  const { addNewOrder } = useOrderStore();
  const [step, setStep] = useState(0);
  const [error, setError] = useState<string | null>(null);

  // Prevent back button during order processing
  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => {
        Alert.alert(
          'Order Processing',
          'Please do not go back while we process your order.',
          [{ text: 'Stay Here', style: 'default' }]
        );
        return true;
      };

      const backHandler = BackHandler.addEventListener('hardwareBackPress', onBackPress);
      return () => backHandler.remove();
    }, [])
  );

  const steps = [
    { title: 'Validating Order', icon: 'checkmark-circle' },
    { title: 'Processing Order', icon: 'cube' },
    { title: 'Confirming Details', icon: 'document' },
  ];

  useEffect(() => {
    const processOrder = async () => {
      if (!user || !selectedAddressId || !paymentMethod) {
        setError('Missing required information');
        return;
      }

      try {
        // Step 1: Validating Order
        setStep(0);
        await new Promise(resolve => setTimeout(resolve, 1500));

        // Step 2: Processing Order
        setStep(1);
        await new Promise(resolve => setTimeout(resolve, 1500));

        // Step 3: Confirming Details
        setStep(2);
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Map payment method
        const mapPaymentMethod = (method: string): PaymentMethod => {
          switch (method.toLowerCase()) {
            case 'cash_on_delivery':
              return PaymentMethod.CASH_ON_DELIVERY;
            case 'credit_card':
              return PaymentMethod.CREDIT_CARD;
            case 'debit_card':
              return PaymentMethod.DEBIT_CARD;
            case 'razorpay_card':
              return PaymentMethod.RAZORPAY_CARD;
            case 'razorpay_upi':
              return PaymentMethod.RAZORPAY_UPI;
            default:
              return PaymentMethod.CASH_ON_DELIVERY;
          }
        };

        const mappedPaymentMethod = mapPaymentMethod(paymentMethod);
        
        // Create order request
        const orderRequest = {
          billingAddressId: selectedAddressId,
          shippingAddressId: selectedAddressId,
          paymentMethod: mappedPaymentMethod,
          customerNotes: mappedPaymentMethod === PaymentMethod.CASH_ON_DELIVERY 
            ? 'Cash on Delivery - Payment will be collected upon delivery' 
            : 'Order placed successfully'
        };

        const createdOrder = await orderService.createOrderFromCart(orderRequest);
        
        // Add order to store
        addNewOrder(createdOrder);
        
        // Clear cart
        await clearCart();
        
        // Wait a moment before navigating
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Navigate to success screen
        router.replace({
          pathname: '/(tabs)/cart/order-success',
          params: { 
            orderNumber: createdOrder.orderNumber, 
            orderId: createdOrder.id 
          }
        });
        
      } catch (error: any) {
        console.error('Order processing failed:', error);
        setError('Failed to process order. Please try again.');
        
        // Navigate back to payment method selection after showing error
        setTimeout(() => {
          router.back();
        }, 3000);
      }
    };

    processOrder();
  }, [user, selectedAddressId, paymentMethod, clearCart, router, addNewOrder]);

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          <View style={styles.header}>
            <View style={styles.errorContainer}>
              <Ionicons name="alert-circle" size={80} color={theme.colors.error[600]} />
            </View>
            <Text style={styles.errorTitle}>Order Processing Failed</Text>
            <Text style={styles.subtitle}>{error}</Text>
            <Text style={styles.redirectText}>Redirecting you back...</Text>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.colors.primary[600]} />
          </View>
          <Text style={styles.title}>
            {paymentMethod === 'cash_on_delivery' ? 'Processing Your Order' : 'Finalizing Your Order'}
          </Text>
          <Text style={styles.subtitle}>
            {paymentMethod === 'cash_on_delivery' 
              ? 'Your order is being processed. Payment will be collected upon delivery.'
              : 'Your order is being finalized. Please keep this screen open.'
            }
          </Text>
          <View style={styles.progressIndicator}>
            <Text style={styles.progressText}>
              Step {step + 1} of {steps.length}
            </Text>
          </View>
        </View>

        <View style={styles.stepsContainer}>
          {steps.map((stepItem, index) => (
            <View key={index} style={styles.step}>
              <View style={[
                styles.stepIcon,
                index <= step ? styles.stepIconActive : styles.stepIconInactive
              ]}>
                {index < step ? (
                  <Ionicons name="checkmark" size={24} color={theme.colors.success[600]} />
                ) : index === step ? (
                  <ActivityIndicator size="small" color={theme.colors.primary[600]} />
                ) : (
                  <Ionicons name={stepItem.icon as any} size={24} color={theme.colors.gray[400]} />
                )}
              </View>
              <Text style={[
                styles.stepText,
                index <= step ? styles.stepTextActive : styles.stepTextInactive
              ]}>
                {stepItem.title}
              </Text>
            </View>
          ))}
        </View>

        {paymentMethod === 'cash_on_delivery' && (
          <View style={styles.codInfoCard}>
            <Ionicons name="cash" size={32} color={theme.colors.warning[600]} />
            <View style={styles.codInfoText}>
              <Text style={styles.codInfoTitle}>Cash on Delivery</Text>
              <Text style={styles.codInfoSubtitle}>
                You can pay in cash when your order is delivered to your doorstep.
              </Text>
            </View>
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
    padding: 24,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 48,
  },
  loadingContainer: {
    marginBottom: 24,
  },
  errorContainer: {
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.text.primary,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: theme.colors.text.secondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 16,
  },
  progressIndicator: {
    backgroundColor: theme.colors.primary[50],
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  progressText: {
    fontSize: 14,
    color: theme.colors.primary[700],
    fontWeight: '500',
  },
  stepsContainer: {
    marginBottom: 32,
  },
  step: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  stepIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  stepIconActive: {
    backgroundColor: theme.colors.primary[50],
  },
  stepIconInactive: {
    backgroundColor: theme.colors.gray[100],
  },
  stepText: {
    fontSize: 16,
    fontWeight: '500',
  },
  stepTextActive: {
    color: theme.colors.text.primary,
  },
  stepTextInactive: {
    color: theme.colors.text.secondary,
  },
  codInfoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.warning[50],
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.colors.warning[200],
  },
  codInfoText: {
    flex: 1,
    marginLeft: 12,
  },
  codInfoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.warning[800],
    marginBottom: 4,
  },
  codInfoSubtitle: {
    fontSize: 14,
    color: theme.colors.warning[700],
    lineHeight: 20,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.error[600],
    textAlign: 'center',
    marginBottom: 8,
  },
  redirectText: {
    fontSize: 14,
    color: theme.colors.text.secondary,
    textAlign: 'center',
    marginTop: 16,
  },
}); 