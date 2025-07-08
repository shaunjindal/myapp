import React from 'react';
import { Stack, useRouter, useSegments, usePathname } from 'expo-router';
import { TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../../src/styles/theme';

export default function ProductsLayout() {
  const router = useRouter();
  const segments = useSegments();
  const pathname = usePathname();

  const handleBackPress = () => {
    const currentSegment = segments[segments.length - 1];
    
    // If we're on product details page, use router.back() to go back properly
    if (currentSegment && currentSegment !== 'index') {
      // Check if we can go back in the stack
      if (router.canGoBack()) {
        router.back();
      } else {
        // If no back history, navigate to products index
        router.replace('/(tabs)/products');
      }
      return;
    }
    
    // For products index page, use standard back navigation
    if (router.canGoBack()) {
      router.back();
    } else {
      // If no back history, go to home
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
        name="[id]" 
        options={{ 
          title: 'Product Details',
          headerLeft: () => <BackButton />,
          headerBackVisible: false,
          // Add presentation mode to ensure proper stack behavior
          presentation: 'card',
        }} 
      />
    </Stack>
  );
} 