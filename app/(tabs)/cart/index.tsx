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
} from 'react-native';
import { useRouter } from 'expo-router';
import { useCartStore } from '../../../src/store/cartStore';
import { useAuthStore } from '../../../src/store/authStore';
import { CartItem } from '../../../src/components/CartItem';
import { Button } from '../../../src/components/Button';
import { BackButtonHeader } from '../../../src/components/BackButtonHeader';
import { LoginPromptBottomSheet } from '../../../src/components/LoginPromptBottomSheet';
import { theme } from '../../../src/styles/theme';
import { Ionicons } from '@expo/vector-icons';

export default function CartScreen() {
  const router = useRouter();
  const { items, total, updateQuantity, removeItem, clearCart, createOrder } = useCartStore();
  const { isAuthenticated, addOrder } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);

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
        <BackButtonHeader title="Shopping Cart" />
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
        <BackButtonHeader title="Shopping Cart" />
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
      <BackButtonHeader title="Shopping Cart" />
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
        <View style={styles.itemsContainer}>
          {items.map((item) => (
            <CartItem
              key={item.id}
              item={item}
              onUpdateQuantity={updateQuantity}
              onRemove={removeItem}
            />
          ))}
        </View>

        {/* Order Summary */}
        <View style={styles.summaryContainer}>
          <Text style={styles.summaryTitle}>Order Summary</Text>
          
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Subtotal</Text>
            <Text style={styles.summaryValue}>${total.toFixed(2)}</Text>
          </View>
          
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Shipping</Text>
            <Text style={styles.summaryValue}>Free</Text>
          </View>
          
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Tax</Text>
            <Text style={styles.summaryValue}>${(total * 0.08).toFixed(2)}</Text>
          </View>
          
          <View style={styles.divider} />
          
          <View style={styles.summaryRow}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>${(total * 1.08).toFixed(2)}</Text>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.totalContainer}>
          <Text style={styles.footerTotalLabel}>Total</Text>
          <Text style={styles.footerTotalAmount}>${(total * 1.08).toFixed(2)}</Text>
        </View>
        
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
    backgroundColor: theme.colors.background,
    paddingTop: theme.spacing.xl,
    paddingBottom: theme.spacing.lg,
    ...theme.shadows.sm,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.xl,
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
  backButton: {
    padding: theme.spacing.md,
    marginLeft: -theme.spacing.md,
    marginRight: theme.spacing.sm,
  },
  title: {
    fontSize: theme.typography.sizes['2xl'],
    fontWeight: '700' as any,
    color: theme.colors.text.primary,
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
    color: theme.colors.text.secondary,
    fontWeight: '500' as any,
  },
  summaryValue: {
    fontSize: theme.typography.sizes.base,
    color: theme.colors.text.primary,
    fontWeight: '600' as any,
  },
  divider: {
    height: 1,
    backgroundColor: theme.colors.gray[200],
    marginVertical: theme.spacing.lg,
  },
  totalLabel: {
    fontSize: theme.typography.sizes.lg,
    color: theme.colors.text.primary,
    fontWeight: '700' as any,
  },
  totalValue: {
    fontSize: theme.typography.sizes.lg,
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
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  footerTotalLabel: {
    fontSize: theme.typography.sizes.lg,
    fontWeight: '600' as any,
    color: theme.colors.text.primary,
  },
  footerTotalAmount: {
    fontSize: theme.typography.sizes['2xl'],
    fontWeight: '700' as any,
    color: theme.colors.primary[600],
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
}); 