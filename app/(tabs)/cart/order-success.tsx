import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  BackHandler,
} from 'react-native';
import { useRouter, useLocalSearchParams, useFocusEffect } from 'expo-router';
import { Button } from '../../../src/components/Button';
import { theme } from '../../../src/styles/theme';
import { Ionicons } from '@expo/vector-icons';
import orderService from '../../../src/services/orderService';

export default function OrderSuccessScreen() {
  const router = useRouter();
  const { orderNumber, orderId } = useLocalSearchParams<{
    orderNumber: string;
    orderId: string;
  }>();
  
  const [order, setOrder] = useState<any>(null);
  const [estimatedDelivery, setEstimatedDelivery] = useState('');

  // Handle back button press to go to profile page
  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => {
        // Navigate to profile page instead of going back in history
        router.replace('/(tabs)/profile');
        return true; // Prevent default back action
      };

      const backHandler = BackHandler.addEventListener('hardwareBackPress', onBackPress);
      
      return () => backHandler.remove();
    }, [router])
  );

  useEffect(() => {
    const fetchOrderDetails = async () => {
      if (orderId) {
        try {
          const orderDetails = await orderService.getOrderById(orderId);
          setOrder(orderDetails);
          
          // Calculate estimated delivery (3-5 business days)
          const deliveryDate = new Date();
          deliveryDate.setDate(deliveryDate.getDate() + 4);
          setEstimatedDelivery(deliveryDate.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          }));
        } catch (error) {
          console.error('Failed to fetch order details:', error);
          // Use fallback data
          setEstimatedDelivery(new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          }));
        }
      } else {
        // Use fallback data if no order ID
        setEstimatedDelivery(new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        }));
      }
    };

    fetchOrderDetails();
  }, [orderId]);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Success Icon */}
        <View style={styles.successContainer}>
          <View style={styles.iconContainer}>
            <Ionicons name="checkmark-circle" size={80} color={theme.colors.success[600]} />
          </View>
          <Text style={styles.successTitle}>Order Placed Successfully!</Text>
          <Text style={styles.successSubtitle}>
            Thank you for your purchase. Your order has been confirmed and is being processed.
          </Text>
        </View>

        {/* Order Details */}
        <View style={styles.detailsContainer}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Order Number:</Text>
            <Text style={styles.detailValue}>{orderNumber || 'Loading...'}</Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Estimated Delivery:</Text>
            <Text style={styles.detailValue}>{estimatedDelivery || 'Loading...'}</Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Order Status:</Text>
            <View style={styles.statusContainer}>
              <View style={styles.statusDot} />
              <Text style={styles.statusText}>
                {order ? orderService.formatOrderStatus(order.status) : 'Processing'}
              </Text>
            </View>
          </View>
        </View>

        {/* What's Next */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>What's Next?</Text>
          
          <View style={styles.stepContainer}>
            <View style={styles.step}>
              <View style={styles.stepIcon}>
                <Ionicons name="receipt" size={20} color={theme.colors.primary[600]} />
              </View>
              <View style={styles.stepContent}>
                <Text style={styles.stepTitle}>Order Confirmation</Text>
                <Text style={styles.stepDescription}>
                  We'll send you an email confirmation with your order details
                </Text>
              </View>
            </View>
            
            <View style={styles.step}>
              <View style={styles.stepIcon}>
                <Ionicons name="cube" size={20} color={theme.colors.primary[600]} />
              </View>
              <View style={styles.stepContent}>
                <Text style={styles.stepTitle}>Processing</Text>
                <Text style={styles.stepDescription}>
                  Your order is being prepared and will be shipped soon
                </Text>
              </View>
            </View>
            
            <View style={styles.step}>
              <View style={styles.stepIcon}>
                <Ionicons name="car" size={20} color={theme.colors.primary[600]} />
              </View>
              <View style={styles.stepContent}>
                <Text style={styles.stepTitle}>Shipping</Text>
                <Text style={styles.stepDescription}>
                  Track your package once it's shipped
                </Text>
              </View>
            </View>
            
            <View style={styles.step}>
              <View style={styles.stepIcon}>
                <Ionicons name="home" size={20} color={theme.colors.primary[600]} />
              </View>
              <View style={styles.stepContent}>
                <Text style={styles.stepTitle}>Delivery</Text>
                <Text style={styles.stepDescription}>
                  Your order will be delivered to your address
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Actions */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity style={styles.actionButton} onPress={() => router.replace('/(tabs)/profile')}>
            <Ionicons name="receipt-outline" size={20} color={theme.colors.primary[600]} />
            <Text style={styles.actionText}>View Order History</Text>
            <Ionicons name="chevron-forward" size={16} color={theme.colors.gray[400]} />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="download-outline" size={20} color={theme.colors.primary[600]} />
            <Text style={styles.actionText}>Download Receipt</Text>
            <Ionicons name="chevron-forward" size={16} color={theme.colors.gray[400]} />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="help-circle-outline" size={20} color={theme.colors.primary[600]} />
            <Text style={styles.actionText}>Need Help?</Text>
            <Ionicons name="chevron-forward" size={16} color={theme.colors.gray[400]} />
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <Button
          title="Continue Shopping"
          onPress={() => router.replace('/(tabs)/products')}
          variant="primary"
          size="lg"
          fullWidth
        />
        
        <TouchableOpacity 
          style={styles.secondaryButton}
          onPress={() => {
            if (orderId) {
              router.replace(`/(tabs)/profile/order-details?orderId=${orderId}`);
            } else {
              router.replace('/(tabs)/profile');
            }
          }}
        >
          <Text style={styles.secondaryButtonText}>View Order Details</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    flex: 1,
    padding: theme.spacing.xl,
  },
  successContainer: {
    alignItems: 'center',
    marginBottom: theme.spacing['3xl'],
  },
  iconContainer: {
    marginBottom: theme.spacing.xl,
  },
  successTitle: {
    fontSize: theme.typography.sizes['2xl'],
    fontWeight: '700',
    color: theme.colors.text.primary,
    textAlign: 'center',
    marginBottom: theme.spacing.sm,
  },
  successSubtitle: {
    fontSize: theme.typography.sizes.base,
    color: theme.colors.text.secondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  detailsContainer: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.xl,
    marginBottom: theme.spacing.xl,
    ...theme.shadows.sm,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  detailLabel: {
    fontSize: theme.typography.sizes.base,
    color: theme.colors.text.secondary,
    fontWeight: '500',
  },
  detailValue: {
    fontSize: theme.typography.sizes.base,
    color: theme.colors.text.primary,
    fontWeight: '600',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.warning[500],
    marginRight: theme.spacing.sm,
  },
  statusText: {
    fontSize: theme.typography.sizes.base,
    color: theme.colors.warning[600],
    fontWeight: '600',
  },
  section: {
    marginBottom: theme.spacing.xl,
  },
  sectionTitle: {
    fontSize: theme.typography.sizes.lg,
    fontWeight: '600',
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.lg,
  },
  stepContainer: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.xl,
    ...theme.shadows.sm,
  },
  step: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.lg,
  },
  stepIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.primary[50],
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.md,
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: theme.typography.sizes.base,
    fontWeight: '600',
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs,
  },
  stepDescription: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.text.secondary,
    lineHeight: 20,
  },
  actionsContainer: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.xl,
    overflow: 'hidden',
    marginBottom: theme.spacing.xl,
    ...theme.shadows.sm,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.gray[200],
  },
  actionText: {
    fontSize: theme.typography.sizes.base,
    color: theme.colors.text.primary,
    fontWeight: '500',
    flex: 1,
    marginLeft: theme.spacing.md,
  },
  footer: {
    padding: theme.spacing.xl,
    backgroundColor: theme.colors.surface,
    borderTopWidth: 1,
    borderTopColor: theme.colors.gray[200],
    gap: theme.spacing.md,
  },
  secondaryButton: {
    alignItems: 'center',
    paddingVertical: theme.spacing.md,
  },
  secondaryButtonText: {
    fontSize: theme.typography.sizes.base,
    color: theme.colors.primary[600],
    fontWeight: '600',
  },
}); 