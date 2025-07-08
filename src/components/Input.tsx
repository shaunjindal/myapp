import React, { useState } from 'react';
import { TextInput, View, Text, StyleSheet, TextInputProps, ViewStyle } from 'react-native';
import { theme } from '../styles/theme';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  helperText?: string;
  containerStyle?: ViewStyle;
  inputStyle?: ViewStyle;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'outlined' | 'filled';
  required?: boolean;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  helperText,
  containerStyle,
  inputStyle,
  size = 'md',
  variant = 'outlined',
  required = false,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);

  const getInputStyles = () => {
    const baseStyle: any = {
      fontSize: theme.typography.sizes.base,
      color: theme.colors.text.primary,
      borderRadius: theme.borderRadius.md,
      paddingHorizontal: theme.spacing.lg,
      fontWeight: '400' as any,
      ...theme.shadows.sm,
    };

    // Size variants
    switch (size) {
      case 'sm':
        baseStyle.height = 40;
        baseStyle.fontSize = theme.typography.sizes.sm;
        baseStyle.paddingHorizontal = theme.spacing.md;
        break;
      case 'lg':
        baseStyle.height = 56;
        baseStyle.fontSize = theme.typography.sizes.lg;
        baseStyle.paddingHorizontal = theme.spacing.xl;
        break;
      default: // md
        baseStyle.height = theme.components.input.height;
        break;
    }

    // Variant styles
    if (variant === 'outlined') {
      baseStyle.backgroundColor = theme.colors.background;
      baseStyle.borderWidth = 1.5;
      
      if (error) {
        baseStyle.borderColor = theme.colors.error[500];
      } else if (isFocused) {
        baseStyle.borderColor = theme.colors.primary[500];
        baseStyle.shadowColor = theme.colors.primary[500];
        baseStyle.shadowOpacity = 0.2;
      } else {
        baseStyle.borderColor = theme.colors.gray[300];
      }
    } else { // filled
      baseStyle.backgroundColor = theme.colors.gray[100];
      baseStyle.borderWidth = 0;
      baseStyle.borderBottomWidth = 2;
      baseStyle.borderRadius = theme.borderRadius.md;
      
      if (error) {
        baseStyle.borderBottomColor = theme.colors.error[500];
      } else if (isFocused) {
        baseStyle.borderBottomColor = theme.colors.primary[500];
        baseStyle.backgroundColor = theme.colors.primary[50];
      } else {
        baseStyle.borderBottomColor = theme.colors.gray[400];
      }
    }

    return baseStyle;
  };

  const getLabelStyles = () => ({
    fontSize: theme.typography.sizes.sm,
    fontWeight: '600' as any,
    marginBottom: theme.spacing.sm,
    color: error ? theme.colors.error[600] : theme.colors.text.primary,
  });

  const getHelperTextStyles = () => ({
    fontSize: theme.typography.sizes.xs,
    marginTop: theme.spacing.xs,
    color: error ? theme.colors.error[600] : theme.colors.text.secondary,
  });

  return (
    <View style={[styles.container, containerStyle]}>
      {label && (
        <Text style={getLabelStyles()}>
          {label}
          {required && <Text style={{ color: theme.colors.error[500] }}> *</Text>}
        </Text>
      )}
      
      <TextInput
        style={[getInputStyles(), inputStyle]}
        placeholderTextColor={theme.colors.text.tertiary}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        {...props}
      />
      
      {(error || helperText) && (
        <Text style={getHelperTextStyles()}>
          {error || helperText}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: theme.spacing.lg,
  },
}); 