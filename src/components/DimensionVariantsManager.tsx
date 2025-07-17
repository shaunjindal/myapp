import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, FlatList, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../styles/theme';
import { StyleSheet } from 'react-native';
import { formatPrice } from '../utils/currencyUtils';
import { Product } from '../types';

interface DimensionVariant {
  id: string;
  length: number;
  calculatedPrice: number;
  area: number;
  quantity: number;
}

interface DimensionVariantsManagerProps {
  product: Product;
  onAddSingleItem: (length: number, quantity: number) => Promise<void>;
  existingCartItems?: Array<{ length: number; quantity: number }>;
  onUpdateCartItem?: (length: number, newQuantity: number) => Promise<void>;
}

export const DimensionVariantsManager: React.FC<DimensionVariantsManagerProps> = ({
  product,
  onAddSingleItem,
  existingCartItems = [],
  onUpdateCartItem,
}) => {
  const [currentLength, setCurrentLength] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [isAdding, setIsAdding] = useState<boolean>(false);

  // Don't render if product doesn't support variable dimensions
  if (!product.isVariableDimension || !product.fixedHeight || !product.variableDimensionRate || !product.maxLength) {
    return null;
  }

  const getUnitSymbol = (): string => {
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

  const getUnitDisplayName = (): string => {
    switch (product.dimensionUnit) {
      case 'MILLIMETER': return 'Millimeters';
      case 'CENTIMETER': return 'Centimeters';
      case 'METER': return 'Meters';
      case 'INCH': return 'Inches';
      case 'FOOT': return 'Feet';
      case 'YARD': return 'Yards';
      default: return 'Units';
    }
  };

  const calculatePrice = (length: number): number => {
    if (!product.fixedHeight || !product.variableDimensionRate) return product.price;
    
    // Calculate area: fixedHeight × customLength
    const area = product.fixedHeight * length;
    
    // Calculate final price: area × rate
    const finalPrice = area * product.variableDimensionRate;
    
    return finalPrice;
  };

  const validateLength = (length: number): string => {
    if (length <= 0) {
      return 'Length must be greater than 0';
    }
    if (product.maxLength && length > product.maxLength) {
      return `Length cannot exceed ${product.maxLength} ${getUnitSymbol()}`;
    }
    return '';
  };

  const handleAddToCart = async () => {
    const length = parseFloat(currentLength);
    
    if (isNaN(length) || currentLength.trim() === '') {
      setError('Please enter a valid length');
      return;
    }

    const validationError = validateLength(length);
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsAdding(true);
    try {
      await onAddSingleItem(length, 1);
      setCurrentLength('');
      setError('');
      
      // Show success feedback
      Alert.alert('Added to Cart', `${length} ${getUnitSymbol()} length added successfully!`);
    } catch (error) {
      console.error('Failed to add to cart:', error);
      Alert.alert('Error', 'Failed to add to cart. Please try again.');
    } finally {
      setIsAdding(false);
    }
  };

  const handleUpdateQuantity = async (length: number, delta: number) => {
    try {
      if (delta > 0) {
        // Add more quantity by adding another item with same length
        await onAddSingleItem(length, 1);
        Alert.alert('Updated', `Added 1 more unit of ${length} ${getUnitSymbol()} length`);
      } else if (delta < 0 && onUpdateCartItem) {
        // Find current quantity for this length
        const currentItem = existingCartItems.find(item => item.length === length);
        if (currentItem) {
          const newQuantity = currentItem.quantity - 1;
          
          if (newQuantity <= 0) {
            // Remove item completely
            await onUpdateCartItem(length, 0);
            Alert.alert('Removed', `Removed ${length} ${getUnitSymbol()} length from cart`);
          } else {
            // Decrease quantity by 1
            await onUpdateCartItem(length, newQuantity);
            Alert.alert('Updated', `Reduced ${length} ${getUnitSymbol()} length quantity to ${newQuantity}`);
          }
        }
      } else {
        // Fallback if onUpdateCartItem is not provided
        Alert.alert(
          'Remove Item', 
          `To reduce or remove items with ${length} ${getUnitSymbol()} length, please use the cart page.`,
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('Failed to update quantity:', error);
      Alert.alert('Error', 'Failed to update quantity. Please try again.');
    }
  };

  const incrementLength = () => {
    const current = parseFloat(currentLength) || 0;
    const newLength = current + 0.5;
    if (!product.maxLength || newLength <= product.maxLength) {
      setCurrentLength(newLength.toString());
      setError('');
    }
  };

  const decrementLength = () => {
    const current = parseFloat(currentLength) || 0;
    const newLength = Math.max(0.5, current - 0.5);
    setCurrentLength(newLength.toString());
    setError('');
  };

  const renderCartItem = ({ item }: { item: { length: number; quantity: number } }) => {
    const calculatedPrice = calculatePrice(item.length);
    const area = (product.fixedHeight || 0) * item.length;

    return (
      <View style={styles.cartItem}>
        <View style={styles.cartItemInfo}>
          <View style={styles.cartItemMainInfo}>
            <Text style={styles.cartItemLength}>
              {item.length} {getUnitSymbol()} length
            </Text>
            <Text style={styles.cartItemPrice}>
              {formatPrice(calculatedPrice * item.quantity)}
            </Text>
          </View>
          <View style={styles.cartItemDetails}>
            <Text style={styles.cartItemArea}>
              Area: {area.toFixed(2)} sq {getUnitSymbol()} each
            </Text>
            <Text style={styles.cartItemRate}>
              @ {formatPrice(product.variableDimensionRate || 0)}/sq {getUnitSymbol()}
            </Text>
          </View>
          
          {/* Quantity Controls */}
          <View style={styles.cartItemQuantitySection}>
            <View style={styles.quantityControls}>
              <TouchableOpacity
                style={styles.quantityButton}
                onPress={() => handleUpdateQuantity(item.length, -1)}
              >
                <Ionicons name="remove" size={16} color={theme.colors.primary[600]} />
              </TouchableOpacity>
              <Text style={styles.quantityText}>Qty: {item.quantity}</Text>
              <TouchableOpacity
                style={styles.quantityButton}
                onPress={() => handleUpdateQuantity(item.length, 1)}
              >
                <Ionicons name="add" size={16} color={theme.colors.primary[600]} />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Ionicons name="resize-outline" size={20} color={theme.colors.primary[600]} />
          <Text style={styles.title}>Custom Dimensions</Text>
        </View>
        <View style={styles.infoBadge}>
          <Text style={styles.infoText}>Variable Size</Text>
        </View>
      </View>

      {/* Product Dimension Info */}
      <View style={styles.dimensionInfo}>
        <View style={styles.fixedDimensionRow}>
          <Text style={styles.dimensionLabel}>Fixed Height:</Text>
          <Text style={styles.dimensionValue}>
            {product.fixedHeight} {getUnitSymbol()}
          </Text>
        </View>
        <View style={styles.dimensionRow}>
          <Text style={styles.dimensionLabel}>Max Length:</Text>
          <Text style={styles.dimensionValue}>
            {product.maxLength} {getUnitSymbol()}
          </Text>
        </View>
        <View style={styles.dimensionRow}>
          <Text style={styles.dimensionLabel}>Rate:</Text>
          <Text style={styles.dimensionValue}>
            {formatPrice(product.variableDimensionRate || 0)}/sq {getUnitSymbol()}
          </Text>
        </View>
      </View>

      {/* Add Custom Length Section */}
      <View style={styles.addLengthSection}>
        <Text style={styles.sectionTitle}>Add Custom Length</Text>
        
        <View style={styles.lengthInputContainer}>
          <Text style={styles.inputLabel}>
            Length ({getUnitDisplayName()}):
          </Text>
          
          <View style={styles.inputRow}>
            <TouchableOpacity
              style={[styles.controlButton, parseFloat(currentLength) <= 0.5 && styles.controlButtonDisabled]}
              onPress={decrementLength}
              disabled={parseFloat(currentLength) <= 0.5}
            >
              <Ionicons 
                name="remove" 
                size={16} 
                color={parseFloat(currentLength) <= 0.5 ? theme.colors.gray[400] : theme.colors.primary[600]} 
              />
            </TouchableOpacity>

            <TextInput
              style={styles.lengthInput}
              value={currentLength}
              onChangeText={(text) => {
                setCurrentLength(text);
                setError('');
              }}
              placeholder="Enter length"
              keyboardType="numeric"
              selectTextOnFocus
            />

            <TouchableOpacity
              style={[
                styles.controlButton,
                (product.maxLength && parseFloat(currentLength) >= product.maxLength) ? styles.controlButtonDisabled : null
              ]}
              onPress={incrementLength}
              disabled={product.maxLength ? parseFloat(currentLength) >= product.maxLength : false}
            >
              <Ionicons 
                name="add" 
                size={16} 
                color={
                  product.maxLength && parseFloat(currentLength) >= product.maxLength
                    ? theme.colors.gray[400] 
                    : theme.colors.primary[600]
                } 
              />
            </TouchableOpacity>
          </View>

          {/* Add to Cart Button - Separate Row */}
          <TouchableOpacity
            style={[styles.addToCartButtonFullWidth, (!currentLength.trim() || isAdding) && styles.addToCartButtonDisabled]}
            onPress={handleAddToCart}
            disabled={!currentLength.trim() || isAdding}
          >
            {isAdding ? (
              <Ionicons name="hourglass" size={18} color={theme.colors.gray[400]} />
            ) : (
              <Ionicons name="cart" size={18} color={theme.colors.text.inverse} />
            )}
            <Text style={[styles.addToCartButtonText, (!currentLength.trim() || isAdding) && styles.addToCartButtonTextDisabled]}>
              {isAdding ? 'Adding...' : 'Add to Cart'}
            </Text>
          </TouchableOpacity>

          {error ? (
            <View style={styles.errorContainer}>
              <Ionicons name="warning" size={16} color={theme.colors.error[600]} />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          {/* Price Preview */}
          {currentLength.trim() && !error && !isNaN(parseFloat(currentLength)) && (
            <View style={styles.pricePreview}>
              <Text style={styles.pricePreviewText}>
                Price for {currentLength} {getUnitSymbol()}: {formatPrice(calculatePrice(parseFloat(currentLength)))}
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* Cart Items Section */}
      {existingCartItems.length > 0 && (
        <View style={styles.cartItemsSection}>
          <View style={styles.cartItemsSectionHeader}>
            <Text style={styles.sectionTitle}>In Your Cart ({existingCartItems.length} sizes)</Text>
          </View>

          <FlatList
            data={existingCartItems}
            renderItem={renderCartItem}
            keyExtractor={(item, index) => `${item.length}-${index}`}
            style={styles.cartItemsList}
            showsVerticalScrollIndicator={false}
            nestedScrollEnabled
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.lg,
    marginVertical: theme.spacing.md,
    ...theme.shadows.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: theme.typography.sizes.lg,
    fontWeight: '700',
    color: theme.colors.text.primary,
    marginLeft: theme.spacing.sm,
  },
  infoBadge: {
    backgroundColor: theme.colors.primary[100],
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.full,
    borderWidth: 1,
    borderColor: theme.colors.primary[200],
  },
  infoText: {
    fontSize: theme.typography.sizes.sm,
    fontWeight: '600',
    color: theme.colors.primary[700],
  },
  dimensionInfo: {
    backgroundColor: theme.colors.gray[50],
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    marginBottom: theme.spacing.lg,
  },
  fixedDimensionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: theme.spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.gray[200],
    marginBottom: theme.spacing.sm,
  },
  dimensionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: theme.spacing.xs,
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
  addLengthSection: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    marginBottom: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.gray[200],
  },
  sectionTitle: {
    fontSize: theme.typography.sizes.base,
    fontWeight: '600',
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.md,
  },
  lengthInputContainer: {
    gap: theme.spacing.md,
  },
  inputLabel: {
    fontSize: theme.typography.sizes.sm,
    fontWeight: '500',
    color: theme.colors.text.secondary,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  controlButton: {
    backgroundColor: theme.colors.gray[100],
    borderRadius: theme.borderRadius.md,
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: theme.colors.gray[300],
  },
  controlButtonDisabled: {
    backgroundColor: theme.colors.gray[50],
    borderColor: theme.colors.gray[200],
  },
  lengthInput: {
    flex: 1,
    backgroundColor: theme.colors.background,
    borderWidth: 1,
    borderColor: theme.colors.gray[300],
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.sm,
    fontSize: theme.typography.sizes.base,
    color: theme.colors.text.primary,
    textAlign: 'center',
    marginHorizontal: theme.spacing.xs,
  },
  addToCartButton: {
    backgroundColor: theme.colors.primary[600],
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    minWidth: 120,
  },
  addToCartButtonFullWidth: {
    backgroundColor: theme.colors.primary[600],
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.sm,
    marginTop: theme.spacing.md,
    ...theme.shadows.sm,
  },
  addToCartButtonDisabled: {
    backgroundColor: theme.colors.gray[300],
  },
  addToCartButtonText: {
    fontSize: theme.typography.sizes.sm,
    fontWeight: '600',
    color: theme.colors.text.inverse,
  },
  addToCartButtonTextDisabled: {
    color: theme.colors.gray[500],
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.error[50],
    padding: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.error[200],
  },
  errorText: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.error[700],
    marginLeft: theme.spacing.xs,
    fontWeight: '500',
  },
  pricePreview: {
    backgroundColor: theme.colors.primary[50],
    padding: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.primary[200],
  },
  pricePreviewText: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.primary[700],
    fontWeight: '600',
    textAlign: 'center',
  },
  cartItemsSection: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.gray[200],
  },
  cartItemsSectionHeader: {
    marginBottom: theme.spacing.md,
  },
  cartItemsList: {
    maxHeight: 200,
  },
  cartItem: {
    backgroundColor: theme.colors.gray[50],
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.gray[200],
  },
  cartItemInfo: {
    flex: 1,
  },
  cartItemMainInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.xs,
  },
  cartItemLength: {
    fontSize: theme.typography.sizes.base,
    fontWeight: '600',
    color: theme.colors.text.primary,
  },
  cartItemPrice: {
    fontSize: theme.typography.sizes.base,
    fontWeight: '700',
    color: theme.colors.primary[600],
  },
  cartItemDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  cartItemArea: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.text.secondary,
  },
  cartItemRate: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.text.secondary,
  },
  cartItemQuantitySection: {
    alignItems: 'center',
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.xs,
    borderWidth: 1,
    borderColor: theme.colors.gray[300],
  },
  quantityButton: {
    backgroundColor: theme.colors.gray[100],
    borderRadius: theme.borderRadius.sm,
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
    margin: theme.spacing.xs,
  },
  quantityText: {
    fontSize: theme.typography.sizes.sm,
    fontWeight: '600',
    color: theme.colors.text.primary,
    paddingHorizontal: theme.spacing.sm,
    minWidth: 50,
    textAlign: 'center',
  },
});