import React, { useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../../../src/store/authStore';
import { useOrderStore } from '../../../src/store/orderStore';
import orderService from '../../../src/services/orderService';
import { theme } from '../../../src/styles/theme';
import { Ionicons } from '@expo/vector-icons';
import { formatPrice } from '../../../src/utils/currencyUtils';

export default function OrdersListScreen() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  
  // Use simple order store
  const { 
    orders, 
    ordersLoading, 
    ordersError, 
    hasMoreOrders, 
    currentPage, 
    fetchOrders 
  } = useOrderStore();

  // Fetch orders when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchOrders();
    }
  }, [isAuthenticated]);

  const handleRefresh = () => {
    fetchOrders(0, true); // Force refresh
  };

  const handleLoadMore = () => {
    if (hasMoreOrders && !ordersLoading) {
      fetchOrders(currentPage + 1);
    }
  };

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

  if (!isAuthenticated) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.notAuthenticatedContainer}>
          <Ionicons name="lock-closed-outline" size={64} color="#6b7280" />
          <Text style={styles.notAuthenticatedText}>Please login to view your orders</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (ordersLoading && orders.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary[600]} />
          <Text style={styles.loadingText}>Loading orders...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (ordersError && orders.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={64} color="#ef4444" />
          <Text style={styles.errorText}>{ordersError}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => fetchOrders(0, true)}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={ordersLoading && currentPage === 0} onRefresh={handleRefresh} />
        }
        onScroll={({ nativeEvent }) => {
          const { layoutMeasurement, contentOffset, contentSize } = nativeEvent;
          const paddingToBottom = 20;
          if (layoutMeasurement.height + contentOffset.y >= contentSize.height - paddingToBottom) {
            handleLoadMore();
          }
        }}
        scrollEventThrottle={400}
      >
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>All Orders</Text>
          {orders.length > 0 ? (
            orders.map((order) => (
              <TouchableOpacity 
                key={order.id} 
                style={styles.orderCard}
                onPress={() => router.push(`/(tabs)/profile/order-details?orderId=${order.id}`)}
              >
                <View style={styles.orderHeader}>
                  <Text style={styles.orderId}>Order #{order.orderNumber}</Text>
                  <Text style={[styles.orderStatus, { color: getStatusColor(order.status) }]}>
                    {orderService.formatOrderStatus(order.status)}
                  </Text>
                </View>
                <Text style={styles.orderDate}>
                  {new Date(order.createdAt).toLocaleDateString()}
                </Text>
                <Text style={styles.orderTotal}>{formatPrice(order.totalAmount || 0)}</Text>
                <View style={styles.orderItems}>
                  {(order.items || []).slice(0, 2).map((item) => (
                    <Text key={item.id} style={styles.orderItem}>
                      {item.productName || 'Unknown Product'} x{item.quantity || 0}
                    </Text>
                  ))}
                  {(order.items || []).length > 2 && (
                    <Text style={styles.orderItem}>
                      +{(order.items || []).length - 2} more items
                    </Text>
                  )}
                </View>
                <View style={styles.viewDetailsContainer}>
                  <Text style={styles.viewDetailsText}>Tap to view details</Text>
                  <Ionicons name="chevron-forward" size={16} color="#2563eb" />
                </View>
              </TouchableOpacity>
            ))
          ) : (
            <View style={styles.emptyStateContainer}>
              <Ionicons name="receipt-outline" size={64} color="#6b7280" />
              <Text style={styles.emptyStateText}>No orders found</Text>
              <Text style={styles.emptyStateSubText}>
                Start shopping to see your orders here
              </Text>
              <TouchableOpacity 
                style={styles.startShoppingButton}
                onPress={() => router.push('/(tabs)/products/')}
              >
                <Text style={styles.startShoppingText}>Start Shopping</Text>
              </TouchableOpacity>
            </View>
          )}
          
          {ordersLoading && orders.length > 0 && (
            <View style={styles.loadingMoreContainer}>
              <ActivityIndicator size="small" color={theme.colors.primary[600]} />
              <Text style={styles.loadingMoreText}>Loading more orders...</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  scrollView: {
    flex: 1,
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
    marginBottom: 16,
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
  viewDetailsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  viewDetailsText: {
    fontSize: 14,
    color: '#2563eb',
    marginRight: 4,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    fontSize: 16,
    color: '#6b7280',
    marginTop: 12,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#ef4444',
    marginTop: 12,
    marginBottom: 20,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: theme.colors.primary[600],
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  notAuthenticatedContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  notAuthenticatedText: {
    fontSize: 16,
    color: '#6b7280',
    marginTop: 12,
    textAlign: 'center',
  },
  emptyStateContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateSubText: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 24,
  },
  startShoppingButton: {
    backgroundColor: '#2563eb',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  startShoppingText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingMoreContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
  },
  loadingMoreText: {
    fontSize: 14,
    color: '#6b7280',
    marginLeft: 8,
  },
}); 