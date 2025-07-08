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
        {product.originalPrice && (
          <View style={styles.discountBadge}>
            <Text style={styles.discountText}>
              {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% OFF
            </Text>
          </View>
        )}
        {!product.inStock && (
          <View style={styles.outOfStockOverlay}>
            <Text style={styles.outOfStockText}>Out of Stock</Text>
          </View>
        )}
      </View>

      <View style={styles.content}>
        <View style={styles.brandContainer}>
          <Text style={styles.brand}>{product.brand}</Text>
          <Text style={styles.category}>{product.category}</Text>
        </View>

        <Text style={styles.name} numberOfLines={2}>
          {product.name}
        </Text>

        <View style={styles.ratingContainer}>
          <Text style={styles.stars}>{renderStars(product.rating)}</Text>
          <Text style={styles.rating}>{product.rating}</Text>
          <Text style={styles.reviews}>({product.reviewCount})</Text>
        </View>

        <View style={styles.priceContainer}>
          <Text style={styles.price}>${product.price}</Text>
          {product.originalPrice && (
            <Text style={styles.originalPrice}>${product.originalPrice}</Text>
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
                <Ionicons name="add" size={18} color={theme.colors.background} />
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
    overflow: 'hidden',
    ...theme.shadows.md,
    flex: 1,
    minWidth: 0,
  },
  imageContainer: {
    position: 'relative',
    width: '100%',
    height: 220,
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
    backgroundColor: theme.colors.error[500],
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.md,
  },
  discountText: {
    color: theme.colors.text.inverse,
    fontSize: theme.typography.sizes.xs,
    fontWeight: '700' as any,
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
  },
  brandContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  brand: {
    fontSize: theme.typography.sizes.xs,
    fontWeight: '600' as any,
    color: theme.colors.primary[600],
    textTransform: 'uppercase',
    letterSpacing: theme.typography.letterSpacing.wide,
  },
  category: {
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.text.tertiary,
    fontWeight: '500' as any,
  },
  name: {
    fontSize: theme.typography.sizes.lg,
    fontWeight: '700' as any,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.md,
    lineHeight: theme.typography.lineHeights.tight * theme.typography.sizes.lg,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  stars: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.warning[400],
    marginRight: theme.spacing.xs,
  },
  rating: {
    fontSize: theme.typography.sizes.sm,
    fontWeight: '600' as any,
    color: theme.colors.text.primary,
    marginRight: theme.spacing.xs,
  },
  reviews: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.text.secondary,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  price: {
    fontSize: theme.typography.sizes['2xl'],
    fontWeight: '800' as any,
    color: theme.colors.success[600],
    marginRight: theme.spacing.md,
  },
  originalPrice: {
    fontSize: theme.typography.sizes.base,
    color: theme.colors.text.tertiary,
    textDecorationLine: 'line-through',
    fontWeight: '500' as any,
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
    fontSize: theme.typography.sizes.xs,
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