import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { CartItem as CartItemType } from '../types';
import { theme } from '../styles/theme';
import { formatPrice } from '../utils/currencyUtils';
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
  
  // For variable dimension products, calculatedUnitPrice is the total price
  const effectivePrice = item.calculatedUnitPrice && product.isVariableDimension ? 
    item.calculatedUnitPrice : 
    (item.calculatedUnitPrice || product.price);
    
  const total = item.calculatedUnitPrice && product.isVariableDimension ? 
    item.calculatedUnitPrice :  // Don't multiply by quantity for variable dimensions
    effectivePrice * quantity;
    
  const isDiscounted = product.originalPrice && product.originalPrice > product.price && !item.calculatedUnitPrice;

  // Helper function to get unit symbol
  const getUnitSymbol = () => {
    switch (product.dimensionUnit) {
      case 'MILLIMETER': return 'mm';
      case 'CENTIMETER': return 'cm'; 
      case 'METER': return 'm';
      case 'INCH': return 'in';
      case 'FOOT': return 'ft';
      case 'YARD': return 'yd';
      default: return 'units';
    }
  };

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
          {product.isVariableDimension && item.calculatedUnitPrice ? (
            <View style={styles.variablePriceDisplay}>
              <Text style={styles.price}>{formatPrice(item.calculatedUnitPrice)}</Text>
              <Text style={styles.priceNote}>Total for custom size</Text>
            </View>
          ) : (
            <Text style={styles.price}>
              {item.calculatedUnitPrice ? formatPrice(item.calculatedUnitPrice) : formatPrice(product.price)}
            </Text>
          )}
          {isDiscounted && product.originalPrice && !item.calculatedUnitPrice && (
            <Text style={styles.originalPrice}>{formatPrice(product.originalPrice)}</Text>
          )}
          {product.isVariableDimension && product.variableDimensionRate && (
            <Text style={styles.rateInfo}>
              Rate: {formatPrice(product.variableDimensionRate)}/sq {getUnitSymbol()}
            </Text>
          )}
        </View>

        {/* Enhanced Custom Dimensions Info */}
        {item.customLength && product.isVariableDimension && (
          <View style={styles.dimensionsContainer}>
            <View style={styles.dimensionsBadge}>
              <Ionicons name="resize-outline" size={12} color={theme.colors.primary[600]} />
              <Text style={styles.dimensionsText}>Custom Dimensions</Text>
            </View>
            
            <View style={styles.dimensionsDetails}>
              <Text style={styles.dimensionsSubtext}>
                Length: {item.customLength} {getUnitSymbol()}
              </Text>
              {product.fixedHeight && (
                <Text style={styles.dimensionsSubtext}>
                  Height: {product.fixedHeight} {getUnitSymbol()} (fixed)
                </Text>
              )}
              {product.fixedHeight && item.customLength && (
                <Text style={styles.dimensionsSubtext}>
                  Area: {(product.fixedHeight * item.customLength).toFixed(2)} sq {getUnitSymbol()}
                </Text>
              )}
            </View>
          </View>
        )}

        <View style={styles.footer}>
          {/* For variable dimension products, quantity should typically be 1 */}
          {product.isVariableDimension ? (
            <View style={styles.quantityContainer}>
              <View style={styles.quantityDisplay}>
                <Text style={styles.quantity}>Qty: 1</Text>
                <Text style={styles.quantityNote}>(Custom size)</Text>
              </View>
            </View>
          ) : (
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
          )}

          <View style={styles.totalContainer}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.total}>{formatPrice(total)}</Text>
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
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: theme.colors.gray[200],
  },
  imageContainer: {
    position: 'relative',
    marginRight: 16,
  },
  image: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: theme.colors.gray[100],
  },
  discountBadge: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: theme.colors.error[500],
    borderRadius: 12,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  discountText: {
    color: theme.colors.text.inverse,
    fontSize: 10,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  titleContainer: {
    flex: 1,
    marginRight: 8,
  },
  brand: {
    fontSize: 12,
    color: theme.colors.gray[600],
    marginBottom: 2,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text.primary,
    lineHeight: 20,
  },
  removeButton: {
    padding: 4,
  },
  priceContainer: {
    marginBottom: 12,
  },
  variablePriceDisplay: {
    flexDirection: 'column',
  },
  price: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.primary[600],
  },
  priceNote: {
    fontSize: 12,
    color: theme.colors.gray[600],
    marginTop: 2,
  },
  rateInfo: {
    fontSize: 12,
    color: theme.colors.gray[600],
    marginTop: 4,
  },
  originalPrice: {
    fontSize: 14,
    color: theme.colors.gray[500],
    textDecorationLine: 'line-through',
    marginTop: 2,
  },
  dimensionsContainer: {
    backgroundColor: theme.colors.primary[50],
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  dimensionsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  dimensionsText: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.primary[600],
    marginLeft: 4,
  },
  dimensionsDetails: {
    marginLeft: 16,
  },
  dimensionsSubtext: {
    fontSize: 12,
    color: theme.colors.gray[600],
    marginBottom: 2,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quantityButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.colors.gray[100],
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityButtonDisabled: {
    backgroundColor: theme.colors.gray[50],
  },
  quantityDisplay: {
    marginHorizontal: 16,
    minWidth: 40,
    alignItems: 'center',
  },
  quantity: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text.primary,
  },
  quantityNote: {
    fontSize: 10,
    color: theme.colors.gray[500],
    marginTop: 2,
  },
  totalContainer: {
    alignItems: 'flex-end',
  },
  totalLabel: {
    fontSize: 12,
    color: theme.colors.gray[600],
    marginBottom: 2,
  },
  total: {
    fontSize: 18,
    fontWeight: '700',
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