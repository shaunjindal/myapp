import React, { useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../../../src/store/authStore';
import { useAddressStore } from '../../../src/store/addressStore';
import { useOrderStore } from '../../../src/store/orderStore';
import { Button } from '../../../src/components/Button';
import { BackButtonHeader } from '../../../src/components/BackButtonHeader';
import { ViewDetailsButton } from '../../../src/components/ViewDetailsButton';
import { theme } from '../../../src/styles/theme';
import { Ionicons } from '@expo/vector-icons';

export default function ProfileScreen() {
  const router = useRouter();
  const { isAuthenticated, isInitializing, user, logout } = useAuthStore();
  
  // Use simple order store
  const { 
    recentOrder, 
    recentOrderLoading, 
    recentOrderError, 
    fetchRecentOrder 
  } = useOrderStore();
  
  // Fetch addresses using address store
  const { 
    addresses, 
    loading: addressesLoading, 
    error: addressesError, 
    message: addressesMessage,
    fetchAddresses
  } = useAddressStore();

  // Fetch data when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchAddresses();
      fetchRecentOrder();
    }
  }, [isAuthenticated]);

  const handleLogout = () => {
    logout();
  };

  // Show loading state while auth is being initialized
  if (isInitializing) {
    return (
      <SafeAreaView style={styles.container}>
        <BackButtonHeader title="Profile" />
        <View style={styles.initializingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary[600]} />
          <Text style={styles.initializingText}>Loading profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!isAuthenticated) {
    return (
      <SafeAreaView style={styles.container}>
        <BackButtonHeader title="Profile" />
        <View style={styles.notLoggedInContainer}>
          <Ionicons name="person-circle" size={80} color="#6b7280" />
          <Text style={styles.notLoggedInText}>Please login to view your profile</Text>
          <Button
            title="Login"
            onPress={() => router.push('/login')}
            size="lg"
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <BackButtonHeader title="Profile" />

      <ScrollView style={styles.scrollView}>
        {/* User Info */}
        <View style={styles.userContainer}>
          <Image
            source={{ uri: user?.avatar || 'https://via.placeholder.com/80' }}
            style={styles.avatar}
          />
          <Text style={styles.userName}>{user?.name}</Text>
          <Text style={styles.userEmail}>{user?.email}</Text>
        </View>

        {/* Order History */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Orders</Text>
            {recentOrder && (
              <TouchableOpacity 
                style={styles.viewMoreButton}
                onPress={() => router.push('/(tabs)/profile/orders-list')}
              >
                <Text style={styles.viewMoreText}>View More</Text>
                <Ionicons name="chevron-forward" size={16} color="#2563eb" />
              </TouchableOpacity>
            )}
          </View>
          {recentOrderLoading ? (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>Loading orders...</Text>
            </View>
          ) : recentOrder ? (
            <TouchableOpacity 
              style={styles.orderCard}
              onPress={() => router.push(`/(tabs)/profile/order-details?orderId=${recentOrder.id}`)}
            >
              <View style={styles.orderHeader}>
                <Text style={styles.orderId}>Order #{recentOrder.orderNumber || recentOrder.id}</Text>
                <Text style={[styles.orderStatus, { color: getStatusColor(recentOrder.status) }]}>
                  {recentOrder.status.toUpperCase()}
                </Text>
              </View>
              <Text style={styles.orderDate}>
                {new Date(recentOrder.createdAt).toLocaleDateString()}
              </Text>
              <Text style={styles.orderTotal}>${(recentOrder.totalAmount || 0).toFixed(2)}</Text>
              <View style={styles.orderItems}>
                {(recentOrder.items || []).slice(0, 2).map((item) => (
                  <Text key={item.id} style={styles.orderItem}>
                    {item.productName || 'Unknown Product'} x{item.quantity || 0}
                  </Text>
                ))}
                {(recentOrder.items || []).length > 2 && (
                  <Text style={styles.orderItem}>
                    +{(recentOrder.items || []).length - 2} more items
                  </Text>
                )}
              </View>
              <ViewDetailsButton />
            </TouchableOpacity>
          ) : (
            <View style={styles.emptyStateContainer}>
              <Ionicons name="receipt-outline" size={48} color="#6b7280" />
              <Text style={styles.emptyStateText}>
                {recentOrderError || "No orders found"}
              </Text>
              <TouchableOpacity 
                style={styles.startShoppingButton}
                onPress={() => router.push('/(tabs)/products/')}
              >
                <Text style={styles.startShoppingText}>Start Shopping</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Addresses */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Addresses</Text>
            {addresses && addresses.length > 0 && (
              <TouchableOpacity 
                style={styles.viewMoreButton}
                onPress={() => router.push('/(tabs)/profile/addresses-list')}
              >
                <Text style={styles.viewMoreText}>Manage Addresses</Text>
                <Ionicons name="chevron-forward" size={16} color="#2563eb" />
              </TouchableOpacity>
            )}
          </View>
          
          {addressesLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={theme.colors.primary[600]} />
              <Text style={styles.loadingText}>Loading addresses...</Text>
            </View>
          ) : addressesError ? (
            <View style={styles.errorContainer}>
              <Ionicons name="alert-circle-outline" size={24} color="#ef4444" />
              <Text style={styles.errorText}>{addressesError}</Text>
            </View>
          ) : addresses && addresses.length > 0 ? (
            <>
              {addresses.slice(0, 1).map((address: any) => (
                <View key={address.id} style={styles.addressCard}>
                  <View style={styles.addressHeader}>
                    <Text style={styles.addressType}>{address.type.toUpperCase()}</Text>
                    {address.isDefault && (
                      <Text style={styles.defaultBadge}>DEFAULT</Text>
                    )}
                  </View>
                  <Text style={styles.addressText}>
                    {address.street}, {address.city}, {address.state} {address.zipCode}
                  </Text>
                  <Text style={styles.addressCountry}>{address.country}</Text>
                </View>
              ))}
            </>
          ) : (
            <View style={styles.emptyAddressContainer}>
              <Ionicons name="location-outline" size={48} color="#6b7280" />
              <Text style={styles.emptyAddressText}>
                {addressesMessage || "No addresses added yet"}
              </Text>
              <Text style={styles.emptyAddressSubtext}>
                Add your first delivery address to start shopping
              </Text>
              <TouchableOpacity 
                style={styles.addAddressButton}
                onPress={() => router.push('/(tabs)/profile/addresses-list')}
              >
                <Ionicons name="add" size={20} color="#ffffff" />
                <Text style={styles.addAddressText}>Add Address</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Account Actions */}
        <View style={styles.section}>
          <TouchableOpacity style={styles.actionButton} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={24} color="#ef4444" />
            <Text style={styles.actionButtonText}>Logout</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case 'delivered':
      return '#10b981';
    case 'processing':
    case 'pending':
      return '#f59e0b';
    case 'shipped':
    case 'confirmed':
    case 'paid':
      return '#3b82f6';
    case 'cancelled':
    case 'refunded':
      return '#ef4444';
    default:
      return '#6b7280';
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  scrollView: {
    flex: 1,
  },
  notLoggedInContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  notLoggedInText: {
    fontSize: 18,
    color: '#6b7280',
    marginTop: 16,
    marginBottom: 24,
    textAlign: 'center',
  },
  userContainer: {
    backgroundColor: '#ffffff',
    alignItems: 'center',
    padding: 20,
    marginBottom: 20,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 16,
  },
  userName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#374151',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 16,
    color: '#6b7280',
  },
  section: {
    backgroundColor: '#ffffff',
    padding: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#374151',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  viewMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewMoreText: {
    fontSize: 16,
    color: '#2563eb',
    marginRight: 4,
    fontWeight: '600',
  },
  orderCard: {
    backgroundColor: '#f9fafb',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  orderId: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  orderStatus: {
    fontSize: 14,
    fontWeight: '600',
  },
  orderDate: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
  },
  orderTotal: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2563eb',
    marginBottom: 8,
  },
  orderItems: {
    marginTop: 8,
  },
  orderItem: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 2,
  },
  addressCard: {
    backgroundColor: '#f9fafb',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
  },
  addressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  addressType: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  defaultBadge: {
    fontSize: 12,
    fontWeight: '600',
    color: '#10b981',
  },
  addressText: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 4,
  },
  addressCountry: {
    fontSize: 14,
    color: '#6b7280',
  },
  signOutContainer: {
    backgroundColor: '#ffffff',
    padding: 20,
    marginTop: 20,
    marginBottom: 20,
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fef2f2',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  signOutText: {
    fontSize: 16,
    color: '#ef4444',
    fontWeight: '600',
    marginLeft: 8,
  },
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 8,
  },
  emptyStateContainer: {
    padding: 32,
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    marginTop: 12,
    marginBottom: 16,
    lineHeight: 24,
  },
  startShoppingButton: {
    backgroundColor: '#2563eb',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 6,
  },
  startShoppingText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyAddressContainer: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyAddressText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyAddressSubtext: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  addAddressButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.primary[600],
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    shadowColor: theme.colors.primary[600],
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 3.84,
    elevation: 5,
  },
  addAddressText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fef2f2',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  errorText: {
    fontSize: 14,
    color: '#ef4444',
    marginLeft: 8,
    flex: 1,
  },
  initializingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  initializingText: {
    fontSize: 18,
    color: '#6b7280',
    marginTop: 16,
    marginBottom: 24,
    textAlign: 'center',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fef2f2',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  actionButtonText: {
    fontSize: 16,
    color: '#ef4444',
    fontWeight: '600',
    marginLeft: 8,
  },
}); 