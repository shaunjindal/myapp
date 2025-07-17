import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Product } from '../types';
import { theme } from '../styles/theme';
import { formatPrice } from '../utils/currencyUtils';

interface DimensionSelectorProps {
  product: Product;
  onDimensionChange: (length: number | null, calculatedPrice: number | null) => void;
  initialLength?: number;
}

export const DimensionSelector: React.FC<DimensionSelectorProps> = ({
  product,
  onDimensionChange,
  initialLength,
}) => {
  const [customLength, setCustomLength] = useState<string>(initialLength?.toString() || '');
  const [calculatedPrice, setCalculatedPrice] = useState<number | null>(null);
  const [error, setError] = useState<string>('');

  // Don't render if product doesn't support variable dimensions
  if (!product.isVariableDimension || !product.fixedHeight || !product.variableDimensionRate || !product.maxLength) {
    return null;
  }

  const calculatePrice = (length: number): number => {
    if (!product.fixedHeight || !product.variableDimensionRate) return product.price;
    
    // Calculate area: fixedHeight × customLength
    const area = product.fixedHeight * length;
    
    // Calculate final price: area × rate (rate already includes tax)
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

  const handleLengthChange = (text: string) => {
    setCustomLength(text);
    setError('');

    const numericLength = parseFloat(text);
    
    if (isNaN(numericLength) || text.trim() === '') {
      setCalculatedPrice(null);
      onDimensionChange(null, null);
      return;
    }

    const validationError = validateLength(numericLength);
    if (validationError) {
      setError(validationError);
      setCalculatedPrice(null);
      onDimensionChange(null, null);
      return;
    }

    const price = calculatePrice(numericLength);
    setCalculatedPrice(price);
    onDimensionChange(numericLength, price);
  };

  const incrementLength = () => {
    const currentLength = parseFloat(customLength) || 0;
    const newLength = currentLength + 0.5; // Increment by 0.5 units
    if (product.maxLength && newLength <= product.maxLength) {
      handleLengthChange(newLength.toString());
    }
  };

  const decrementLength = () => {
    const currentLength = parseFloat(customLength) || 0;
    const newLength = Math.max(0.5, currentLength - 0.5); // Minimum 0.5 units
    handleLengthChange(newLength.toString());
  };

  useEffect(() => {
    if (initialLength) {
      handleLengthChange(initialLength.toString());
    }
  }, [initialLength]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Select Length</Text>
      </View>

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

      <View style={styles.lengthSelector}>
        <Text style={styles.selectorLabel}>
          Select Length ({getUnitDisplayName()}):
        </Text>
        
        <View style={styles.inputContainer}>
          <TouchableOpacity
            style={[styles.controlButton, parseFloat(customLength) <= 0.5 && styles.controlButtonDisabled]}
            onPress={decrementLength}
            disabled={parseFloat(customLength) <= 0.5}
          >
            <Ionicons 
              name="remove" 
              size={20} 
              color={parseFloat(customLength) <= 0.5 ? theme.colors.gray[400] : theme.colors.primary[600]} 
            />
          </TouchableOpacity>

          <TextInput
            style={styles.lengthInput}
            value={customLength}
            onChangeText={handleLengthChange}
            placeholder="Enter length"
            keyboardType="numeric"
            selectTextOnFocus
          />

          <TouchableOpacity
            style={[
              styles.controlButton,
              (product.maxLength && parseFloat(customLength) >= product.maxLength) ? styles.controlButtonDisabled : null
            ]}
            onPress={incrementLength}
            disabled={product.maxLength ? parseFloat(customLength) >= product.maxLength : false}
          >
            <Ionicons 
              name="add" 
              size={20} 
              color={
                product.maxLength && parseFloat(customLength) >= product.maxLength
                  ? theme.colors.gray[400] 
                  : theme.colors.primary[600]
              } 
            />
          </TouchableOpacity>
        </View>

        {error ? (
          <View style={styles.errorContainer}>
            <Ionicons name="warning" size={16} color={theme.colors.error[600]} />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}
      </View>

      {calculatedPrice !== null && !error && (
        <View style={styles.priceCalculation}>
          <View style={styles.calculationHeader}>
            <Ionicons name="calculator-outline" size={18} color={theme.colors.success[600]} />
            <Text style={styles.calculationTitle}>Price Calculation</Text>
          </View>
          
          <View style={styles.calculationDetails}>
            <View style={styles.calculationRow}>
              <Text style={styles.calculationLabel}>Area:</Text>
              <Text style={styles.calculationValue}>
                {product.fixedHeight} × {parseFloat(customLength)} = {(product.fixedHeight * parseFloat(customLength)).toFixed(2)} sq {getUnitSymbol()}
              </Text>
            </View>
            <View style={styles.calculationRow}>
              <Text style={styles.calculationLabel}>Rate:</Text>
              <Text style={styles.calculationValue}>
                {formatPrice(product.variableDimensionRate || 0)}/sq {getUnitSymbol()}
              </Text>
            </View>
          </View>

          <View style={styles.finalPrice}>
            <Text style={styles.finalPriceLabel}>Total Price:</Text>
            <Text style={styles.finalPriceValue}>{formatPrice(calculatedPrice)}</Text>
          </View>
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
    marginBottom: theme.spacing.lg,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: theme.typography.sizes.lg,
    fontWeight: '700' as any,
    color: theme.colors.text.primary,
    marginLeft: theme.spacing.sm,
  },
  infoBadge: {
    backgroundColor: theme.colors.primary[50],
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.primary[200],
  },
  infoText: {
    fontSize: theme.typography.sizes.xs,
    fontWeight: '600' as any,
    color: theme.colors.primary[700],
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  dimensionInfo: {
    backgroundColor: theme.colors.gray[50],
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.lg,
  },
  fixedDimensionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
    paddingBottom: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.gray[200],
  },
  dimensionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  dimensionLabel: {
    fontSize: theme.typography.sizes.base,
    fontWeight: '500' as any,
    color: theme.colors.text.secondary,
  },
  dimensionValue: {
    fontSize: theme.typography.sizes.base,
    fontWeight: '700' as any,
    color: theme.colors.text.primary,
  },
  lengthSelector: {
    marginBottom: theme.spacing.lg,
  },
  selectorLabel: {
    fontSize: theme.typography.sizes.base,
    fontWeight: '600' as any,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.md,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.gray[50],
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.gray[200],
  },
  controlButton: {
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.md,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    ...theme.shadows.sm,
  },
  controlButtonDisabled: {
    backgroundColor: theme.colors.gray[200],
    shadowOpacity: 0,
  },
  lengthInput: {
    flex: 1,
    textAlign: 'center',
    fontSize: theme.typography.sizes.lg,
    fontWeight: '600' as any,
    color: theme.colors.text.primary,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: theme.spacing.sm,
    backgroundColor: theme.colors.error[50],
    padding: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
  },
  errorText: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.error[700],
    marginLeft: theme.spacing.xs,
    fontWeight: '500' as any,
  },
  priceCalculation: {
    backgroundColor: theme.colors.success[50],
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.success[200],
  },
  calculationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  calculationTitle: {
    fontSize: theme.typography.sizes.base,
    fontWeight: '700' as any,
    color: theme.colors.success[800],
    marginLeft: theme.spacing.sm,
  },
  calculationDetails: {
    marginBottom: theme.spacing.md,
  },
  calculationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.xs,
  },
  calculationLabel: {
    fontSize: theme.typography.sizes.sm,
    fontWeight: '500' as any,
    color: theme.colors.success[700],
  },
  calculationValue: {
    fontSize: theme.typography.sizes.sm,
    fontWeight: '600' as any,
    color: theme.colors.success[800],
  },
  finalPrice: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.success[300],
  },
  finalPriceLabel: {
    fontSize: theme.typography.sizes.lg,
    fontWeight: '700' as any,
    color: theme.colors.success[800],
  },
  finalPriceValue: {
    fontSize: theme.typography.sizes.xl,
    fontWeight: '800' as any,
    color: theme.colors.success[800],
  },
}); 