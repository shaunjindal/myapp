import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { theme } from '../styles/theme';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'success' | 'warning' | 'error';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  fullWidth?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  fullWidth = false,
  style,
  textStyle,
}) => {
  const getButtonStyles = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      borderRadius: theme.borderRadius.lg,
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'row',
      ...theme.shadows.sm,
      minWidth: 60,
    };

    // Size styles
    switch (size) {
      case 'sm':
        baseStyle.height = theme.components.button.height.sm;
        baseStyle.paddingHorizontal = theme.spacing.md;
        baseStyle.minWidth = 70;
        break;
      case 'lg':
        baseStyle.height = theme.components.button.height.lg;
        baseStyle.paddingHorizontal = theme.spacing['2xl'];
        break;
      default: // md
        baseStyle.height = theme.components.button.height.md;
        baseStyle.paddingHorizontal = theme.spacing.lg;
        break;
    }

    // Variant styles
    switch (variant) {
      case 'primary':
        baseStyle.backgroundColor = theme.colors.primary[600];
        if (disabled) {
          baseStyle.backgroundColor = theme.colors.gray[300];
          baseStyle.shadowOpacity = 0;
          baseStyle.elevation = 0;
        }
        break;
      case 'secondary':
        baseStyle.backgroundColor = theme.colors.secondary[600];
        if (disabled) {
          baseStyle.backgroundColor = theme.colors.gray[300];
          baseStyle.shadowOpacity = 0;
          baseStyle.elevation = 0;
        }
        break;
      case 'success':
        baseStyle.backgroundColor = theme.colors.success[600];
        if (disabled) {
          baseStyle.backgroundColor = theme.colors.gray[300];
          baseStyle.shadowOpacity = 0;
          baseStyle.elevation = 0;
        }
        break;
      case 'warning':
        baseStyle.backgroundColor = theme.colors.warning[500];
        if (disabled) {
          baseStyle.backgroundColor = theme.colors.gray[300];
          baseStyle.shadowOpacity = 0;
          baseStyle.elevation = 0;
        }
        break;
      case 'error':
        baseStyle.backgroundColor = theme.colors.error[600];
        if (disabled) {
          baseStyle.backgroundColor = theme.colors.gray[300];
          baseStyle.shadowOpacity = 0;
          baseStyle.elevation = 0;
        }
        break;
      case 'outline':
        baseStyle.backgroundColor = 'transparent';
        baseStyle.borderWidth = 1.5;
        baseStyle.borderColor = theme.colors.primary[600];
        baseStyle.shadowOpacity = 0;
        baseStyle.elevation = 0;
        if (disabled) {
          baseStyle.borderColor = theme.colors.gray[300];
        }
        break;
      case 'ghost':
        baseStyle.backgroundColor = 'transparent';
        baseStyle.shadowOpacity = 0;
        baseStyle.elevation = 0;
        if (disabled) {
          baseStyle.backgroundColor = theme.colors.gray[100];
        }
        break;
    }

    if (fullWidth) {
      baseStyle.width = '100%';
      baseStyle.minWidth = undefined;
    }

    return baseStyle;
  };

  const getTextStyles = (): TextStyle => {
    const baseStyle: TextStyle = {
      fontWeight: '600',
      letterSpacing: theme.typography.letterSpacing.wide,
      textAlign: 'center',
    };

    // Size styles
    switch (size) {
      case 'sm':
        baseStyle.fontSize = theme.typography.sizes.sm;
        break;
      case 'lg':
        baseStyle.fontSize = theme.typography.sizes.lg;
        break;
      default: // md
        baseStyle.fontSize = theme.typography.sizes.base;
        break;
    }

    // Variant styles
    switch (variant) {
      case 'primary':
      case 'secondary':
      case 'success':
      case 'warning':
      case 'error':
        baseStyle.color = theme.colors.text.inverse;
        if (disabled) {
          baseStyle.color = theme.colors.text.tertiary;
        }
        break;
      case 'outline':
        baseStyle.color = theme.colors.primary[600];
        if (disabled) {
          baseStyle.color = theme.colors.text.tertiary;
        }
        break;
      case 'ghost':
        baseStyle.color = theme.colors.primary[600];
        if (disabled) {
          baseStyle.color = theme.colors.text.tertiary;
        }
        break;
    }

    return baseStyle;
  };

  return (
    <TouchableOpacity
      style={[getButtonStyles(), style]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={disabled ? 1 : 0.8}
    >
      <Text style={[getTextStyles(), textStyle]}>{title}</Text>
    </TouchableOpacity>
  );
}; 