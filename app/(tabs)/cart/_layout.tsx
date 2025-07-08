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
    
    // If we're on checkout page, always go back to cart
    if (currentSegment === 'checkout') {
      router.push('/(tabs)/cart');
      return;
    }
    
    // For other pages, use standard back navigation
    if (router.canGoBack()) {
      router.back();
    } else {
      router.push('/(tabs)/cart');
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