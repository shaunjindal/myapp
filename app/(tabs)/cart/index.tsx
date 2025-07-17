import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Platform,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useCartStore } from '../../../src/store/cartStore';
import { useAuthStore } from '../../../src/store/authStore';
import { Button } from '../../../src/components/Button';
import { BackButtonHeader } from '../../../src/components/BackButtonHeader';
import { LoginPromptBottomSheet } from '../../../src/components/LoginPromptBottomSheet';
import { OrderSummary } from '../../../src/components/OrderSummary';
import { theme } from '../../../src/styles/theme';
import { Ionicons } from '@expo/vector-icons';
import { formatPrice } from '../../../src/utils/currencyUtils';

export default function CartScreen() {
  const router = useRouter();
  const { items, total, updateQuantity, removeItem, clearCart, createOrder } = useCartStore();
  const { isAuthenticated, addOrder } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);

  const CustomCartHeader = () => (
    <View style={styles.header}>
      <View style={styles.headerContent}>
        <TouchableOpacity onPress={() => router.replace('/(tabs)/home')} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.title}>Shopping Cart</Text>
        <View style={styles.spacer} />
      </View>
    </View>
  );

  useEffect(() => {
    // Just add a small delay to prevent flash since cart is already initialized by initStore
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  const handleCheckout = () => {
    if (!isAuthenticated) {
      setShowLoginPrompt(true);
      return;
    }

    if (items.length === 0) {
      Alert.alert('Empty Cart', 'Please add items to your cart before checkout.');
      return;
    }

    if (total <= 0) {
      Alert.alert('Invalid Total', 'There seems to be an issue with your cart total.');
      return;
    }

    // Navigate to checkout screen
    router.push('/(tabs)/cart/checkout');
  };

  const handleClearCart = async () => {
    try {
      await clearCart();
    } catch (error) {
      console.error('Failed to clear cart:', error);
    }
  };

  // Show loading screen while cart initializes
  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <CustomCartHeader />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary[600]} />
          <Text style={styles.loadingText}>Loading your cart...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (items.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <CustomCartHeader />
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconContainer}>
            <Ionicons name="cart-outline" size={80} color={theme.colors.gray[400]} />
          </View>
          <Text style={styles.emptyTitle}>Your cart is empty</Text>
          <Text style={styles.emptySubtitle}>
            Looks like you haven't added anything to your cart yet
          </Text>
          <Button
            title="Start Shopping"
            onPress={() => router.push('/(tabs)/products')}
            variant="primary"
            size="lg"
            fullWidth={false}
            style={styles.shopButton}
          />
        </View>
      </SafeAreaView>
    );
  }

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <SafeAreaView style={styles.container}>
      <CustomCartHeader />
      <View style={styles.subHeader}>
        <View style={styles.subHeaderLeft}>
          <Text style={styles.subtitle}>{itemCount} item{itemCount !== 1 ? 's' : ''}</Text>
        </View>
        <TouchableOpacity onPress={handleClearCart} style={styles.clearButton}>
          <Ionicons name="trash-outline" size={20} color={theme.colors.error[600]} />
          <Text style={styles.clearButtonText}>Clear All</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Items List */}
        <View style={styles.itemsCard}>
          <View style={styles.cardHeader}>
            <View style={styles.cardIcon}>
              <Ionicons name="bag-outline" size={20} color={theme.colors.primary[600]} />
            </View>
            <Text style={styles.cardTitle}>Your Items</Text>
            <View style={styles.itemCountBadge}>
              <Text style={styles.itemCountText}>{itemCount} items</Text>
            </View>
          </View>
          
          <View style={styles.itemsList}>
            {items.map((item, index) => (
              <View key={item.id} style={[
                styles.cartItem,
                index === items.length - 1 && styles.lastCartItem
              ]}>
                <View style={styles.productImageContainer}>
                  <Image source={{ uri: item.product.image }} style={styles.productImage} />
                  <View style={styles.quantityBadge}>
                    <Text style={styles.quantityBadgeText}>{item.quantity}</Text>
                  </View>
                </View>
                
                <View style={styles.itemDetails}>
                  <View style={styles.itemHeader}>
                    <View style={styles.itemTitleContainer}>
                      <Text style={styles.itemName} numberOfLines={2}>{item.product.name}</Text>
                      
                      {/* Variable Dimension Details - Between name and brand */}
                      {item.product.isVariableDimension && item.customLength && item.product.fixedHeight && (
                        <Text style={styles.dimensionInfo}>
                          {item.customLength} × {item.product.fixedHeight} {item.product.dimensionUnit === 'MILLIMETER' ? 'mm' : item.product.dimensionUnit === 'CENTIMETER' ? 'cm' : item.product.dimensionUnit === 'METER' ? 'm' : item.product.dimensionUnit === 'INCH' ? 'in' : item.product.dimensionUnit === 'FOOT' ? 'ft' : item.product.dimensionUnit === 'YARD' ? 'yd' : 'units'} ({((item.customLength || 0) * (item.product.fixedHeight || 0)).toFixed(2)} sq {item.product.dimensionUnit === 'MILLIMETER' ? 'mm' : item.product.dimensionUnit === 'CENTIMETER' ? 'cm' : item.product.dimensionUnit === 'METER' ? 'm' : item.product.dimensionUnit === 'INCH' ? 'in' : item.product.dimensionUnit === 'FOOT' ? 'ft' : item.product.dimensionUnit === 'YARD' ? 'yd' : 'units'})
                        </Text>
                      )}
                      
                      {item.product.brand && (
                        <View style={styles.brandContainer}>
                          <Text style={styles.brandText}>{item.product.brand}</Text>
                        </View>
                      )}
                    </View>
                    <TouchableOpacity
                      style={styles.removeButton}
                      onPress={() => removeItem(item.id)}
                      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                      <Ionicons name="close" size={18} color={theme.colors.gray[500]} />
                    </TouchableOpacity>
                  </View>
                  
                  <View style={styles.itemFooter}>
                    <View style={styles.quantityControls}>
                      <TouchableOpacity
                        style={styles.quantityButton}
                        onPress={() => {
                          if (item.quantity === 1) {
                            // Remove item when quantity would go to 0
                            removeItem(item.id);
                          } else {
                            // Decrement quantity using the new method that accepts item ID
                            const { updateQuantityWithSessionById } = useCartStore.getState();
                            updateQuantityWithSessionById(item.id, item.quantity - 1);
                          }
                        }}
                      >
                        <Ionicons
                          name="remove"
                          size={16}
                          color={theme.colors.primary[600]}
                        />
                      </TouchableOpacity>
                      
                      <Text style={styles.quantityText}>{item.quantity}</Text>
                      
                      <TouchableOpacity
                        style={[
                          styles.quantityButton,
                          item.quantity >= item.product.stockQuantity && styles.quantityButtonDisabled,
                        ]}
                        onPress={() => {
                          // Increment quantity using the new method that accepts item ID
                          const { updateQuantityWithSessionById } = useCartStore.getState();
                          updateQuantityWithSessionById(item.id, item.quantity + 1);
                        }}
                        disabled={item.quantity >= item.product.stockQuantity}
                      >
                        <Ionicons
                          name="add"
                          size={16}
                          color={item.quantity >= item.product.stockQuantity ? theme.colors.gray[400] : theme.colors.primary[600]}
                        />
                      </TouchableOpacity>
                    </View>
                    
                    <View style={styles.itemPriceContainer}>
                      <Text style={styles.unitPrice}>
                        {item.product.isVariableDimension && item.calculatedUnitPrice 
                          ? formatPrice(item.calculatedUnitPrice) 
                          : formatPrice(item.product.price)
                        } each
                      </Text>
                      <Text style={styles.itemTotal}>
                        {item.product.isVariableDimension && item.calculatedUnitPrice 
                          ? formatPrice(item.calculatedUnitPrice * item.quantity)
                          : formatPrice(item.product.price * item.quantity)
                        }
                      </Text>
                    </View>
                  </View>
                  

                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Order Summary */}
        <OrderSummary
          items={items}
          showItems={false}
          collapsible={false}
        />
      </ScrollView>

      <View style={styles.footer}>
        <Button
          title="Proceed to Checkout"
          onPress={handleCheckout}
          variant="primary"
          size="lg"
          fullWidth
        />
      </View>

      {/* Login Prompt Bottom Sheet */}
      <LoginPromptBottomSheet
        isVisible={showLoginPrompt}
        onClose={() => setShowLoginPrompt(false)}
        title="Complete Your Purchase"
        message="Join our community to enjoy a seamless checkout experience and exclusive member benefits!"
        actionText="Login to Checkout"
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.surface,
  },
  header: {
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.gray[200],
    paddingTop: 8,
    paddingBottom: 12,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    height: 44,
  },
  backButton: {
    marginRight: theme.spacing.md,
    padding: 4,
  },
  title: {
    fontSize: theme.typography.sizes.lg,
    fontWeight: '600',
    color: theme.colors.text.primary,
    flex: 1,
  },
  spacer: {
    width: 36, // Same width as back button to center title
  },
  subHeader: {
    backgroundColor: theme.colors.background,
    paddingHorizontal: theme.spacing.xl,
    paddingBottom: theme.spacing.lg,
    paddingTop: theme.spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  subHeaderLeft: {
    flex: 1,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  subtitle: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.text.secondary,
    fontWeight: '500' as any,
    marginTop: theme.spacing.xs,
  },
  clearButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.error[50],
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.colors.error[200],
    minWidth: 90,
  },
  clearButtonText: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.error[600],
    fontWeight: '600' as any,
    marginLeft: theme.spacing.xs,
  },
  scrollView: {
    flex: 1,
    paddingTop: theme.spacing.md,
  },
  itemsContainer: {
    paddingHorizontal: theme.spacing.xl,
    paddingTop: theme.spacing.lg,
  },
  summaryContainer: {
    backgroundColor: theme.colors.background,
    margin: theme.spacing.xl,
    padding: theme.spacing.xl,
    borderRadius: theme.borderRadius['2xl'],
    ...theme.shadows.md,
  },
  summaryTitle: {
    fontSize: theme.typography.sizes.lg,
    fontWeight: '700' as any,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.lg,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  summaryLabel: {
    fontSize: theme.typography.sizes.base,
    color: theme.colors.text.primary,
    fontWeight: '500' as any,
  },
  summaryValue: {
    fontSize: theme.typography.sizes.base,
    color: theme.colors.text.primary,
    fontWeight: '600' as any,
  },
  divider: {
    height: 1,
    backgroundColor: theme.colors.gray[300],
    marginVertical: theme.spacing.md,
  },
  totalLabel: {
    fontSize: theme.typography.sizes.lg,
    color: theme.colors.text.primary,
    fontWeight: '700' as any,
  },
  totalValue: {
    fontSize: theme.typography.sizes.xl,
    color: theme.colors.primary[600],
    fontWeight: '700' as any,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.xl,
  },
  emptyIconContainer: {
    marginBottom: theme.spacing.xl,
  },
  emptyTitle: {
    fontSize: theme.typography.sizes['2xl'],
    fontWeight: '700' as any,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.md,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: theme.typography.sizes.base,
    color: theme.colors.text.secondary,
    textAlign: 'center',
    marginBottom: theme.spacing['3xl'],
    lineHeight: theme.typography.lineHeights.relaxed * theme.typography.sizes.base,
  },
  shopButton: {
    paddingHorizontal: theme.spacing['3xl'],
  },
  footer: {
    backgroundColor: theme.colors.background,
    padding: theme.spacing.xl,
    borderTopWidth: 1,
    borderTopColor: theme.colors.gray[200],
    ...theme.shadows.lg,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.xl,
  },
  loadingText: {
    fontSize: theme.typography.sizes.base,
    color: theme.colors.text.secondary,
    marginTop: theme.spacing.md,
    textAlign: 'center',
  },
  
  // New Modern Design Styles
  itemsCard: {
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.lg,
    marginHorizontal: theme.spacing.md,
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
  itemsList: {
    gap: theme.spacing.sm,
  },
  cartItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.gray[200],
  },
  lastCartItem: {
    borderBottomWidth: 0,
  },
  productImageContainer: {
    position: 'relative',
    marginRight: theme.spacing.md,
  },
  productImage: {
    width: 60,
    height: 60,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.gray[100],
  },
  quantityBadge: {
    position: 'absolute',
    top: -6,
    right: -6,
    backgroundColor: theme.colors.primary[600],
    borderRadius: theme.borderRadius.full,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: theme.colors.background,
  },
  quantityBadgeText: {
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.background,
    fontWeight: '700',
  },
  itemDetails: {
    flex: 1,
    justifyContent: 'space-between',
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.sm,
  },
  itemTitleContainer: {
    flex: 1,
    marginRight: theme.spacing.md,
  },
  brandContainer: {
    alignSelf: 'flex-start',
    marginTop: theme.spacing.xs,
  },
  brandText: {
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.primary[600],
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  itemName: {
    fontSize: theme.typography.sizes.base,
    fontWeight: '600',
    color: theme.colors.text.primary,
    lineHeight: theme.typography.lineHeights.tight * theme.typography.sizes.base,
  },
  removeButton: {
    backgroundColor: theme.colors.gray[100],
    borderRadius: theme.borderRadius.full,
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.gray[100],
    borderRadius: theme.borderRadius.lg,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
  },
  quantityButton: {
    width: 32,
    height: 32,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    ...theme.shadows.sm,
  },
  quantityButtonDisabled: {
    backgroundColor: theme.colors.gray[200],
  },
  quantityText: {
    fontSize: theme.typography.sizes.base,
    fontWeight: '600',
    color: theme.colors.text.primary,
    marginHorizontal: theme.spacing.md,
    minWidth: 20,
    textAlign: 'center',
  },
  itemPriceContainer: {
    alignItems: 'flex-end',
  },
  unitPrice: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.xs,
  },
  itemTotal: {
    fontSize: theme.typography.sizes.base,
    fontWeight: '600',
    color: theme.colors.text.primary,
  },
  // Variable Dimension Styles
  variableDimensionSection: {
    backgroundColor: theme.colors.gray[50],
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    marginTop: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.gray[200],
  },
  dimensionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
    paddingBottom: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.gray[200],
  },
  dimensionHeaderText: {
    fontSize: theme.typography.sizes.base,
    fontWeight: '600',
    color: theme.colors.primary[600],
    marginLeft: theme.spacing.sm,
  },
  dimensionDetails: {
    gap: theme.spacing.sm,
  },
  dimensionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dimensionLabel: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.text.secondary,
    fontWeight: '500',
  },
  dimensionValue: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.text.primary,
    fontWeight: '600',
  },
  priceBreakdownSection: {
    marginTop: theme.spacing.md,
    paddingTop: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.gray[200],
    gap: theme.spacing.sm,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceLabel: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.text.secondary,
    fontWeight: '500',
  },
  priceValue: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.text.primary,
    fontWeight: '600',
  },
  totalPriceRow: {
    marginTop: theme.spacing.sm,
    paddingTop: theme.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: theme.colors.gray[300],
  },
  totalPriceLabel: {
    fontSize: theme.typography.sizes.base,
    color: theme.colors.text.primary,
    fontWeight: '700',
  },
  totalPriceValue: {
    fontSize: theme.typography.sizes.lg,
    color: theme.colors.primary[600],
    fontWeight: '700',
  },
  dimensionInfo: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.text.secondary,
    fontWeight: '400',
    marginTop: theme.spacing.xs,
  },
  // No longer needed - styles moved to OrderSummary component
}); 