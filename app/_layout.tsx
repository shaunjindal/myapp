import React, { useEffect } from 'react';
import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useInitStore } from '../src/store/initStore';
import { theme } from '../src/styles/theme';

export default function RootLayout() {
  const { initialize } = useInitStore();
  const router = useRouter();

  useEffect(() => {
    initialize();
  }, [initialize]);

  const handleBackPress = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.push('/(tabs)/home/');
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
    <>
      <StatusBar style="auto" />
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen 
          name="login" 
          options={{ 
            title: 'Login',
            headerLeft: () => <BackButton />,
            headerBackVisible: false
          }} 
        />
        <Stack.Screen 
          name="register" 
          options={{ 
            title: 'Register',
            headerLeft: () => <BackButton />,
            headerBackVisible: false
          }} 
        />
      </Stack>
    </>
  );
} 