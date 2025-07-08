import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Product } from '../types';
import { theme } from '../styles/theme';
import { useCartStore } from '../store/cartStore';
import { Ionicons } from '@expo/vector-icons';

interface ProductCardProps {
  product: Product;
  onPress: () => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onPress,
}) => {
  const { items, addItem, updateQuantity, removeItem } = useCartStore();
  const renderStars = (rating: number) => {
    return '★'.repeat(Math.floor(rating)) + '☆'.repeat(5 - Math.floor(rating));
  };

  // Check if product is in cart and get current quantity
  const cartItem = items.find(item => item.product.id === product.id);
  const isInCart = !!cartItem;
  const currentQuantity = cartItem?.quantity || 0;

  const handleAddToCart = async () => {
    try {
      await addItem(product, 1);
    } catch (error) {
      console.error('Failed to add item to cart:', error);
    }
  };

  const handleIncrement = async () => {
    if (currentQuantity < product.stockQuantity) {
      try {
        await updateQuantity(product.id, currentQuantity + 1);
      } catch (error) {
        console.error('Failed to update quantity:', error);
      }
    }
  };

  const handleDecrement = async () => {
    if (currentQuantity > 0) {
      try {
        await updateQuantity(product.id, currentQuantity - 1);
      } catch (error) {
        console.error('Failed to update quantity:', error);
      }
    }
  };

  const handleRemove = async () => {
    try {
      await removeItem(product.id);
    } catch (error) {
      console.error('Failed to remove item from cart:', error);
    }
  };

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.9}>
      <View style={styles.imageContainer}>
        <Image source={{ uri: product.image }} style={styles.image} />
        {product.originalPrice && Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100) > 0 && (
          <View style={styles.discountBadge}>
            <Text style={styles.discountText}>
              {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% OFF
            </Text>
          </View>
        )}
        
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
        {/* Brand and Category Row */}
        <View style={styles.brandCategoryRow}>
          <View style={styles.brandBadge}>
            <Text style={styles.brandText}>{product.brand}</Text>
          </View>
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>{product.category}</Text>
          </View>
        </View>

        {/* Product Name */}
        <Text style={styles.name} numberOfLines={2}>
          {product.name}
        </Text>

        {/* Rating and Reviews */}
        <View style={styles.ratingSection}>
          <View style={styles.starsContainer}>
            <Text style={styles.stars}>{renderStars(product.rating)}</Text>
            <Text style={styles.ratingValue}>{product.rating}</Text>
          </View>
          <Text style={styles.reviewCount}>({product.reviewCount} reviews)</Text>
        </View>

        {/* Price Section */}
        <View style={styles.priceSection}>
          <View style={styles.currentPriceContainer}>
            <Text style={styles.currencySymbol}>$</Text>
            <Text style={styles.price}>{product.price}</Text>
          </View>
          {product.originalPrice && (product.originalPrice - product.price) > 0 && (
            <View style={styles.originalPriceContainer}>
              <Text style={styles.originalPrice}>${product.originalPrice}</Text>
              <Text style={styles.savings}>
                Save ${(product.originalPrice - product.price).toFixed(2)}
              </Text>
            </View>
          )}
        </View>

        {product.tags.length > 0 && (
          <View style={styles.tagsContainer}>
            {product.tags.slice(0, 2).map((tag, index) => (
              <View key={index} style={styles.tag}>
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Add to Cart Section */}
        {product.inStock && (
          <View style={styles.addToCartContainer}>
            {!isInCart ? (
              <TouchableOpacity 
                style={styles.addToCartButton} 
                onPress={handleAddToCart}
                activeOpacity={0.8}
              >
                <Ionicons name="cart-outline" size={18} color={theme.colors.background} />
                <Text style={styles.addToCartText}>Add to Cart</Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.quantityContainer}>
                <View style={styles.quantityControls}>
                  <TouchableOpacity 
                    style={styles.quantityButton} 
                    onPress={handleDecrement}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="remove" size={16} color={theme.colors.primary[600]} />
                  </TouchableOpacity>
                  <Text style={styles.quantityText}>{currentQuantity}</Text>
                  <TouchableOpacity 
                    style={styles.quantityButton} 
                    onPress={handleIncrement}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="add" size={16} color={theme.colors.primary[600]} />
                  </TouchableOpacity>
                </View>
                <TouchableOpacity 
                  style={styles.deleteButton} 
                  onPress={handleRemove}
                  activeOpacity={0.7}
                >
                  <Ionicons name="trash" size={14} color={theme.colors.error[600]} />
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius['2xl'],
    marginBottom: theme.spacing.lg,
    marginHorizontal: theme.spacing.xs,
    ...theme.shadows.md,
  },
  imageContainer: {
    position: 'relative',
    width: '100%',
    height: 220,
    overflow: 'hidden',
    borderTopLeftRadius: theme.borderRadius['2xl'],
    borderTopRightRadius: theme.borderRadius['2xl'],
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  discountBadge: {
    position: 'absolute',
    top: theme.spacing.md,
    right: theme.spacing.md,
    backgroundColor: theme.colors.error[600],
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderTopLeftRadius: theme.borderRadius.md,
    borderBottomLeftRadius: theme.borderRadius.md,
    borderTopRightRadius: theme.borderRadius.sm,
    borderBottomRightRadius: theme.borderRadius.sm,
    ...theme.shadows.lg,
    borderWidth: 2,
    borderColor: theme.colors.background,
    transform: [{ rotate: '-8deg' }],
    // Tag-like design with notch effect
    shadowColor: theme.colors.error[800],
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 6,
  },
  discountText: {
    color: theme.colors.text.inverse,
    fontSize: theme.typography.sizes.xs,
    fontWeight: '800' as any,
    textAlign: 'center',
    textTransform: 'uppercase',
    letterSpacing: theme.typography.letterSpacing.wide,
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
    padding: theme.spacing.lg,
    borderBottomLeftRadius: theme.borderRadius['2xl'],
    borderBottomRightRadius: theme.borderRadius['2xl'],
    backgroundColor: theme.colors.background,
  },
  brandCategoryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  brandBadge: {
    backgroundColor: theme.colors.primary[600],
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.full,
    ...theme.shadows.md,
    elevation: 3,
  },
  brandText: {
    fontSize: 12,
    fontWeight: '800' as any,
    color: theme.colors.text.inverse,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  categoryBadge: {
    backgroundColor: theme.colors.background,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.full,
    borderWidth: 1.5,
    borderColor: theme.colors.primary[200],
    ...theme.shadows.sm,
  },
  categoryText: {
    fontSize: 12,
    color: theme.colors.primary[700],
    fontWeight: '700' as any,
    textTransform: 'capitalize',
  },
  name: {
    fontSize: 20,
    fontWeight: '700' as any,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.md,
    lineHeight: 22,
  },
  ratingSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
  },
  starsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.warning[50],
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.warning[200],
  },
  stars: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.warning[500],
    marginRight: theme.spacing.xs,
  },
  ratingValue: {
    fontSize: theme.typography.sizes.sm,
    fontWeight: '700' as any,
    color: theme.colors.warning[700],
  },
  reviewCount: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.text.secondary,
    fontWeight: '500' as any,
    fontStyle: 'italic',
  },
  priceSection: {
    marginBottom: theme.spacing.md,
  },
  currentPriceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: theme.spacing.xs,
  },
  currencySymbol: {
    fontSize: theme.typography.sizes.base,
    fontWeight: '600' as any,
    color: theme.colors.text.primary,
    marginRight: 2,
  },
  price: {
    fontSize: theme.typography.sizes.xl,
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
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  tag: {
    backgroundColor: theme.colors.primary[100],
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.full,
    marginRight: theme.spacing.xs,
    marginBottom: theme.spacing.xs,
  },
  tagText: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.primary[700],
    fontWeight: '600' as any,
  },
  addToCartContainer: {
    marginTop: theme.spacing.lg,
    paddingTop: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.gray[200],
  },
  addToCartButton: {
    backgroundColor: theme.colors.primary[600],
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    ...theme.shadows.sm,
  },
  addToCartText: {
    color: theme.colors.background,
    fontSize: theme.typography.sizes.sm,
    fontWeight: '600' as any,
    marginLeft: theme.spacing.sm,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.gray[100],
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.xs,
  },
  quantityButton: {
    width: 28,
    height: 28,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    ...theme.shadows.sm,
  },
  quantityText: {
    fontSize: theme.typography.sizes.sm,
    fontWeight: '700' as any,
    color: theme.colors.text.primary,
    marginHorizontal: theme.spacing.md,
    minWidth: 20,
    textAlign: 'center',
  },
  deleteButton: {
    width: 32,
    height: 32,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.error[50],
    alignItems: 'center',
    justifyContent: 'center',
    ...theme.shadows.sm,
  },
}); 