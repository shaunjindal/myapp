import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../styles/theme';
import { useCartStore } from '../store/cartStore';

interface OrderSummaryItem {
  id: string;
  quantity: number;
  product: {
    id: string;
    name: string;
    price: number;
    image: string;
    brand?: string;
  };
}

interface OrderSummaryProps {
  items: OrderSummaryItem[];
  showItems?: boolean;
  collapsible?: boolean;
  isExpanded?: boolean;
  onToggleExpanded?: () => void;
  style?: any;
}

export function OrderSummary({
  items,
  showItems = true,
  collapsible = false,
  isExpanded = true,
  onToggleExpanded,
  style,
}: OrderSummaryProps) {
  // Get centralized totals from cart store
  const { subtotal, tax, shipping, finalTotal } = useCartStore();
  
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  const renderHeader = () => (
    <View style={[styles.cardHeader, collapsible && styles.collapsibleHeader]}>
      <View style={styles.headerContent}>
        <View style={styles.cardIcon}>
          <Ionicons name="receipt-outline" size={20} color={theme.colors.primary[600]} />
        </View>
        <Text style={styles.cardTitle}>Order Summary</Text>
        <View style={styles.itemCountBadge}>
          <Text style={styles.itemCountText}>{itemCount} items</Text>
        </View>
      </View>
      {collapsible && (
        <View style={styles.collapseToggle}>
          <Ionicons 
            name={isExpanded ? "chevron-up" : "chevron-down"} 
            size={20} 
            color={theme.colors.primary[600]} 
          />
        </View>
      )}
    </View>
  );

  const renderCollapsedView = () => (
    <View style={styles.collapsedSummary}>
      <View style={styles.collapsedTotalRow}>
        <View style={styles.collapsedTotalLeft}>
          <Ionicons name="card-outline" size={20} color={theme.colors.primary[600]} />
          <Text style={styles.collapsedTotalLabel}>Total Amount</Text>
        </View>
        <Text style={styles.collapsedTotalValue}>${finalTotal.toFixed(2)}</Text>
      </View>
    </View>
  );

  const renderExpandedView = () => (
    <>
      {showItems && (
        <View style={styles.orderItems}>
          {items.map((item, index) => (
            <View key={item.id} style={[
              styles.orderItem,
              index === items.length - 1 && styles.lastOrderItem
            ]}>
              <View style={styles.productImageContainer}>
                <Image source={{ uri: item.product.image }} style={styles.productImage} />
                <View style={styles.quantityBadge}>
                  <Text style={styles.quantityBadgeText}>{item.quantity}</Text>
                </View>
              </View>
              <View style={styles.itemDetails}>
                <Text style={styles.itemName} numberOfLines={2}>{item.product.name}</Text>
                {item.product.brand && (
                  <View style={styles.brandContainer}>
                    <Text style={styles.brandText}>{item.product.brand}</Text>
                  </View>
                )}
                <View style={styles.itemPriceRow}>
                  <Text style={styles.unitPrice}>${item.product.price.toFixed(2)} each</Text>
                  <Text style={styles.itemTotal}>${(item.product.price * item.quantity).toFixed(2)}</Text>
                </View>
              </View>
            </View>
          ))}
        </View>
      )}
      
      <View style={styles.summaryContent}>
        <View style={styles.summaryItemsContainer}>
          <View style={styles.summaryItem}>
            <View style={styles.summaryItemLeft}>
              <Ionicons name="calculator-outline" size={16} color={theme.colors.gray[500]} />
              <Text style={styles.summaryLabel}>Subtotal</Text>
            </View>
            <Text style={styles.summaryValue}>${subtotal.toFixed(2)}</Text>
          </View>
          
          <View style={styles.summaryItem}>
            <View style={styles.summaryItemLeft}>
              <Ionicons name="receipt-outline" size={16} color={theme.colors.gray[500]} />
              <Text style={styles.summaryLabel}>Tax (8%)</Text>
            </View>
            <Text style={styles.summaryValue}>${tax.toFixed(2)}</Text>
          </View>
          
          <View style={styles.summaryItem}>
            <View style={styles.summaryItemLeft}>
              <Ionicons name="car-outline" size={16} color={theme.colors.success[600]} />
              <Text style={styles.summaryLabel}>Shipping</Text>
            </View>
            <View style={styles.freeShippingContainer}>
              {shipping === 0 ? (
                <>
                  <Text style={styles.freeShipping}>FREE</Text>
                  <View style={styles.freeShippingBadge}>
                    <Ionicons name="checkmark" size={12} color={theme.colors.success[600]} />
                  </View>
                </>
              ) : (
                <Text style={styles.summaryValue}>${shipping.toFixed(2)}</Text>
              )}
            </View>
          </View>
        </View>
        
        <View style={styles.divider} />
        
        <View style={styles.totalSection}>
          <View style={styles.totalRow}>
            <View style={styles.totalLeft}>
              <Ionicons name="card-outline" size={20} color={theme.colors.primary[600]} />
              <Text style={styles.totalLabel}>Total Amount</Text>
            </View>
            <Text style={styles.totalValue}>${finalTotal.toFixed(2)}</Text>
          </View>
        </View>
      </View>
    </>
  );

  const content = (
    <View style={[styles.summaryCard, style]}>
      {collapsible ? (
        <TouchableOpacity 
          style={styles.collapsibleHeaderButton}
          onPress={onToggleExpanded}
          activeOpacity={0.7}
        >
          {renderHeader()}
        </TouchableOpacity>
      ) : (
        renderHeader()
      )}
      
      {collapsible && !isExpanded ? renderCollapsedView() : renderExpandedView()}
    </View>
  );

  return content;
}

const styles = StyleSheet.create({
  summaryCard: {
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
  collapsibleHeader: {
    marginBottom: 0,
  },
  collapsibleHeaderButton: {
    // No additional styles needed, just a wrapper
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
  collapseToggle: {
    marginLeft: theme.spacing.md,
  },
  collapsedSummary: {
    paddingTop: theme.spacing.md,
  },
  collapsedTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.md,
    backgroundColor: theme.colors.primary[50],
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.colors.primary[200],
  },
  collapsedTotalLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  collapsedTotalLabel: {
    fontSize: theme.typography.sizes.lg,
    fontWeight: '700',
    color: theme.colors.text.primary,
  },
  collapsedTotalValue: {
    fontSize: theme.typography.sizes.xl,
    fontWeight: '700',
    color: theme.colors.primary[600],
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
  itemPriceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.xs,
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
  brandContainer: {
    alignSelf: 'flex-start',
    marginTop: theme.spacing.xs,
    marginBottom: theme.spacing.xs,
  },
  brandText: {
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.primary[600],
    fontWeight: '600',
    textTransform: 'uppercase',
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