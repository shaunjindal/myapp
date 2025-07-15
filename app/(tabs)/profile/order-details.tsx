import React, { useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  Image,
  ActivityIndicator,
  TouchableOpacity,
  Dimensions,
  Alert,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useOrderStore } from '../../../src/store/orderStore';
import { OrderDetailsOrderSummary } from '../../../src/components/OrderDetailsOrderSummary';
import { theme } from '../../../src/styles/theme';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

export default function OrderDetailsScreen() {
  const { orderId } = useLocalSearchParams<{ orderId: string }>();
  
  const { 
    orderDetails, 
    orderDetailsLoading, 
    orderDetailsError, 
    fetchOrderDetails 
  } = useOrderStore();

  const order = orderId ? orderDetails[orderId] : null;
  const loading = orderId ? orderDetailsLoading[orderId] : false;
  const error = orderId ? orderDetailsError[orderId] : null;

  useEffect(() => {
    if (orderId) {
      fetchOrderDetails(orderId);
    }
  }, [orderId]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ORDER_RAISED':
        return theme.colors.warning[600];
      case 'PAYMENT_DONE':
        return theme.colors.primary[600];
      case 'DELIVERED':
        return theme.colors.success[600];
      case 'CANCELLED':
        return theme.colors.error[600];
      default:
        return theme.colors.gray[600];
    }
  };

  const formatStatusName = (status: string) => {
    switch (status) {
      case 'ORDER_RAISED':
        return 'Order Raised';
      case 'PAYMENT_DONE':
        return 'Payment Done';
      case 'DELIVERED':
        return 'Delivered';
      case 'CANCELLED':
        return 'Cancelled';
      default:
        return status;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Order status configuration for the 3-step simplified flow
  const statusSteps = [
    { 
      key: 'ORDER_RAISED', 
      label: 'Order Raised', 
      icon: 'receipt-outline' as keyof typeof Ionicons.glyphMap,
      description: 'Order has been created and is awaiting payment'
    },
    { 
      key: 'PAYMENT_DONE', 
      label: 'Payment Done', 
      icon: 'card-outline' as keyof typeof Ionicons.glyphMap,
      description: 'Payment has been processed successfully'
    },
    { 
      key: 'DELIVERED', 
      label: 'Delivered', 
      icon: 'checkmark-circle-outline' as keyof typeof Ionicons.glyphMap,
      description: 'Order has been delivered successfully'
    }
  ];

  const getStepStatus = (stepKey: string, orderStatus: string) => {
    const statusOrder = ['ORDER_RAISED', 'PAYMENT_DONE', 'DELIVERED'];
    const currentIndex = statusOrder.indexOf(orderStatus);
    const stepIndex = statusOrder.indexOf(stepKey);
    
    if (orderStatus === 'CANCELLED') {
      return stepIndex === 0 ? 'completed' : 'cancelled';
    }
    
    if (stepIndex <= currentIndex) {
      return 'completed';
    } else {
      return 'pending';
    }
  };

  const renderOrderStatusTracker = () => {
    const isCancelled = order?.status === 'CANCELLED';

    if (isCancelled) {
      return (
        <View style={styles.progressContainer}>
          <Text style={styles.sectionTitle}>Order Status</Text>
          <View style={styles.cancelledContainer}>
            <View style={styles.cancelledIconContainer}>
              <Ionicons name="close-circle" size={32} color={theme.colors.error[600]} />
            </View>
            <View style={styles.cancelledTextContainer}>
              <Text style={styles.cancelledTitle}>Order Cancelled</Text>
              {order.cancellationReason && (
                <Text style={styles.cancelledReason}>
                  {order.cancellationReason}
                </Text>
              )}
            </View>
          </View>
        </View>
      );
    }

    return (
      <View style={styles.progressContainer}>
        <Text style={styles.sectionTitle}>Order Progress</Text>
        <View style={styles.progressTracker}>
          {statusSteps.map((step, index) => {
            const stepStatus = getStepStatus(step.key, order?.status || 'ORDER_RAISED');
            const isCompleted = stepStatus === 'completed';
            const isActive = order?.status === step.key;
            const isPending = stepStatus === 'pending';

            return (
              <View key={step.key} style={styles.progressStep}>
                <View style={styles.stepIndicatorContainer}>
                  <View style={[
                    styles.stepIndicator,
                    isCompleted && styles.stepIndicatorCompleted,
                    isActive && styles.stepIndicatorActive,
                    isPending && styles.stepIndicatorPending
                  ]}>
                    {isCompleted ? (
                      <Ionicons name="checkmark" size={20} color="white" />
                    ) : (
                      <Ionicons 
                        name={step.icon} 
                        size={18} 
                        color={isActive ? "white" : theme.colors.gray[500]} 
                      />
                    )}
                  </View>
                  {index < statusSteps.length - 1 && (
                    <View style={[
                      styles.progressLine,
                      isCompleted && styles.progressLineCompleted
                    ]} />
                  )}
                </View>
                
                <View style={styles.stepContent}>
                  <Text style={[
                    styles.stepTitle,
                    (isCompleted || isActive) && styles.stepTitleActive
                  ]}>
                    {step.label}
                  </Text>
                  <Text style={[
                    styles.stepDescription,
                    (isCompleted || isActive) && styles.stepDescriptionActive
                  ]}>
                    {step.description}
                  </Text>
                  {isActive && order?.statusHistory && (
                    <Text style={styles.stepTimestamp}>
                      {formatDate(order.statusHistory[order.statusHistory.length - 1]?.timestamp)}
                    </Text>
                  )}
                </View>
              </View>
            );
          })}
        </View>
      </View>
    );
  };

  const renderOrderHeader = () => (
    <View style={styles.headerContainer}>
      <View style={styles.headerContent}>
        <View style={styles.orderInfoSection}>
          <View style={styles.orderNumberBadge}>
            <Ionicons name="receipt" size={20} color={theme.colors.primary[600]} />
            <Text style={styles.orderNumberLabel}>Order ID</Text>
          </View>
          <Text style={styles.orderNumber}>{order?.orderNumber}</Text>
          <Text style={styles.orderDate}>
            Placed on {formatDate(order?.orderDate || '')}
          </Text>
        </View>
        
        <View style={styles.statusSection}>
          <View style={[styles.statusIndicator, { backgroundColor: getStatusColor(order?.status!) }]}>
            <View style={styles.statusDot} />
          </View>
          <Text style={[styles.currentStatus, { color: getStatusColor(order?.status!) }]}>
            {formatStatusName(order?.status!)}
          </Text>
        </View>
      </View>
    </View>
  );

  const renderOrderSummary = () => (
    <OrderDetailsOrderSummary
      items={order?.items || []}
      subtotal={order?.subtotal || 0}
      paymentComponents={order?.paymentComponents || []}
      totalAmount={order?.totalAmount || 0}
      currency={order?.currency || "INR"}
      style={styles.orderSummaryCard}
    />
  );

  const renderShippingInfo = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Shipping Information</Text>
      <View style={styles.infoContainer}>
        <View style={styles.addressContainer}>
          <View style={styles.addressHeader}>
            <Ionicons name="location-outline" size={20} color={theme.colors.primary[600]} />
            <Text style={styles.addressTitle}>Delivery Address</Text>
          </View>
          <Text style={styles.addressName}>
            {order?.shippingAddress?.firstName} {order?.shippingAddress?.lastName}
          </Text>
          <Text style={styles.addressText}>{order?.shippingAddress?.street}</Text>
          {order?.shippingAddress?.street2 && (
            <Text style={styles.addressText}>{order?.shippingAddress?.street2}</Text>
          )}
          <Text style={styles.addressText}>
            {order?.shippingAddress?.city}, {order?.shippingAddress?.state} {order?.shippingAddress?.postalCode}
          </Text>
          <Text style={styles.addressText}>{order?.shippingAddress?.country}</Text>
          {order?.shippingAddress?.phone && (
            <Text style={styles.addressPhone}>Phone: {order?.shippingAddress?.phone}</Text>
          )}
        </View>

        {order?.trackingNumber && (
          <View style={styles.trackingContainer}>
            <View style={styles.trackingHeader}>
              <Ionicons name="car-outline" size={20} color={theme.colors.primary[600]} />
              <Text style={styles.trackingTitle}>Tracking Information</Text>
            </View>
            <Text style={styles.trackingNumber}>
              Tracking Number: {order.trackingNumber}
            </Text>
            {order.shippingCarrier && (
              <Text style={styles.trackingCarrier}>
                Carrier: {order.shippingCarrier}
              </Text>
            )}
            <TouchableOpacity style={styles.trackButton}>
              <Text style={styles.trackButtonText}>Track Package</Text>
              <Ionicons name="open-outline" size={16} color={theme.colors.primary[600]} />
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );

  const renderPaymentInfo = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Payment Information</Text>
      <View style={styles.paymentContainer}>
        <View style={styles.paymentHeader}>
          <Ionicons name="card-outline" size={20} color={theme.colors.primary[600]} />
          <Text style={styles.paymentTitle}>Payment Method</Text>
        </View>
        <Text style={styles.paymentMethod}>
          {order?.paymentMethod?.replace('_', ' ').toLowerCase()
            .replace(/\b\w/g, l => l.toUpperCase())}
        </Text>
        {order?.paymentTransactionId && (
          <Text style={styles.transactionId}>
            Transaction ID: {order.paymentTransactionId}
          </Text>
        )}
      </View>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary[600]} />
          <Text style={styles.loadingText}>Loading order details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !order) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={64} color={theme.colors.error[600]} />
          <Text style={styles.errorText}>{error || 'Order not found'}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {renderOrderHeader()}
        {renderOrderStatusTracker()}
        {renderOrderSummary()}
        {renderShippingInfo()}
        {renderPaymentInfo()}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.surface,
  },
  scrollView: {
    flex: 1,
    padding: theme.spacing.lg,
  },
  orderSummaryCard: {
    marginBottom: theme.spacing.lg,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: theme.typography.sizes.base,
    color: theme.colors.text.secondary,
    marginTop: theme.spacing.md,
    textAlign: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: theme.typography.sizes.base,
    color: theme.colors.error[600],
    marginTop: theme.spacing.md,
    textAlign: 'center',
  },
  section: {
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
    ...theme.shadows.sm,
  },
  sectionTitle: {
    fontSize: theme.typography.sizes.lg,
    fontWeight: '600',
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.lg,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
    ...theme.shadows.sm,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  orderInfoSection: {
    flexDirection: 'column',
  },
  orderNumberBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.xs,
  },
  orderNumberLabel: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.text.secondary,
    marginLeft: theme.spacing.sm,
  },
  orderNumber: {
    fontSize: theme.typography.sizes.base,
    fontWeight: '600',
    color: theme.colors.text.primary,
  },
  orderDate: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.text.secondary,
    marginTop: theme.spacing.xs,
  },
  statusSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusIndicator: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: theme.colors.gray[300],
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.sm,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.gray[300],
  },
  currentStatus: {
    fontSize: theme.typography.sizes.sm,
    fontWeight: '600',
    color: theme.colors.text.primary,
  },


  infoContainer: {
    gap: theme.spacing.lg,
  },
  addressContainer: {
    backgroundColor: theme.colors.gray[50],
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.gray[200],
  },
  addressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  addressTitle: {
    fontSize: theme.typography.sizes.base,
    fontWeight: '600',
    color: theme.colors.text.primary,
    marginLeft: theme.spacing.sm,
  },
  addressName: {
    fontSize: theme.typography.sizes.base,
    fontWeight: '600',
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs,
  },
  addressText: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.xs,
  },
  addressPhone: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.text.secondary,
    marginTop: theme.spacing.xs,
  },
  trackingContainer: {
    backgroundColor: theme.colors.primary[50],
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.primary[200],
  },
  trackingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  trackingTitle: {
    fontSize: theme.typography.sizes.base,
    fontWeight: '600',
    color: theme.colors.text.primary,
    marginLeft: theme.spacing.sm,
  },
  trackingNumber: {
    fontSize: theme.typography.sizes.base,
    fontWeight: '600',
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs,
  },
  trackingCarrier: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.md,
  },
  trackButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.primary[600],
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.borderRadius.md,
  },
  trackButtonText: {
    fontSize: theme.typography.sizes.base,
    fontWeight: '600',
    color: theme.colors.text.inverse,
    marginRight: theme.spacing.sm,
  },
  paymentContainer: {
    backgroundColor: theme.colors.gray[50],
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.gray[200],
  },
  paymentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  paymentTitle: {
    fontSize: theme.typography.sizes.base,
    fontWeight: '600',
    color: theme.colors.text.primary,
    marginLeft: theme.spacing.sm,
  },
  paymentMethod: {
    fontSize: theme.typography.sizes.base,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs,
  },
  transactionId: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.text.secondary,
  },
  progressContainer: {
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
  },
  cancelledContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cancelledIconContainer: {
    backgroundColor: theme.colors.error[50],
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
  },
  cancelledTextContainer: {
    marginLeft: theme.spacing.md,
  },
  cancelledTitle: {
    fontSize: theme.typography.sizes.lg,
    fontWeight: '600',
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs,
  },
  cancelledReason: {
    fontSize: theme.typography.sizes.base,
    color: theme.colors.text.secondary,
  },
  progressTracker: {
    gap: theme.spacing.md,
  },
  progressStep: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stepIndicatorContainer: {
    position: 'relative',
  },
  stepIndicator: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: theme.colors.gray[100],
    borderWidth: 2,
    borderColor: theme.colors.gray[300],
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepIndicatorCompleted: {
    backgroundColor: theme.colors.success[600],
    borderColor: theme.colors.success[600],
  },
  stepIndicatorActive: {
    backgroundColor: theme.colors.primary[600],
    borderColor: theme.colors.primary[600],
  },
  stepIndicatorPending: {
    backgroundColor: theme.colors.gray[100],
    borderColor: theme.colors.gray[300],
  },
  progressLine: {
    position: 'absolute',
    top: 28,
    left: 11,
    width: 2,
    height: 40,
    backgroundColor: theme.colors.gray[300],
  },
  progressLineCompleted: {
    backgroundColor: theme.colors.success[600],
  },
  stepContent: {
    flex: 1,
    marginLeft: theme.spacing.md,
  },
  stepTitle: {
    fontSize: theme.typography.sizes.base,
    fontWeight: '600',
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs,
  },
  stepTitleActive: {
    color: theme.colors.primary[600],
  },
  stepDescription: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.text.secondary,
  },
  stepDescriptionActive: {
    color: theme.colors.text.primary,
  },
  stepTimestamp: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.text.secondary,
    marginTop: theme.spacing.xs,
  },
}); 