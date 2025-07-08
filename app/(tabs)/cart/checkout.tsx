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
} from 'react-native';
import { useRouter } from 'expo-router';
import { useCartStore } from '../../../src/store/cartStore';
import { useAddressStore } from '../../../src/store/addressStore';
import { Button } from '../../../src/components/Button';
import { Input } from '../../../src/components/Input';
import { AddAddressModal } from '../../../src/components/AddAddressModal';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../../src/styles/theme';
import { AddressDto } from '../../../src/types/api';

const paymentMethods = [
  { id: 'credit', name: 'Credit Card', icon: 'card', details: '**** **** **** 1234' },
  { id: 'paypal', name: 'PayPal', icon: 'logo-paypal', details: 'demo@example.com' },
  { id: 'apple', name: 'Apple Pay', icon: 'logo-apple', details: 'Touch ID' },
];

const { height: screenHeight } = Dimensions.get('window');

export default function CheckoutScreen() {
  const router = useRouter();
  const { items, total } = useCartStore();
  const { addresses, loading: addressesLoading, fetchAddresses } = useAddressStore();
  
  // Address states
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [showAddAddressModal, setShowAddAddressModal] = useState(false);
  const [showAddressBottomSheet, setShowAddressBottomSheet] = useState(false);
  
  // Animation values for bottom sheet
  const slideAnim = useRef(new Animated.Value(screenHeight)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;
  
  const [paymentMethod, setPaymentMethod] = useState('credit');
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

  const handleProceedToPayment = () => {
    // Validate address selection
    if (!selectedAddressId) {
      Alert.alert('Error', 'Please select a shipping address');
      return;
    }

    setLoading(true);
    // Navigate to payment processing screen with parameters
    router.push({
      pathname: '/(tabs)/cart/payment-processing',
      params: {
        selectedAddressId,
        paymentMethod,
      }
    });
  };

  const subtotal = total;
  const tax = subtotal * 0.08; // 8% tax
  const shipping = subtotal > 50 ? 0 : 9.99; // Free shipping over $50
  const finalTotal = subtotal + tax + shipping;

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
      <ScrollView style={styles.content}>
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

        {/* Shipping Address */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Shipping Address</Text>

          {addressesLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color={theme.colors.primary[600]} />
              <Text style={styles.loadingText}>Loading addresses...</Text>
            </View>
          ) : addresses.length === 0 ? (
            <View style={styles.noAddressesContainer}>
              <Ionicons name="location-outline" size={48} color={theme.colors.gray[400]} />
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
                      <Text style={styles.addressType}>
                        {displayAddress.type === 'SHIPPING' ? 'Home' : displayAddress.type === 'BILLING' ? 'Work' : 'Other'}
                      </Text>
                      {displayAddress.isDefault && (
                        <View style={styles.defaultBadge}>
                          <Text style={styles.defaultBadgeText}>Default</Text>
                        </View>
                      )}
                    </View>
                    <Text style={styles.addressText}>
                      {displayAddress.street}
                    </Text>
                    <Text style={styles.addressText}>
                      {displayAddress.city}, {displayAddress.state} {displayAddress.zipCode}
                    </Text>
                    <Text style={styles.addressText}>
                      {displayAddress.country}
                    </Text>
                  </View>
                </View>
              )}

              {/* Address Selection Button */}
              {addresses.length > 1 && (
                <TouchableOpacity
                  style={styles.selectAddressButton}
                  onPress={showBottomSheet}
                >
                  <View style={styles.selectAddressButtonContent}>
                    <Ionicons name="location" size={20} color={theme.colors.primary[600]} />
                    <Text style={styles.selectAddressButtonText}>Select Different Address</Text>
                  </View>
                  <Ionicons name="chevron-down" size={20} color={theme.colors.primary[600]} />
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>

        {/* Payment Method */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payment Method</Text>
          <View style={styles.paymentMethods}>
            <TouchableOpacity
              style={[styles.paymentMethod, paymentMethod === 'credit' && styles.selectedPayment]}
              onPress={() => setPaymentMethod('credit')}
            >
              <Ionicons name="card" size={24} color={theme.colors.primary[600]} />
              <Text style={styles.paymentText}>Credit Card</Text>
              {paymentMethod === 'credit' && (
                <Ionicons name="checkmark-circle" size={24} color={theme.colors.success[600]} />
              )}
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.paymentMethod, paymentMethod === 'paypal' && styles.selectedPayment]}
              onPress={() => setPaymentMethod('paypal')}
            >
              <Ionicons name="logo-paypal" size={24} color={theme.colors.primary[600]} />
              <Text style={styles.paymentText}>PayPal</Text>
              {paymentMethod === 'paypal' && (
                <Ionicons name="checkmark-circle" size={24} color={theme.colors.success[600]} />
              )}
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.paymentMethod, paymentMethod === 'apple' && styles.selectedPayment]}
              onPress={() => setPaymentMethod('apple')}
            >
              <Ionicons name="logo-apple" size={24} color={theme.colors.primary[600]} />
              <Text style={styles.paymentText}>Apple Pay</Text>
              {paymentMethod === 'apple' && (
                <Ionicons name="checkmark-circle" size={24} color={theme.colors.success[600]} />
              )}
            </TouchableOpacity>
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
          title={loading ? 'Processing...' : 'Proceed to Payment'}
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
    backgroundColor: theme.colors.background,
  },
  content: {
    flex: 1,
    padding: theme.spacing.xl,
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
    backgroundColor: theme.colors.primary[50],
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.primary[200],
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
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
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
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.primary[200],
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
  addressTypeContainer: {
    marginTop: theme.spacing.sm,
  },
  addressTypeLabel: {
    fontSize: theme.typography.sizes.sm,
    fontWeight: '500',
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.sm,
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
  orderItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.gray[200],
  },
  itemName: {
    flex: 1,
    fontSize: theme.typography.sizes.base,
    color: theme.colors.text.primary,
  },
  itemQuantity: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.text.secondary,
    marginRight: theme.spacing.md,
  },
  itemPrice: {
    fontSize: theme.typography.sizes.base,
    fontWeight: '600',
    color: theme.colors.text.primary,
  },
  orderSummary: {
    marginTop: theme.spacing.lg,
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.gray[50],
    borderRadius: theme.borderRadius.md,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.sm,
  },
  summaryLabel: {
    fontSize: theme.typography.sizes.base,
    color: theme.colors.text.secondary,
  },
  summaryValue: {
    fontSize: theme.typography.sizes.base,
    color: theme.colors.text.primary,
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: theme.colors.gray[200],
    paddingTop: theme.spacing.sm,
    marginTop: theme.spacing.sm,
  },
  totalLabel: {
    fontSize: theme.typography.sizes.lg,
    fontWeight: '600',
    color: theme.colors.text.primary,
  },
  totalValue: {
    fontSize: theme.typography.sizes.lg,
    fontWeight: '700',
    color: theme.colors.primary[600],
  },
  paymentMethods: {
    gap: theme.spacing.md,
  },
  paymentMethod: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.gray[200],
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.surface,
  },
  selectedPayment: {
    borderColor: theme.colors.primary[600],
    backgroundColor: theme.colors.primary[50],
  },
  paymentText: {
    fontSize: theme.typography.sizes.base,
    color: theme.colors.text.primary,
    marginLeft: theme.spacing.md,
    flex: 1,
  },
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
  },
  selectAddressButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.primary[50],
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.primary[200],
  },
  selectAddressButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  selectAddressButtonText: {
    fontSize: theme.typography.sizes.base,
    color: theme.colors.primary[600],
    fontWeight: '500',
    marginRight: theme.spacing.sm,
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
}); 