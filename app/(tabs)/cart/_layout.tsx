import React from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../../src/styles/theme';

export default function CartLayout() {
  const router = useRouter();
  const segments = useSegments();

  const handleBackPress = () => {
    const currentSegment = segments[segments.length - 1];
    
    // If we're on order-success page, go to profile
    if (currentSegment === 'order-success') {
      router.replace('/(tabs)/profile');
      return;
    }
    
    // If we're on checkout page, go back to cart (replace to avoid navigation loop)
    if (currentSegment === 'checkout') {
      router.replace('/(tabs)/cart');
      return;
    }
    
    // If we're on payment processing online page, go back to checkout
    if (currentSegment === 'payment-processing-online') {
      // Note: Payment processing screen handles its own back button logic
      // through hardware back button handler to prevent navigation during processing
      router.back();
      return;
    }
    
    // For other pages, use standard back navigation
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(tabs)/home');
    }
  };

  const BackButton = () => (
    <TouchableOpacity 
      onPress={handleBackPress}
      style={{ padding: 8 }}
    >
      <Ionicons 
        name="arrow-back" 
        size={24} 
        color={theme.colors.text.primary} 
      />
    </TouchableOpacity>
  );

  return (
    <Stack>
      <Stack.Screen 
        name="index" 
        options={{ 
          headerShown: false 
        }} 
      />
      <Stack.Screen 
        name="checkout" 
        options={{ 
          title: 'Checkout',
          headerLeft: () => <BackButton />,
          headerBackVisible: false
        }} 
      />
      <Stack.Screen 
        name="payment-processing" 
        options={{ 
          title: 'Processing Payment',
          headerLeft: () => null,
          headerBackVisible: false,
          gestureEnabled: false,
        }} 
      />
      <Stack.Screen 
        name="payment-processing-online" 
        options={{ 
          title: 'Payment Processing',
          headerLeft: () => <BackButton />,
          headerBackVisible: false,
          gestureEnabled: true,
        }} 
      />
      <Stack.Screen 
        name="order-success" 
        options={{ 
          title: 'Order Complete',
          headerLeft: () => <BackButton />,
          headerBackVisible: false
        }} 
      />
    </Stack>
  );
} 