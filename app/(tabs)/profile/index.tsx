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
import { formatPrice } from '../../../src/utils/currencyUtils';

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
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary[600]} />
          <Text style={styles.loadingText}>Loading profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!isAuthenticated) {
    return (
      <SafeAreaView style={styles.container}>
        <BackButtonHeader title="Profile" />
        <View style={styles.centerContainer}>
          <View style={styles.emptyStateCard}>
            <View style={styles.emptyStateIcon}>
              <Ionicons name="person-circle-outline" size={80} color={theme.colors.gray[400]} />
            </View>
            <Text style={styles.emptyStateTitle}>Welcome!</Text>
            <Text style={styles.emptyStateText}>Please login to view your profile and access your orders</Text>
            <View style={styles.emptyStateAction}>
              <Button
                title="Login to Continue"
                onPress={() => router.push('/login')}
                size="lg"
                fullWidth
              />
            </View>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <BackButtonHeader title="Profile" />

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* User Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.profileHeader}>
            <View style={styles.avatarContainer}>
              <Image
                source={{ uri: user?.avatar || 'https://via.placeholder.com/80' }}
                style={styles.avatar}
              />
              <View style={styles.statusBadge}>
                <Ionicons name="checkmark-circle" size={16} color={theme.colors.success[600]} />
              </View>
            </View>
                         <View style={styles.userInfo}>
               <Text style={styles.userName}>{user?.name}</Text>
               <Text style={styles.userEmail}>{user?.email}</Text>
             </View>
          </View>
        </View>

        {/* Recent Orders Card */}
        <View style={styles.sectionCard}>
          <View style={styles.cardHeader}>
            <View style={styles.headerContent}>
              <View style={styles.cardIcon}>
                <Ionicons name="receipt-outline" size={20} color={theme.colors.primary[600]} />
              </View>
              <Text style={styles.cardTitle}>Recent Orders</Text>
            </View>
            {recentOrder && (
              <TouchableOpacity 
                style={styles.viewMoreButton}
                onPress={() => router.push('/(tabs)/profile/orders-list')}
              >
                <Text style={styles.viewMoreText}>View All</Text>
                <Ionicons name="chevron-forward" size={16} color={theme.colors.primary[600]} />
              </TouchableOpacity>
            )}
          </View>

          {recentOrderLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color={theme.colors.primary[600]} />
              <Text style={styles.loadingText}>Loading orders...</Text>
            </View>
          ) : recentOrder ? (
            <TouchableOpacity 
              style={styles.orderCard}
              onPress={() => router.push(`/(tabs)/profile/order-details?orderId=${recentOrder.id}`)}
              activeOpacity={0.7}
            >
              <View style={styles.orderHeader}>
                <View style={styles.orderInfo}>
                  <Text style={styles.orderId}>#{recentOrder.orderNumber || recentOrder.id}</Text>
                  <Text style={styles.orderDate}>
                    {new Date(recentOrder.createdAt).toLocaleDateString()}
                  </Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(recentOrder.status) + '20' }]}>
                  <Text style={[styles.statusText, { color: getStatusColor(recentOrder.status) }]}>
                    {recentOrder.status.toUpperCase()}
                  </Text>
                </View>
              </View>
              
              <View style={styles.orderContent}>
                <Text style={styles.orderTotal}>{formatPrice(recentOrder.totalAmount || 0)}</Text>
                <View style={styles.orderItems}>
                  {(recentOrder.items || []).slice(0, 2).map((item) => (
                    <View key={item.id} style={styles.orderItem}>
                      <Text style={styles.orderItemText}>
                        {item.productName || 'Unknown Product'} × {item.quantity || 0}
                      </Text>
                    </View>
                  ))}
                  {(recentOrder.items || []).length > 2 && (
                    <Text style={styles.moreItemsText}>
                      +{(recentOrder.items || []).length - 2} more items
                    </Text>
                  )}
                </View>
              </View>

              <View style={styles.orderFooter}>
                <ViewDetailsButton />
              </View>
            </TouchableOpacity>
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="bag-outline" size={48} color={theme.colors.gray[400]} />
              <Text style={styles.emptyStateTitle}>No Orders Yet</Text>
              <Text style={styles.emptyStateText}>
                {recentOrderError || "Start shopping to see your orders here"}
              </Text>
              <TouchableOpacity 
                style={styles.emptyStateButton}
                onPress={() => router.push('/(tabs)/products/')}
              >
                <Text style={styles.emptyStateButtonText}>Start Shopping</Text>
                <Ionicons name="arrow-forward" size={16} color={theme.colors.primary[600]} />
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Addresses Card */}
        <View style={styles.sectionCard}>
          <View style={styles.cardHeader}>
            <View style={styles.headerContent}>
              <View style={styles.cardIcon}>
                <Ionicons name="location-outline" size={20} color={theme.colors.primary[600]} />
              </View>
              <Text style={styles.cardTitle}>My Addresses</Text>
            </View>
            {addresses && addresses.length > 0 && (
              <TouchableOpacity 
                style={styles.viewMoreButton}
                onPress={() => router.push('/(tabs)/profile/addresses-list')}
              >
                <Text style={styles.viewMoreText}>Manage</Text>
                <Ionicons name="chevron-forward" size={16} color={theme.colors.primary[600]} />
              </TouchableOpacity>
            )}
          </View>
          
          {addressesLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color={theme.colors.primary[600]} />
              <Text style={styles.loadingText}>Loading addresses...</Text>
            </View>
          ) : addressesError ? (
            <View style={styles.errorContainer}>
              <Ionicons name="alert-circle-outline" size={24} color={theme.colors.error[500]} />
              <Text style={styles.errorText}>{addressesError}</Text>
            </View>
          ) : addresses && addresses.length > 0 ? (
            <>
              {addresses.slice(0, 1).map((address: any) => (
                <View key={address.id} style={styles.addressCard}>
                  <View style={styles.addressHeader}>
                    <View style={styles.addressTypeContainer}>
                      <Ionicons 
                        name={address.type === 'home' ? 'home' : address.type === 'work' ? 'business' : 'location'} 
                        size={16} 
                        color={theme.colors.primary[600]} 
                      />
                      <Text style={styles.addressType}>{address.type.charAt(0).toUpperCase() + address.type.slice(1)}</Text>
                    </View>
                    {address.isDefault && (
                      <View style={styles.defaultBadge}>
                        <Text style={styles.defaultBadgeText}>DEFAULT</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.addressText}>
                    {address.street}
                  </Text>
                  <Text style={styles.addressLocation}>
                    {address.city}, {address.state} {address.zipCode}
                  </Text>
                  <Text style={styles.addressCountry}>{address.country}</Text>
                </View>
              ))}
            </>
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="location-outline" size={48} color={theme.colors.gray[400]} />
              <Text style={styles.emptyStateTitle}>No Addresses</Text>
              <Text style={styles.emptyStateText}>
                {addressesMessage || "Add your first delivery address to start shopping"}
              </Text>
              <TouchableOpacity 
                style={styles.emptyStateButton}
                onPress={() => router.push('/(tabs)/profile/addresses-list')}
              >
                <Ionicons name="add" size={16} color={theme.colors.primary[600]} />
                <Text style={styles.emptyStateButtonText}>Add Address</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Logout Button */}
        <View style={styles.logoutContainer}>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={20} color={theme.colors.error[600]} />
            <Text style={styles.logoutButtonText}>Logout</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case 'delivered':
      return theme.colors.success[600];
    case 'processing':
    case 'pending':
      return theme.colors.warning[600];
    case 'shipped':
    case 'confirmed':
    case 'paid':
      return theme.colors.primary[600];
    case 'cancelled':
    case 'refunded':
      return theme.colors.error[600];
    default:
      return theme.colors.gray[600];
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.surface,
  },
  scrollView: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.xl,
  },
  loadingText: {
    fontSize: theme.typography.sizes.base,
    color: theme.colors.text.secondary,
    marginTop: theme.spacing.md,
    textAlign: 'center',
  },

  // Empty State Card
  emptyStateCard: {
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius['2xl'],
    padding: theme.spacing['2xl'],
    alignItems: 'center',
    width: '100%',
    ...theme.shadows.md,
  },
  emptyStateIcon: {
    marginBottom: theme.spacing.lg,
  },
  emptyStateTitle: {
    fontSize: theme.typography.sizes.xl,
    fontWeight: '700',
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.sm,
    textAlign: 'center',
  },
  emptyStateText: {
    fontSize: theme.typography.sizes.base,
    color: theme.colors.text.secondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: theme.spacing.xl,
  },
  emptyStateAction: {
    width: '100%',
  },

  // Profile Card
  profileCard: {
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius['2xl'],
    margin: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    padding: theme.spacing.xl,
    ...theme.shadows.md,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
    marginRight: theme.spacing.lg,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.gray[100],
  },
  statusBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.full,
    padding: 2,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: theme.typography.sizes['2xl'],
    fontWeight: '700',
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs,
  },
  userEmail: {
    fontSize: theme.typography.sizes.base,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.sm,
  },
  

  // Section Card
  sectionCard: {
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius['2xl'],
    margin: theme.spacing.lg,
    marginTop: theme.spacing.md,
    padding: theme.spacing.lg,
    ...theme.shadows.md,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  cardIcon: {
    width: 36,
    height: 36,
    borderRadius: theme.borderRadius.lg,
    backgroundColor: theme.colors.primary[50],
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.md,
  },
  cardTitle: {
    fontSize: theme.typography.sizes.lg,
    fontWeight: '700',
    color: theme.colors.text.primary,
    flex: 1,
  },
  viewMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
  },
  viewMoreText: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.primary[600],
    marginRight: theme.spacing.xs,
    fontWeight: '600',
  },

  // Loading and Error States
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.xl,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.xl,
  },
  errorText: {
    fontSize: theme.typography.sizes.base,
    color: theme.colors.error[600],
    marginLeft: theme.spacing.sm,
  },

  // Order Card
  orderCard: {
    backgroundColor: theme.colors.gray[50],
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.gray[200],
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.md,
  },
  orderInfo: {
    flex: 1,
  },
  orderId: {
    fontSize: theme.typography.sizes.lg,
    fontWeight: '700',
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs,
  },
  orderDate: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.text.secondary,
  },
  statusText: {
    fontSize: theme.typography.sizes.xs,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  orderContent: {
    marginBottom: theme.spacing.lg,
  },
  orderTotal: {
    fontSize: theme.typography.sizes.xl,
    fontWeight: '700',
    color: theme.colors.success[600],
    marginBottom: theme.spacing.sm,
  },
  orderItems: {
    gap: theme.spacing.xs,
  },
  orderItem: {
    backgroundColor: theme.colors.background,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.sm,
  },
  orderItemText: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.text.primary,
  },
  moreItemsText: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.text.secondary,
    fontStyle: 'italic',
  },
  orderFooter: {
    alignItems: 'flex-end',
  },

  // Empty State
  emptyState: {
    alignItems: 'center',
    paddingVertical: theme.spacing['2xl'],
  },
  emptyStateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.primary[50],
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    marginTop: theme.spacing.md,
  },
  emptyStateButtonText: {
    fontSize: theme.typography.sizes.base,
    color: theme.colors.primary[600],
    fontWeight: '600',
    marginLeft: theme.spacing.xs,
  },

  // Address Card
  addressCard: {
    backgroundColor: theme.colors.gray[50],
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.gray[200],
  },
  addressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  addressTypeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  addressType: {
    fontSize: theme.typography.sizes.base,
    fontWeight: '600',
    color: theme.colors.text.primary,
    marginLeft: theme.spacing.sm,
  },
  defaultBadge: {
    backgroundColor: theme.colors.success[100],
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.sm,
  },
  defaultBadgeText: {
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.success[700],
    fontWeight: '700',
  },
  addressText: {
    fontSize: theme.typography.sizes.base,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs,
    lineHeight: 22,
  },
  addressLocation: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.xs,
  },
  addressCountry: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.text.secondary,
  },

  // Logout Button
  logoutContainer: {
    margin: theme.spacing.lg,
    marginTop: theme.spacing.md,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.error[50],
    paddingVertical: theme.spacing.lg,
    paddingHorizontal: theme.spacing.xl,
    borderRadius: theme.borderRadius.xl,
    borderWidth: 1,
    borderColor: theme.colors.error[200],
  },
  logoutButtonText: {
    fontSize: theme.typography.sizes.base,
    color: theme.colors.error[600],
    fontWeight: '600',
    marginLeft: theme.spacing.sm,
  },
}); 