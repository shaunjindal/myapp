import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Product } from '../types';
import { theme } from '../styles/theme';
import { Ionicons } from '@expo/vector-icons';
import { formatPrice } from '../utils/currencyUtils';

interface ProductCardProps {
  product: Product;
  onPress: () => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onPress,
}) => {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.9}>
      <View style={styles.imageContainer}>
        <Image source={{ uri: product.image }} style={styles.image} />
        
        {/* In Stock Indicator */}
        {product.inStock && (
          <View style={styles.inStockBadge}>
            <Ionicons name="checkmark-circle" size={12} color={theme.colors.success[600]} />
            <Text style={styles.inStockText}>In Stock</Text>
          </View>
        )}
        
        {!product.inStock && (
          <View style={styles.outOfStockOverlay}>
            <Text style={styles.outOfStockText}>Out of Stock</Text>
          </View>
        )}
      </View>

      <View style={styles.content}>
        {/* Product Name */}
        <Text style={styles.name} numberOfLines={2}>
          {product.name}
        </Text>

        {/* Price Section */}
        <View style={styles.priceSection}>
          <View style={styles.currentPriceContainer}>
            <Text style={styles.price}>{formatPrice(product.price)}</Text>
          </View>
          {product.originalPrice && (product.originalPrice - product.price) > 0 && (
            <View style={styles.originalPriceContainer}>
              <Text style={styles.originalPrice}>{formatPrice(product.originalPrice)}</Text>
              <Text style={styles.savings}>
                Save {formatPrice(product.originalPrice - product.price)}
              </Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.xl,
    flex: 1,
    minWidth: 140,
    maxWidth: 250,
    flexBasis: 170,
    ...theme.shadows.md,
  },
  imageContainer: {
    position: 'relative',
    width: '100%',
    height: 140,
    overflow: 'hidden',
    borderTopLeftRadius: theme.borderRadius.xl,
    borderTopRightRadius: theme.borderRadius.xl,
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  inStockBadge: {
    position: 'absolute',
    top: theme.spacing.md,
    left: theme.spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.success[50],
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.success[200],
  },
  inStockText: {
    color: theme.colors.success[700],
    fontSize: theme.typography.sizes.xs,
    fontWeight: '600' as any,
    marginLeft: theme.spacing.xs,
  },
  outOfStockOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  outOfStockText: {
    color: theme.colors.text.inverse,
    fontSize: theme.typography.sizes.lg,
    fontWeight: '700' as any,
  },
  content: {
    padding: theme.spacing.md,
    borderBottomLeftRadius: theme.borderRadius.xl,
    borderBottomRightRadius: theme.borderRadius.xl,
    backgroundColor: theme.colors.background,
  },
  name: {
    fontSize: 16,
    fontWeight: '700' as any,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.sm,
    lineHeight: 18,
  },
  priceSection: {
    marginBottom: theme.spacing.md,
  },
  currentPriceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: theme.spacing.xs,
  },
  price: {
    fontSize: theme.typography.sizes.lg,
    fontWeight: '800' as any,
    color: theme.colors.text.primary,
  },
  originalPriceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  originalPrice: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.text.tertiary,
    textDecorationLine: 'line-through',
    fontWeight: '500' as any,
  },
  savings: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.success[700],
    fontWeight: '600' as any,
    backgroundColor: theme.colors.success[50],
    paddingHorizontal: theme.spacing.xs,
    paddingVertical: 2,
    borderRadius: theme.borderRadius.sm,
  },
}); 