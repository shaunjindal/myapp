import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../styles/theme';
import { formatPrice } from '../utils/currencyUtils';

interface OrderItem {
  id: string;
  productName: string;
  productBrand?: string;
  productSku: string;
  productImageUrl?: string;
  unitPrice: number;
  quantity: number;
  totalPrice: number;
  // Add price breakdown fields for better display
  baseAmount?: number;
  taxAmount?: number;
  discountAmount?: number;
}

interface PaymentComponent {
  type: string;
  amount: number;
  text: string;
  isNegative?: boolean;
}

interface OrderDetailsOrderSummaryProps {
  items: OrderItem[];
  subtotal: number;
  paymentComponents?: PaymentComponent[]; // Use payment components from backend
  totalAmount: number;
  currency?: string; // Add currency prop
  style?: any;
}

export function OrderDetailsOrderSummary({
  items,
  subtotal,
  paymentComponents,
  totalAmount,
  currency = 'INR', // Default currency
  style,
}: OrderDetailsOrderSummaryProps) {

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  // Helper function to get icon for different component types (consistent with cart)
  const getComponentIcon = (type: string) => {
    switch (type) {
      case 'TAX':
        return 'receipt-outline';
      case 'SHIPPING':
        return 'car-outline';
      case 'DISCOUNT':
        return 'gift-outline';
      case 'FEE':
        return 'card-outline';
      default:
        return 'calculator-outline';
    }
  };

  // Helper function to get color for component type
  const getComponentColor = (type: string, isNegative: boolean) => {
    if (isNegative) return theme.colors.success[600];
    
    switch (type) {
      case 'SHIPPING':
        return theme.colors.success[600];
      default:
        return theme.colors.gray[500];
    }
  };

  const renderHeader = () => (
    <View style={styles.cardHeader}>
      <View style={styles.headerContent}>
        <View style={styles.cardIcon}>
          <Ionicons name="receipt-outline" size={20} color={theme.colors.primary[600]} />
        </View>
        <Text style={styles.cardTitle}>Order Summary</Text>
        <View style={styles.itemCountBadge}>
          <Text style={styles.itemCountText}>{itemCount} items</Text>
        </View>
      </View>
    </View>
  );

  const renderItems = () => (
    <View style={styles.orderItems}>
      {items.map((item, index) => (
        <View key={item.id} style={[
          styles.orderItem,
          index === items.length - 1 && styles.lastOrderItem
        ]}>
          <View style={styles.productImageContainer}>
            <Image 
              source={{ uri: item.productImageUrl || 'https://via.placeholder.com/60' }} 
              style={styles.productImage} 
            />
            <View style={styles.quantityBadge}>
              <Text style={styles.quantityBadgeText}>{item.quantity}</Text>
            </View>
          </View>
          <View style={styles.itemDetails}>
            <Text style={styles.itemName} numberOfLines={2}>{item.productName}</Text>
            {item.productBrand && (
              <View style={styles.brandContainer}>
                <Text style={styles.brandText}>{item.productBrand}</Text>
              </View>
            )}
            <Text style={styles.itemSku}>SKU: {item.productSku}</Text>
            <View style={styles.itemPriceRow}>
              <View style={styles.priceBreakdown}>
                {/* Show simplified pricing without tax/base breakdown */}
                {item.discountAmount && item.discountAmount > 0 ? (
                  <>
                    <Text style={styles.basePrice}>Was: {formatPrice(item.unitPrice + item.discountAmount, currency)} each</Text>
                    <Text style={styles.discountPrice}>
                      Save: -{formatPrice(item.discountAmount, currency)} each
                    </Text>
                  </>
                ) : null}
                <Text style={styles.unitPrice}>{formatPrice(item.unitPrice, currency)} each (incl. tax)</Text>
              </View>
              <Text style={styles.itemTotal}>{formatPrice(item.totalPrice, currency)}</Text>
            </View>
          </View>
        </View>
      ))}
    </View>
  );

  return (
    <View style={[styles.summaryCard, style]}>
      {renderHeader()}
      
      {renderItems()}
      
      <View style={styles.summaryContent}>
        <View style={styles.summaryItemsContainer}>
          <View style={styles.summaryItem}>
            <View style={styles.summaryItemLeft}>
              <Ionicons name="calculator-outline" size={16} color={theme.colors.gray[500]} />
              <Text style={styles.summaryLabel}>Subtotal</Text>
            </View>
            <Text style={styles.summaryValue}>{formatPrice(subtotal, currency)}</Text>
          </View>
          
          {paymentComponents?.map((component, index) => (
            <View key={index} style={styles.summaryItem}>
              <View style={styles.summaryItemLeft}>
                <Ionicons name={getComponentIcon(component.type)} size={16} color={getComponentColor(component.type, component.isNegative || false)} />
                <Text style={styles.summaryLabel}>{component.text}</Text>
              </View>
              {component.type === 'SHIPPING' && component.amount === 0 ? (
                <View style={styles.freeShippingContainer}>
                  <Text style={styles.freeShipping}>FREE</Text>
                  <View style={styles.freeShippingBadge}>
                    <Ionicons name="checkmark" size={12} color={theme.colors.success[600]} />
                  </View>
                </View>
              ) : (
                <Text style={[
                  styles.summaryValue,
                  component.isNegative && { color: theme.colors.success[600] }
                ]}>
                  {component.isNegative ? '-' : ''}{formatPrice(component.amount, currency)}
                </Text>
              )}
            </View>
          ))}
        </View>
        
        <View style={styles.divider} />
        
        <View style={styles.totalSection}>
          <View style={styles.totalRow}>
            <View style={styles.totalLeft}>
              <Ionicons name="card-outline" size={20} color={theme.colors.primary[600]} />
              <Text style={styles.totalLabel}>Total Amount</Text>
            </View>
            <Text style={styles.totalValue}>{formatPrice(totalAmount, currency)}</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  summaryCard: {
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.lg,
    ...theme.shadows.md,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
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
  orderItems: {
    marginBottom: theme.spacing.md,
  },
  orderItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.gray[200],
  },
  lastOrderItem: {
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
  itemName: {
    fontSize: theme.typography.sizes.base,
    fontWeight: '600',
    color: theme.colors.text.primary,
    lineHeight: theme.typography.lineHeights.tight * theme.typography.sizes.base,
    marginBottom: theme.spacing.sm,
  },
  brandContainer: {
    alignSelf: 'flex-start',
    marginBottom: theme.spacing.xs,
  },
  brandText: {
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.primary[600],
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  itemSku: {
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.sm,
  },
  itemPriceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  unitPrice: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.text.secondary,
  },
  itemTotal: {
    fontSize: theme.typography.sizes.base,
    fontWeight: '600',
    color: theme.colors.text.primary,
  },
  priceBreakdown: {
    flexDirection: 'column',
    gap: theme.spacing.xs,
  },
  basePrice: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.text.secondary,
  },
  discountPrice: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.success[600],
    fontWeight: '500',
  },
  summaryContent: {
    gap: theme.spacing.xs,
  },
  summaryItemsContainer: {
    gap: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  summaryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    backgroundColor: theme.colors.gray[50],
    borderRadius: theme.borderRadius.lg,
  },
  summaryItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  summaryLabel: {
    fontSize: theme.typography.sizes.base,
    color: theme.colors.text.primary,
    fontWeight: '500',
  },
  summaryValue: {
    fontSize: theme.typography.sizes.base,
    color: theme.colors.text.primary,
    fontWeight: '600',
  },
  freeShippingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  freeShipping: {
    fontSize: theme.typography.sizes.base,
    color: theme.colors.success[600],
    fontWeight: '600',
  },
  freeShippingBadge: {
    width: 18,
    height: 18,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.success[100],
    alignItems: 'center',
    justifyContent: 'center',
  },
  divider: {
    height: 1,
    backgroundColor: theme.colors.gray[300],
    marginVertical: theme.spacing.md,
  },
  totalSection: {
    backgroundColor: theme.colors.primary[50],
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.colors.primary[200],
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  totalLabel: {
    fontSize: theme.typography.sizes.lg,
    fontWeight: '700',
    color: theme.colors.text.primary,
  },
  totalValue: {
    fontSize: theme.typography.sizes.xl,
    fontWeight: '700',
    color: theme.colors.primary[600],
  },
}); 