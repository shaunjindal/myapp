import React from 'react';
import { Tabs, useRouter, useSegments } from 'expo-router';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useCartStore } from '../../src/store/cartStore';

// Custom Cart Icon with Badge
const CartIcon = ({ color, size }: { color: string; size: number }) => {
  const { items } = useCartStore();
  const itemCount = items.reduce((total, item) => total + item.quantity, 0);
  
  return (
    <View style={styles.cartIconContainer}>
      <Ionicons name="cart" size={size} color={color} />
      {itemCount > 0 && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>
            {itemCount > 99 ? '99+' : itemCount.toString()}
          </Text>
        </View>
      )}
    </View>
  );
};

export default function TabLayout() {
  const router = useRouter();
  const segments = useSegments();

  const handleTabPress = (tabName: string) => {
    return (e: any) => {
      e.preventDefault();
      
      // Get current route segments
      const currentSegments = segments;
      
      // Check if we're already on the main screen of the clicked tab
      const isOnMainScreen = currentSegments.length === 2 && 
                            currentSegments[0] === '(tabs)' && 
                            currentSegments[1] === tabName;
      
      // Only navigate if we're not already on the main screen
      if (!isOnMainScreen) {
        if (tabName === 'profile') {
          router.push('/(tabs)/profile/');
        } else if (tabName === 'home') {
          router.push('/(tabs)/home/');
        } else if (tabName === 'products') {
          router.push('/(tabs)/products/');
        } else if (tabName === 'cart') {
          router.push('/(tabs)/cart/');
        }
      }
    };
  };

  // Check if we're on pages where tabs should be hidden
  const shouldHideTabs = () => {
    const currentSegments = segments;
    
    // Hide tabs on checkout flow pages
    if (currentSegments.length >= 3 && currentSegments[0] === '(tabs)' && currentSegments[1] === 'cart') {
      const cartPage = currentSegments[2];
      return cartPage === 'checkout' || cartPage === 'payment-processing' || cartPage === 'order-success';
    }
    
    return false;
  };

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#2563eb',
        tabBarInactiveTintColor: '#6b7280',
        headerShown: false,
        tabBarStyle: shouldHideTabs() ? { display: 'none' } : undefined,
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" size={size} color={color} />
          ),
        }}
        listeners={{
          tabPress: handleTabPress('home'),
        }}
      />
      <Tabs.Screen
        name="products"
        options={{
          title: 'Products',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="grid" size={size} color={color} />
          ),
        }}
        listeners={{
          tabPress: handleTabPress('products'),
        }}
      />
      <Tabs.Screen
        name="cart"
        options={{
          title: 'Cart',
          tabBarIcon: ({ color, size }) => (
            <CartIcon color={color} size={size} />
          ),
        }}
        listeners={{
          tabPress: handleTabPress('cart'),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person" size={size} color={color} />
          ),
        }}
        listeners={{
          tabPress: handleTabPress('profile'),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  cartIconContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    width: 28,
    height: 28,
  },
  badge: {
    position: 'absolute',
    top: -6,
    right: -8,
    backgroundColor: '#ef4444',
    borderRadius: 9,
    minWidth: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
    borderWidth: 1.5,
    borderColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
  badgeText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '700',
    textAlign: 'center',
    lineHeight: 12,
  },
});