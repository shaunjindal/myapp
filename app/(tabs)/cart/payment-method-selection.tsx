import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { theme } from '../../../src/styles/theme';
import { Ionicons } from '@expo/vector-icons';
import { useCartStore } from '../../../src/store/cartStore';
import { useAddressStore } from '../../../src/store/addressStore';
import { Button } from '../../../src/components/Button';

interface PaymentMethod {
  id: string;
  name: string;
  subtitle: string;
  icon: string;
  recommended?: boolean;
  comingSoon?: boolean;
}

const paymentMethods: PaymentMethod[] = [
  {
    id: 'upi',
    name: 'UPI',
    subtitle: 'Pay using PhonePe, Paytm, Google Pay & more',
    icon: 'phone-portrait',
    recommended: true,
  },
  {
    id: 'cards',
    name: 'Cards',
    subtitle: 'Credit, Debit & ATM cards',
    icon: 'card',
  },
  {
    id: 'netbanking',
    name: 'Net Banking',
    subtitle: 'All major banks supported',
    icon: 'business',
  },
  {
    id: 'wallets',
    name: 'Wallets',
    subtitle: 'PhonePe, Paytm, Amazon Pay & more',
    icon: 'wallet',
  },
  {
    id: 'cod',
    name: 'Cash on Delivery',
    subtitle: 'Pay when your order arrives',
    icon: 'cash',
  },
];

export default function PaymentMethodSelectionScreen() {
  const router = useRouter();
  const { selectedAddressId } = useLocalSearchParams<{
    selectedAddressId: string;
  }>();
  
  const { items, total } = useCartStore();
  const { addresses } = useAddressStore();
  const [selectedMethod, setSelectedMethod] = useState<string>('upi');

  // Calculate order totals
  const subtotal = total;
  const tax = subtotal * 0.08; // 8% tax
  const shipping = subtotal > 50 ? 0 : 9.99; // Free shipping over $50
  const finalTotal = subtotal + tax + shipping;

  // Get selected address
  const selectedAddress = addresses.find(addr => addr.id === selectedAddressId);

  const handleMethodSelect = (methodId: string) => {
    setSelectedMethod(methodId);
  };

  const handleProceedToPayment = () => {
    if (!selectedMethod) {
      Alert.alert('Error', 'Please select a payment method');
      return;
    }

    if (selectedMethod === 'cod') {
      // For COD, go directly to order creation
      router.push({
        pathname: '/(tabs)/cart/order-processing',
        params: {
          selectedAddressId,
          paymentMethod: 'cash_on_delivery',
          skipPayment: 'true',
        }
      });
    } else {
      // For online payments, go to payment processing
      let mappedPaymentMethod = 'razorpay_card';
      if (selectedMethod === 'upi') {
        mappedPaymentMethod = 'razorpay_upi';
      }
      
      router.push({
        pathname: '/(tabs)/cart/payment-processing-online',
        params: {
          selectedAddressId,
          paymentMethod: mappedPaymentMethod,
          amount: finalTotal.toString(),
        }
      });
    }
  };

  const renderPaymentMethod = (method: PaymentMethod) => {
    const isSelected = selectedMethod === method.id;
    
    return (
      <TouchableOpacity
        key={method.id}
        style={[
          styles.paymentMethodCard,
          isSelected && styles.selectedPaymentMethod,
          method.comingSoon && styles.disabledPaymentMethod,
        ]}
        onPress={() => !method.comingSoon && handleMethodSelect(method.id)}
        disabled={method.comingSoon}
      >
        <View style={styles.paymentMethodContent}>
          <View style={styles.paymentMethodLeft}>
            <View style={[
              styles.paymentMethodIcon,
              isSelected && styles.selectedPaymentMethodIcon
            ]}>
              <Ionicons 
                name={method.icon as any} 
                size={24} 
                color={isSelected ? theme.colors.primary[600] : theme.colors.gray[600]} 
              />
            </View>
            <View style={styles.paymentMethodText}>
              <View style={styles.paymentMethodHeader}>
                <Text style={[
                  styles.paymentMethodName,
                  isSelected && styles.selectedPaymentMethodName
                ]}>
                  {method.name}
                </Text>
                {method.recommended && (
                  <View style={styles.recommendedBadge}>
                    <Text style={styles.recommendedText}>RECOMMENDED</Text>
                  </View>
                )}
                {method.comingSoon && (
                  <View style={styles.comingSoonBadge}>
                    <Text style={styles.comingSoonText}>COMING SOON</Text>
                  </View>
                )}
              </View>
              <Text style={[
                styles.paymentMethodSubtitle,
                method.comingSoon && styles.disabledText
              ]}>
                {method.subtitle}
              </Text>
            </View>
          </View>
          <View style={[
            styles.radioButton,
            isSelected && styles.selectedRadioButton
          ]}>
            {isSelected && (
              <View style={styles.radioButtonInner} />
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content}>
        {/* Amount Summary Card */}
        <View style={styles.amountCard}>
          <View style={styles.amountRow}>
            <Text style={styles.amountLabel}>Total Amount</Text>
            <Text style={styles.amountValue}>${finalTotal.toFixed(2)}</Text>
          </View>
          <View style={styles.amountBreakdown}>
            <View style={styles.breakdownRow}>
              <Text style={styles.breakdownLabel}>Items ({items.length})</Text>
              <Text style={styles.breakdownValue}>${subtotal.toFixed(2)}</Text>
            </View>
            <View style={styles.breakdownRow}>
              <Text style={styles.breakdownLabel}>Tax</Text>
              <Text style={styles.breakdownValue}>${tax.toFixed(2)}</Text>
            </View>
            <View style={styles.breakdownRow}>
              <Text style={styles.breakdownLabel}>Shipping</Text>
              <Text style={styles.breakdownValue}>
                {shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`}
              </Text>
            </View>
          </View>
        </View>

        {/* Delivery Address */}
        {selectedAddress && (
          <View style={styles.addressCard}>
            <View style={styles.addressHeader}>
              <Ionicons name="location" size={20} color={theme.colors.primary[600]} />
              <Text style={styles.addressTitle}>Delivery Address</Text>
            </View>
            <Text style={styles.addressText}>
              {selectedAddress.street}, {selectedAddress.city}, {selectedAddress.state} {selectedAddress.zipCode}
            </Text>
            <TouchableOpacity
              style={styles.changeAddressButton}
              onPress={() => router.back()}
            >
              <Text style={styles.changeAddressText}>Change</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Payment Methods */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Choose Payment Method</Text>
          <View style={styles.paymentMethodsList}>
            {paymentMethods.map(renderPaymentMethod)}
          </View>
        </View>

        {/* Security Note */}
        <View style={styles.securityNote}>
          <Ionicons name="shield-checkmark" size={20} color={theme.colors.success[600]} />
          <Text style={styles.securityText}>
            Your payment information is encrypted and secure
          </Text>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button
          title={selectedMethod === 'cod' ? `Place Order - $${finalTotal.toFixed(2)}` : `Pay $${finalTotal.toFixed(2)}`}
          onPress={handleProceedToPayment}
          disabled={!selectedMethod}
          style={styles.proceedButton}
        />
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
  amountCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: theme.colors.gray[200],
  },
  amountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  amountLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text.primary,
  },
  amountValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.primary[600],
  },
  amountBreakdown: {
    borderTopWidth: 1,
    borderTopColor: theme.colors.gray[200],
    paddingTop: 12,
  },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  breakdownLabel: {
    fontSize: 14,
    color: theme.colors.text.secondary,
  },
  breakdownValue: {
    fontSize: 14,
    color: theme.colors.text.primary,
  },
  addressCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: theme.colors.gray[200],
  },
  addressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  addressTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text.primary,
    marginLeft: 8,
  },
  addressText: {
    fontSize: 14,
    color: theme.colors.text.secondary,
    lineHeight: 20,
    marginBottom: 12,
  },
  changeAddressButton: {
    alignSelf: 'flex-start',
  },
  changeAddressText: {
    fontSize: 14,
    color: theme.colors.primary[600],
    fontWeight: '500',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text.primary,
    marginBottom: 16,
  },
  paymentMethodsList: {
    gap: 12,
  },
  paymentMethodCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.colors.gray[200],
    padding: 16,
  },
  selectedPaymentMethod: {
    borderColor: theme.colors.primary[600],
    backgroundColor: theme.colors.primary[50],
  },
  disabledPaymentMethod: {
    opacity: 0.5,
  },
  paymentMethodContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  paymentMethodLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  paymentMethodIcon: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: theme.colors.gray[100],
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  selectedPaymentMethodIcon: {
    backgroundColor: theme.colors.primary[100],
  },
  paymentMethodText: {
    flex: 1,
  },
  paymentMethodHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  paymentMethodName: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text.primary,
  },
  selectedPaymentMethodName: {
    color: theme.colors.primary[700],
  },
  paymentMethodSubtitle: {
    fontSize: 14,
    color: theme.colors.text.secondary,
  },
  disabledText: {
    color: theme.colors.gray[400],
  },
  recommendedBadge: {
    backgroundColor: theme.colors.success[100],
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 8,
  },
  recommendedText: {
    fontSize: 10,
    fontWeight: '600',
    color: theme.colors.success[700],
  },
  comingSoonBadge: {
    backgroundColor: theme.colors.gray[100],
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 8,
  },
  comingSoonText: {
    fontSize: 10,
    fontWeight: '600',
    color: theme.colors.gray[600],
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: theme.colors.gray[300],
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedRadioButton: {
    borderColor: theme.colors.primary[600],
  },
  radioButtonInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: theme.colors.primary[600],
  },
  securityNote: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.success[50],
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  securityText: {
    fontSize: 14,
    color: theme.colors.success[700],
    marginLeft: 8,
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: theme.colors.gray[200],
    backgroundColor: theme.colors.surface,
  },
  proceedButton: {
    marginBottom: 0,
  },
}); 