import React from 'react';
import { Stack, useRouter } from 'expo-router';
import { TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../../src/styles/theme';

export default function ProfileLayout() {
  const router = useRouter();

  const handleBackPress = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.push('/(tabs)/profile');
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
        name="order-details" 
        options={{ 
          title: 'Order Details',
          headerLeft: () => <BackButton />,
          headerBackVisible: false
        }} 
      />
      <Stack.Screen 
        name="orders-list" 
        options={{ 
          title: 'All Orders',
          headerLeft: () => <BackButton />,
          headerBackVisible: false
        }} 
      />
      <Stack.Screen 
        name="addresses-list" 
        options={{ 
          title: 'All Addresses',
          headerLeft: () => <BackButton />,
          headerBackVisible: false
        }} 
      />
    </Stack>
  );
} 