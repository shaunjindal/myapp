import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Alert,
  Modal,
  ActivityIndicator,
  Animated,
  Dimensions,
  TouchableWithoutFeedback,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useCartStore } from '../../../src/store/cartStore';
import { useAddressStore } from '../../../src/store/addressStore';
import { Button } from '../../../src/components/Button';
import { Input } from '../../../src/components/Input';
import { AddAddressModal } from '../../../src/components/AddAddressModal';
import { OrderSummary } from '../../../src/components/OrderSummary';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../../src/styles/theme';
import { AddressDto } from '../../../src/types/api';

const { height: screenHeight } = Dimensions.get('window');

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

export default function CheckoutScreen() {
  const router = useRouter();
  const { items, total } = useCartStore();
  const { addresses, loading: addressesLoading, fetchAddresses } = useAddressStore();
  
  // Address states
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [showAddAddressModal, setShowAddAddressModal] = useState(false);
  const [showAddressBottomSheet, setShowAddressBottomSheet] = useState(false);
  
  // Payment method state
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('upi');
  
  // Order summary collapse state
  const [isOrderSummaryExpanded, setIsOrderSummaryExpanded] = useState(false);
  
  // Animation values for bottom sheet
  const slideAnim = useRef(new Animated.Value(screenHeight)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;
  
  const [loading, setLoading] = useState(false);

  // Fetch addresses when component mounts (will use cache if available)
  useEffect(() => {
    fetchAddresses();
  }, [fetchAddresses]);

  // Auto-select default address if available, or first address
  useEffect(() => {
    if (addresses.length > 0 && !selectedAddressId) {
      const defaultAddress = addresses.find((addr: AddressDto) => addr.isDefault);
      if (defaultAddress) {
        setSelectedAddressId(defaultAddress.id);
        console.log('✅ Checkout: Auto-selected default address:', defaultAddress.id);
      } else {
        // Select the first address if no default is set (newly added will be first)
        setSelectedAddressId(addresses[0].id);
        console.log('✅ Checkout: Auto-selected first address:', addresses[0].id);
      }
    }
  }, [addresses, selectedAddressId]);

  // Bottom sheet animation functions
  const showBottomSheet = () => {
    setShowAddressBottomSheet(true);
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(backdropOpacity, {
        toValue: 0.5,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const hideBottomSheet = () => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: screenHeight,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(backdropOpacity, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setShowAddressBottomSheet(false);
    });
  };

  // Reset animations when bottom sheet visibility changes
  useEffect(() => {
    if (!showAddressBottomSheet) {
      slideAnim.setValue(screenHeight);
      backdropOpacity.setValue(0);
    }
  }, [showAddressBottomSheet]);

  const handleAddNewAddress = async (createdAddress?: AddressDto) => {
    if (createdAddress) {
      console.log('🏠 Checkout: New address created:', createdAddress.id);
      // Clear current selection so useEffect will select the new address (which will be first in list)
      setSelectedAddressId(null);
      hideBottomSheet();
    }
  };

  const handleAddressSelect = (addressId: string) => {
    setSelectedAddressId(addressId);
    hideBottomSheet();
  };

  const handlePaymentMethodSelect = (methodId: string) => {
    setSelectedPaymentMethod(methodId);
  };

  const handleProceedToPayment = () => {
    // Validate address selection
    if (!selectedAddressId) {
      Alert.alert('Error', 'Please select a shipping address');
      return;
    }

    // Validate payment method selection
    if (!selectedPaymentMethod) {
      Alert.alert('Error', 'Please select a payment method');
      return;
    }

    setLoading(true);
    
    if (selectedPaymentMethod === 'cod') {
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
      if (selectedPaymentMethod === 'upi') {
        mappedPaymentMethod = 'razorpay_upi';
      }
      
      router.push({
        pathname: '/(tabs)/cart/payment-processing-online',
        params: {
          selectedAddressId,
          paymentMethod: mappedPaymentMethod,
          amount: total.toString(),
        }
      });
    }
  };

  const renderPaymentMethod = (method: PaymentMethod) => {
    const isSelected = selectedPaymentMethod === method.id;
    
    return (
      <TouchableOpacity
        key={method.id}
        style={[
          styles.paymentMethodCard,
          isSelected && styles.selectedPaymentMethod,
          method.comingSoon && styles.disabledPaymentMethod,
        ]}
        onPress={() => !method.comingSoon && handlePaymentMethodSelect(method.id)}
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

  // Calculate shipping based on subtotal
  const shipping = total > 50 ? 0 : 9.99; // Free shipping over $50
  const finalTotal = total + (total * 0.08) + shipping;

  // Get the selected address or default address
  const selectedAddress = addresses.find((addr: AddressDto) => addr.id === selectedAddressId);
  const defaultAddress = addresses.find((addr: AddressDto) => addr.isDefault);
  const displayAddress = selectedAddress || defaultAddress || addresses[0];

  const renderAddressOption = (address: AddressDto, isSelected: boolean) => (
    <TouchableOpacity
      key={address.id}
      style={[styles.addressOption, isSelected && styles.selectedAddress]}
      onPress={() => handleAddressSelect(address.id)}
    >
      <View style={styles.addressContent}>
        <View style={styles.addressHeader}>
          <Text style={styles.addressType}>
            {address.type === 'SHIPPING' ? 'Home' : address.type === 'BILLING' ? 'Work' : 'Other'}
          </Text>
          {address.isDefault && (
            <View style={styles.defaultBadge}>
              <Text style={styles.defaultBadgeText}>Default</Text>
            </View>
          )}
        </View>
        <Text style={styles.addressText}>
          {address.street}
        </Text>
        <Text style={styles.addressText}>
          {address.city}, {address.state} {address.zipCode}
        </Text>
        <Text style={styles.addressText}>
          {address.country}
        </Text>
      </View>
      {isSelected && (
        <Ionicons name="checkmark-circle" size={24} color={theme.colors.success[600]} />
      )}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Order Summary Card */}
        <OrderSummary
          items={items}
          shippingCost={shipping}
          showItems={true}
          collapsible={true}
          isExpanded={isOrderSummaryExpanded}
          onToggleExpanded={() => setIsOrderSummaryExpanded(!isOrderSummaryExpanded)}
        />

        {/* Shipping Address Card */}
        <View style={styles.addressCard}>
          <View style={styles.cardHeader}>
            <View style={styles.cardIcon}>
              <Ionicons name="location-outline" size={20} color={theme.colors.primary[600]} />
            </View>
            <Text style={styles.cardTitle}>Shipping Address</Text>
          </View>

          {addressesLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color={theme.colors.primary[600]} />
              <Text style={styles.loadingText}>Loading addresses...</Text>
            </View>
          ) : addresses.length === 0 ? (
            <View style={styles.noAddressesContainer}>
              <View style={styles.emptyStateIcon}>
                <Ionicons name="location-outline" size={32} color={theme.colors.gray[400]} />
              </View>
              <Text style={styles.noAddressesText}>No saved addresses</Text>
              <Text style={styles.noAddressesSubtext}>Add your first address to continue</Text>
              <TouchableOpacity
                style={styles.addFirstAddressButton}
                onPress={() => setShowAddAddressModal(true)}
              >
                <Ionicons name="add" size={20} color={theme.colors.primary[600]} />
                <Text style={styles.addFirstAddressText}>Add Your First Address</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.addressContainer}>
              {/* Display Selected Address */}
              {displayAddress && (
                <View style={styles.selectedAddressCard}>
                  <View style={styles.addressContent}>
                    <View style={styles.addressHeader}>
                      <View style={styles.addressTypeContainer}>
                        <View style={styles.addressTypeIcon}>
                          <Ionicons 
                            name={displayAddress.type === 'SHIPPING' ? 'home' : displayAddress.type === 'BILLING' ? 'business' : 'location'} 
                            size={16} 
                            color={theme.colors.primary[600]} 
                          />
                        </View>
                        <Text style={styles.addressTypeLabel}>
                          {displayAddress.type === 'SHIPPING' ? 'Home' : displayAddress.type === 'BILLING' ? 'Work' : 'Other'}
                        </Text>
                        {displayAddress.isDefault && (
                          <View style={styles.defaultBadge}>
                            <Text style={styles.defaultBadgeText}>Default</Text>
                          </View>
                        )}
                      </View>
                    </View>
                    <View style={styles.addressDetails}>
                      <Text style={styles.addressText}>{displayAddress.street}</Text>
                      <Text style={styles.addressText}>
                        {displayAddress.city}, {displayAddress.state} {displayAddress.zipCode}
                      </Text>
                      <Text style={styles.addressText}>{displayAddress.country}</Text>
                    </View>
                  </View>
                  <View style={styles.selectedIndicator}>
                    <Ionicons name="checkmark-circle" size={24} color={theme.colors.success[600]} />
                  </View>
                </View>
              )}

              {/* Address Selection Button */}
              {addresses.length > 1 && (
                <TouchableOpacity
                  style={styles.changeAddressButton}
                  onPress={showBottomSheet}
                >
                  <Ionicons name="swap-horizontal" size={18} color={theme.colors.primary[600]} />
                  <Text style={styles.changeAddressButtonText}>Change Address</Text>
                  <Ionicons name="chevron-down" size={16} color={theme.colors.primary[600]} />
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>

        {/* Payment Method Selection Card */}
        <View style={styles.paymentCard}>
          <View style={styles.cardHeader}>
            <View style={styles.cardIcon}>
              <Ionicons name="card-outline" size={20} color={theme.colors.primary[600]} />
            </View>
            <Text style={styles.cardTitle}>Payment Method</Text>
          </View>

          <View style={styles.paymentMethodsList}>
            {paymentMethods.map(renderPaymentMethod)}
          </View>

          {/* Security Note */}
          <View style={styles.securityNote}>
            <Ionicons name="shield-checkmark" size={20} color={theme.colors.success[600]} />
            <Text style={styles.securityText}>
              Your payment information is encrypted and secure
            </Text>
          </View>
        </View>

      </ScrollView>

      {/* Address Selection Bottom Sheet */}
      {showAddressBottomSheet && (
        <Modal
          visible={showAddressBottomSheet}
          transparent
          animationType="none"
          onRequestClose={hideBottomSheet}
        >
          <View style={styles.bottomSheetContainer}>
            <TouchableWithoutFeedback onPress={hideBottomSheet}>
              <Animated.View
                style={[
                  styles.backdrop,
                  {
                    opacity: backdropOpacity,
                  },
                ]}
              />
            </TouchableWithoutFeedback>
            
            <Animated.View
              style={[
                styles.bottomSheet,
                {
                  transform: [{ translateY: slideAnim }],
                },
              ]}
            >
              {/* Handle */}
              <View style={styles.handle} />

              {/* Header */}
              <View style={styles.bottomSheetHeader}>
                <Text style={styles.bottomSheetTitle}>Select Address</Text>
                <TouchableOpacity onPress={hideBottomSheet} style={styles.closeButton}>
                  <Ionicons name="close" size={24} color={theme.colors.text.primary} />
                </TouchableOpacity>
              </View>
              
              <ScrollView style={styles.bottomSheetContent} showsVerticalScrollIndicator={false}>
                <View style={styles.addressList}>
                  {addresses.map((address) => 
                    renderAddressOption(address, selectedAddressId === address.id)
                  )}
                </View>
                
                <TouchableOpacity
                  style={styles.addNewAddressButton}
                  onPress={() => {
                    hideBottomSheet();
                    setTimeout(() => setShowAddAddressModal(true), 300);
                  }}
                >
                  <Ionicons name="add" size={20} color={theme.colors.primary[600]} />
                  <Text style={styles.addNewAddressText}>Add New Address</Text>
                </TouchableOpacity>
              </ScrollView>
            </Animated.View>
          </View>
        </Modal>
      )}

      {/* Add Address Modal */}
      <AddAddressModal
        visible={showAddAddressModal}
        onSuccess={handleAddNewAddress}
        onClose={() => setShowAddAddressModal(false)}
      />

      {/* Footer */}
      <View style={styles.footer}>
        <Button
          title={loading ? 'Processing...' : selectedPaymentMethod === 'cod' ? `Place Order - $${finalTotal.toFixed(2)}` : `Pay $${finalTotal.toFixed(2)}`}
          onPress={handleProceedToPayment}
          disabled={loading}
          variant="primary"
          size="lg"
          fullWidth
        />
      </View>
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
  section: {
    marginBottom: theme.spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  sectionTitle: {
    fontSize: theme.typography.sizes.lg,
    fontWeight: '600',
    color: theme.colors.text.primary,
  },
  addAddressButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.gray[50],
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.gray[200],
  },
  addAddressText: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.primary[600],
    fontWeight: '500',
    marginLeft: theme.spacing.xs,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.lg,
  },
  loadingText: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.text.secondary,
    marginLeft: theme.spacing.sm,
  },
  addressList: {
    gap: theme.spacing.md,
    marginBottom: theme.spacing.lg,
  },
  addressOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.gray[200],
  },
  selectedAddress: {
    borderColor: theme.colors.primary[600],
    backgroundColor: theme.colors.primary[50],
  },
  addressContent: {
    flex: 1,
  },
  addressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  addressType: {
    fontSize: theme.typography.sizes.base,
    fontWeight: '600',
    color: theme.colors.text.primary,
  },
  defaultBadge: {
    backgroundColor: theme.colors.success[100],
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.sm,
    marginLeft: theme.spacing.sm,
  },
  defaultBadgeText: {
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.success[700],
    fontWeight: '500',
  },
  addressText: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.xs,
  },
  noAddressesContainer: {
    alignItems: 'center',
    padding: theme.spacing.xl,
    backgroundColor: theme.colors.gray[50],
    borderRadius: theme.borderRadius.lg,
    borderWidth: 2,
    borderColor: theme.colors.gray[200],
    borderStyle: 'dashed',
  },
  noAddressesText: {
    fontSize: theme.typography.sizes.base,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.md,
  },
  noAddressesSubtext: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.md,
  },
  addFirstAddressButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.primary[50],
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.colors.primary[200],
    shadowColor: theme.colors.primary[100],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  addFirstAddressText: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.primary[600],
    fontWeight: '500',
    marginLeft: theme.spacing.sm,
  },

  inputContainer: {
    gap: theme.spacing.md,
  },
  row: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  halfInput: {
    flex: 1,
  },
  addressTypeOptions: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  addressTypeOption: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.gray[200],
    backgroundColor: theme.colors.surface,
  },
  selectedAddressType: {
    borderColor: theme.colors.primary[600],
    backgroundColor: theme.colors.primary[50],
  },
  addressTypeText: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.text.secondary,
    fontWeight: '500',
  },
  selectedAddressTypeText: {
    color: theme.colors.primary[600],
  },
  // Order item and summary styles moved to OrderSummary component

  footer: {
    padding: theme.spacing.xl,
    backgroundColor: theme.colors.surface,
    borderTopWidth: 1,
    borderTopColor: theme.colors.gray[200],
  },
  modalContainer: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.gray[200],
  },
  modalCloseButton: {
    padding: theme.spacing.sm,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalTitle: {
    fontSize: theme.typography.sizes.lg,
    fontWeight: '600',
    color: theme.colors.text.primary,
  },
  modalContent: {
    flex: 1,
    padding: theme.spacing.xl,
  },
  modalFooter: {
    padding: theme.spacing.xl,
    backgroundColor: theme.colors.surface,
    borderTopWidth: 1,
    borderTopColor: theme.colors.gray[200],
  },
  // Checkbox styles
  addressOptionsContainer: {
    marginTop: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: theme.colors.gray[300],
    backgroundColor: theme.colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    borderColor: theme.colors.primary[600],
    backgroundColor: theme.colors.primary[50],
  },
  checkboxLabel: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.text.primary,
    flex: 1,
  },
  addressContainer: {
    gap: theme.spacing.md,
  },
  selectedAddressCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.gray[200],
    marginBottom: theme.spacing.md,
  },
  addressTypeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  addressTypeLabel: {
    fontSize: theme.typography.sizes.base,
    fontWeight: '600',
    color: theme.colors.text.primary,
  },
  selectedIndicator: {
    marginLeft: theme.spacing.sm,
  },
  changeAddressButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.primary[50],
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.primary[200],
  },
  changeAddressButtonText: {
    fontSize: theme.typography.sizes.base,
    color: theme.colors.primary[600],
    fontWeight: '500',
    marginHorizontal: theme.spacing.sm,
  },
  addNewAddressButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.primary[50],
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.primary[200],
  },
  addNewAddressText: {
    fontSize: theme.typography.sizes.base,
    color: theme.colors.primary[600],
    fontWeight: '500',
    marginLeft: theme.spacing.sm,
  },
  bottomSheetContainer: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'black',
    opacity: 0.5,
  },
  bottomSheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: theme.colors.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: theme.spacing.xl,
    paddingBottom: 34, // Safe area padding
    maxHeight: screenHeight * 0.75,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: theme.colors.gray[300],
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: theme.spacing.sm,
    marginBottom: theme.spacing.lg,
  },
  bottomSheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.xl,
  },
  bottomSheetTitle: {
    fontSize: theme.typography.sizes.lg,
    fontWeight: '600',
    color: theme.colors.text.primary,
  },
  closeButton: {
    padding: theme.spacing.sm,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomSheetContent: {
    flex: 1,
    paddingTop: theme.spacing.sm,
  },
  
  // New Card-based Design Styles
  // orderCard styles moved to OrderSummary component
  addressCard: {
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
    ...theme.shadows.md,
  },
  paymentCard: {
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
    ...theme.shadows.md,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  cardIcon: {
    width: 36,
    height: 36,
    borderRadius: theme.borderRadius.lg,
    backgroundColor: theme.colors.primary[50],
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.md,
  },
  cardTitle: {
    fontSize: theme.typography.sizes.lg,
    fontWeight: '600',
    color: theme.colors.text.primary,
    flex: 1,
  },
  itemCountBadge: {
    backgroundColor: theme.colors.primary[100],
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.full,
  },
  itemCountText: {
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.primary[700],
    fontWeight: '600',
  },
  // orderItems styles moved to OrderSummary component
  itemInfo: {
    flex: 1,
  },
  shippingContainer: {
    alignItems: 'flex-end',
  },
  freeShipping: {
    fontSize: theme.typography.sizes.base,
    color: theme.colors.success[600],
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: theme.colors.gray[300],
    marginVertical: theme.spacing.md,
  },
  emptyStateIcon: {
    width: 60,
    height: 60,
    borderRadius: theme.borderRadius.xl,
    backgroundColor: theme.colors.gray[100],
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.md,
  },
  addressTypeIcon: {
    width: 28,
    height: 28,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.primary[50],
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.sm,
  },
  addressDetails: {
    marginTop: theme.spacing.sm,
  },
  newAddressTypeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  
  // Order Item Redesign Styles moved to OrderSummary component
  
  // Order summary styles moved to OrderSummary component

  // Payment Method Styles
  paymentMethodsList: {
    gap: theme.spacing.md,
    marginBottom: theme.spacing.lg,
  },
  paymentMethodCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.gray[200],
    padding: theme.spacing.lg,
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
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.gray[100],
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.md,
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
    marginBottom: theme.spacing.xs,
  },
  paymentMethodName: {
    fontSize: theme.typography.sizes.base,
    fontWeight: '600',
    color: theme.colors.text.primary,
  },
  selectedPaymentMethodName: {
    color: theme.colors.primary[700],
  },
  paymentMethodSubtitle: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.text.secondary,
  },
  disabledText: {
    color: theme.colors.gray[400],
  },
  recommendedBadge: {
    backgroundColor: theme.colors.success[100],
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.sm,
    marginLeft: theme.spacing.sm,
  },
  recommendedText: {
    fontSize: theme.typography.sizes.xs,
    fontWeight: '600',
    color: theme.colors.success[700],
  },
  comingSoonBadge: {
    backgroundColor: theme.colors.gray[100],
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.sm,
    marginLeft: theme.spacing.sm,
  },
  comingSoonText: {
    fontSize: theme.typography.sizes.xs,
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
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.success[200],
  },
  securityText: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.success[700],
    marginLeft: theme.spacing.sm,
  },

}); 