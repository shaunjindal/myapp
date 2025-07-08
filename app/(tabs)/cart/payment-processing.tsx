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
import { useAddressStore } from '../../../src/store/addressStore';
import { useOrderStore } from '../../../src/store/orderStore';
import orderService from '../../../src/services/orderService';
import { PaymentMethod } from '../../../src/types/order';

export default function PaymentProcessingScreen() {
  const router = useRouter();
  const { selectedAddressId, paymentMethod } = useLocalSearchParams<{
    selectedAddressId: string;
    paymentMethod: string;
  }>();
  
  const { clearCart } = useCartStore();
  const { user } = useAuthStore();
  const { addresses } = useAddressStore();
  const { addNewOrder } = useOrderStore();
  const [step, setStep] = useState(0);
  const [error, setError] = useState<string | null>(null);

  // Prevent back button during payment processing
  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => {
        // Show alert instead of allowing back navigation
        Alert.alert(
          'Payment in Progress',
          'Please do not go back while we process your payment. This may cause issues with your order.',
          [
            {
              text: 'Stay Here',
              style: 'default'
            }
          ]
        );
        return true; // Prevent default back action
      };

      const backHandler = BackHandler.addEventListener('hardwareBackPress', onBackPress);
      
      return () => backHandler.remove();
    }, [])
  );

  const steps = [
    { title: 'Processing Payment', icon: 'card' },
    { title: 'Verifying Transaction', icon: 'shield-checkmark' },
    { title: 'Confirming Order', icon: 'checkmark-circle' },
  ];

  useEffect(() => {
    const processOrder = async () => {
      if (!user || !selectedAddressId || !paymentMethod) {
        setError('Missing required information');
        return;
      }

      try {
        // Step 1: Processing Payment
        setStep(0);
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Step 2: Verifying Transaction
        setStep(1);
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Step 3: Confirming Order
        setStep(2);
        
        // Create order from cart
        // Map frontend payment method to backend enum
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
            default:
              return PaymentMethod.CREDIT_CARD; // Default fallback
          }
        };

        const orderRequest = {
          billingAddressId: selectedAddressId,
          shippingAddressId: selectedAddressId,
          paymentMethod: mapPaymentMethod(paymentMethod),
          customerNotes: ''
        };

        const order = await orderService.createOrderFromCart(orderRequest);
        
        // Add order to the simple store
        addNewOrder(order);
        
        // Clear cart after successful order creation
        await clearCart();
        
        // Wait a moment before navigating
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Navigate to success screen with order data
        router.replace({
          pathname: '/(tabs)/cart/order-success',
          params: { orderNumber: order.orderNumber, orderId: order.id }
        });
        
      } catch (error) {
        console.error('Order creation failed:', error);
        setError('Failed to process order. Please try again.');
        
        // Navigate back to checkout after showing error
        setTimeout(() => {
          router.back();
        }, 2000);
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
            <Text style={styles.errorTitle}>Order Failed</Text>
            <Text style={styles.subtitle}>{error}</Text>
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
          <Text style={styles.title}>Securely Processing Your Payment</Text>
          <Text style={styles.subtitle}>
            Your transaction is being processed safely. Please keep this screen open and do not navigate away.
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
                styles.stepTitle,
                index <= step ? styles.stepTitleActive : styles.stepTitleInactive
              ]}>
                {stepItem.title}
              </Text>
              {index < step && (
                <Text style={styles.stepCompleted}>Completed</Text>
              )}
            </View>
          ))}
        </View>

        <View style={styles.footer}>
          <View style={styles.warningContainer}>
            <Ionicons name="warning" size={20} color={theme.colors.warning[600]} />
            <Text style={styles.warningText}>
              Do not close this app or navigate away
            </Text>
          </View>
          <Text style={styles.footerText}>
            Please wait while we securely process your payment. This process is encrypted and may take a few moments to complete.
          </Text>
          <Text style={styles.supportText}>
            If you experience any issues, our support team will help resolve them quickly.
          </Text>
          <View style={styles.securityBadge}>
            <Ionicons name="shield-checkmark" size={16} color={theme.colors.success[600]} />
            <Text style={styles.securityText}>Secured by SSL encryption</Text>
          </View>
        </View>
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
    padding: theme.spacing.lg,
    justifyContent: 'space-between',
  },
  header: {
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  loadingContainer: {
    marginBottom: theme.spacing.lg,
  },
  title: {
    fontSize: theme.typography.sizes.xl,
    fontWeight: '700',
    color: theme.colors.text.primary,
    textAlign: 'center',
    marginBottom: theme.spacing.sm,
  },
  subtitle: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.text.secondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  progressIndicator: {
    marginTop: theme.spacing.md,
  },
  progressText: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.text.secondary,
  },
  stepsContainer: {
    flex: 1,
    justifyContent: 'center',
    marginVertical: theme.spacing.lg,
  },
  step: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  stepIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.md,
  },
  stepIconActive: {
    backgroundColor: theme.colors.primary[50],
    borderWidth: 2,
    borderColor: theme.colors.primary[200],
  },
  stepIconInactive: {
    backgroundColor: theme.colors.gray[100],
    borderWidth: 2,
    borderColor: theme.colors.gray[200],
  },
  stepTitle: {
    fontSize: theme.typography.sizes.base,
    fontWeight: '600',
    flex: 1,
  },
  stepTitleActive: {
    color: theme.colors.text.primary,
  },
  stepTitleInactive: {
    color: theme.colors.text.secondary,
  },
  stepCompleted: {
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.success[600],
    fontWeight: '500',
  },
  footer: {
    alignItems: 'center',
  },
  warningContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.warning[50],
    borderWidth: 1,
    borderColor: theme.colors.warning[200],
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  warningText: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.warning[700],
    fontWeight: '600',
    marginLeft: theme.spacing.sm,
  },
  footerText: {
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.text.secondary,
    textAlign: 'center',
    lineHeight: 16,
  },
  supportText: {
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.text.secondary,
    textAlign: 'center',
    marginTop: theme.spacing.sm,
    lineHeight: 16,
  },
  securityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.success[50],
    borderWidth: 1,
    borderColor: theme.colors.success[200],
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.sm,
    marginTop: theme.spacing.md,
  },
  securityText: {
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.success[700],
    fontWeight: '500',
    marginLeft: theme.spacing.sm,
  },
  errorContainer: {
    marginBottom: theme.spacing.lg,
  },
  errorTitle: {
    fontSize: theme.typography.sizes.xl,
    fontWeight: '700',
    color: theme.colors.error[600],
    textAlign: 'center',
    marginBottom: theme.spacing.sm,
  },
}); 