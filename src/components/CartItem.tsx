import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { CartItem as CartItemType } from '../types';
import { theme } from '../styles/theme';
import { Ionicons } from '@expo/vector-icons';

interface CartItemProps {
  item: CartItemType;
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemove: (productId: string) => void;
}

export const CartItem: React.FC<CartItemProps> = ({
  item,
  onUpdateQuantity,
  onRemove,
}) => {
  const { product, quantity } = item;
  const total = product.price * quantity;
  const isDiscounted = product.originalPrice && product.originalPrice > product.price;

  return (
    <View style={styles.container}>
      <View style={styles.imageContainer}>
        <Image source={{ uri: product.image }} style={styles.image} />
        {isDiscounted && (
          <View style={styles.discountBadge}>
            <Text style={styles.discountText}>SALE</Text>
          </View>
        )}
      </View>

      <View style={styles.content}>
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            <Text style={styles.brand}>{product.brand}</Text>
            <Text style={styles.name} numberOfLines={2}>
              {product.name}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.removeButton}
            onPress={() => onRemove(product.id)}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="close" size={20} color={theme.colors.gray[500]} />
          </TouchableOpacity>
        </View>

        <View style={styles.priceContainer}>
          <Text style={styles.price}>${product.price}</Text>
          {isDiscounted && (
            <Text style={styles.originalPrice}>${product.originalPrice}</Text>
          )}
        </View>

        <View style={styles.footer}>
          <View style={styles.quantityContainer}>
            <TouchableOpacity
              style={[
                styles.quantityButton,
                quantity <= 0 && styles.quantityButtonDisabled,
              ]}
              onPress={() => onUpdateQuantity(product.id, quantity - 1)}
              disabled={quantity <= 0}
            >
              <Ionicons
                name="remove"
                size={16}
                color={quantity <= 0 ? theme.colors.gray[400] : theme.colors.gray[700]}
              />
            </TouchableOpacity>
            
            <View style={styles.quantityDisplay}>
              <Text style={styles.quantity}>{quantity}</Text>
            </View>
            
            <TouchableOpacity
              style={[
                styles.quantityButton,
                quantity >= product.stockQuantity && styles.quantityButtonDisabled,
              ]}
              onPress={() => onUpdateQuantity(product.id, quantity + 1)}
              disabled={quantity >= product.stockQuantity}
            >
              <Ionicons
                name="add"
                size={16}
                color={quantity >= product.stockQuantity ? theme.colors.gray[400] : theme.colors.gray[700]}
              />
            </TouchableOpacity>
          </View>

          <View style={styles.totalContainer}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.total}>${total.toFixed(2)}</Text>
          </View>
        </View>

        {/* Stock warning */}
        {quantity >= product.stockQuantity && (
          <View style={styles.stockWarning}>
            <Ionicons name="warning" size={16} color={theme.colors.warning[600]} />
            <Text style={styles.stockWarningText}>
              Only {product.stockQuantity} left in stock
            </Text>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius['2xl'],
    marginBottom: theme.spacing.lg,
    padding: theme.spacing.lg,
    ...theme.shadows.md,
  },
  imageContainer: {
    position: 'relative',
    marginRight: theme.spacing.lg,
  },
  image: {
    width: 90,
    height: 90,
    borderRadius: theme.borderRadius.xl,
  },
  discountBadge: {
    position: 'absolute',
    top: -theme.spacing.xs,
    right: -theme.spacing.xs,
    backgroundColor: theme.colors.error[500],
    paddingHorizontal: theme.spacing.xs,
    paddingVertical: 2,
    borderRadius: theme.borderRadius.sm,
  },
  discountText: {
    color: theme.colors.text.inverse,
    fontSize: theme.typography.sizes.xs,
    fontWeight: '700' as any,
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.md,
  },
  titleContainer: {
    flex: 1,
    marginRight: theme.spacing.md,
  },
  brand: {
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.primary[600],
    fontWeight: '600' as any,
    textTransform: 'uppercase',
    letterSpacing: theme.typography.letterSpacing.wide,
    marginBottom: theme.spacing.xs,
  },
  name: {
    fontSize: theme.typography.sizes.base,
    fontWeight: '600' as any,
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
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  price: {
    fontSize: theme.typography.sizes.lg,
    fontWeight: '700' as any,
    color: theme.colors.success[600],
    marginRight: theme.spacing.sm,
  },
  originalPrice: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.text.tertiary,
    textDecorationLine: 'line-through',
    fontWeight: '500' as any,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.gray[100],
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.xs,
  },
  quantityButton: {
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.md,
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    ...theme.shadows.sm,
  },
  quantityButtonDisabled: {
    backgroundColor: theme.colors.gray[200],
    shadowOpacity: 0,
    elevation: 0,
  },
  quantityDisplay: {
    minWidth: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quantity: {
    fontSize: theme.typography.sizes.base,
    fontWeight: '600' as any,
    color: theme.colors.text.primary,
  },
  totalContainer: {
    alignItems: 'flex-end',
  },
  totalLabel: {
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.text.secondary,
    fontWeight: '500' as any,
    marginBottom: theme.spacing.xs,
  },
  total: {
    fontSize: theme.typography.sizes.lg,
    fontWeight: '700' as any,
    color: theme.colors.text.primary,
  },
  stockWarning: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.warning[50],
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    marginTop: theme.spacing.md,
  },
  stockWarningText: {
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.warning[700],
    fontWeight: '500' as any,
    marginLeft: theme.spacing.xs,
  },
}); 