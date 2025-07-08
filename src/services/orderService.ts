import { api } from '../utils/apiClient';
import { 
  OrderDto, 
  CreateOrderRequest, 
  OrderItemRequest,
  OrderStatusHistoryDto,
  AddressDto,
  OrderStatus, 
  PaymentMethod 
} from '../types/order';

export interface OrdersResponse {
  content: OrderDto[];
  currentPage: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
  message?: string;
}

class OrderService {
  private baseUrl = '/orders';

  // Order Creation Methods

  /**
   * Create order from cart
   */
  async createOrderFromCart(request: CreateOrderRequest): Promise<OrderDto> {
    const response = await api.post<OrderDto>(`${this.baseUrl}/from-cart`, request);
    
    console.log('New order created:', response.id);
    
    return response;
  }

  /**
   * Create order directly (without cart)
   */
  async createDirectOrder(request: CreateOrderRequest): Promise<OrderDto> {
    const response = await api.post<OrderDto>(`${this.baseUrl}/direct`, request);
    
    console.log('New order created (direct):', response.id);
    
    return response;
  }

  // Order Query Methods

  /**
   * Get user's orders with pagination and filtering
   */
  async getUserOrders(
    page: number = 0,
    size: number = 10,
    status?: string,
    search?: string,
    sortBy: string = 'orderDate',
    sortDirection: string = 'desc'
  ): Promise<OrdersResponse> {
    const params = new URLSearchParams({
      page: page.toString(),
      size: size.toString(),
      sortBy,
      sortDirection,
    });

    if (status) params.append('status', status);
    if (search) params.append('search', search);

    const response = await api.get<OrdersResponse>(`${this.baseUrl}?${params}`);
    return response;
  }

  /**
   * Get recent orders for user
   */
  async getRecentOrders(
    page: number = 0,
    size: number = 5,
    days: number = 30
  ): Promise<OrdersResponse> {
    const params = new URLSearchParams({
      page: page.toString(),
      size: size.toString(),
      days: days.toString(),
    });

    const response = await api.get<OrdersResponse>(`${this.baseUrl}/recent?${params}`);
    return response;
  }

  /**
   * Get order by ID
   */
  async getOrderById(orderId: string): Promise<OrderDto> {
    const response = await api.get<OrderDto>(`${this.baseUrl}/${orderId}`);
    return response;
  }

  /**
   * Get order by order number
   */
  async getOrderByNumber(orderNumber: string): Promise<OrderDto> {
    const response = await api.get<OrderDto>(`${this.baseUrl}/number/${orderNumber}`);
    return response;
  }

  // Order Status Management Methods

  /**
   * Get order status history
   */
  async getOrderStatusHistory(orderId: string): Promise<OrderStatusHistoryDto[]> {
    const response = await api.get<OrderStatusHistoryDto[]>(`${this.baseUrl}/${orderId}/status-history`);
    return response;
  }

  /**
   * Cancel order
   */
  async cancelOrder(orderId: string, reason?: string): Promise<OrderDto> {
    const response = await api.post<OrderDto>(`${this.baseUrl}/${orderId}/cancel`, { reason });
    return response;
  }

  // Administrative Methods (for internal use)

  /**
   * Confirm order (admin only)
   */
  async confirmOrder(orderId: string, notes?: string): Promise<OrderDto> {
    const response = await api.put<OrderDto>(`${this.baseUrl}/${orderId}/confirm`, { notes });
    return response;
  }

  /**
   * Process payment (admin only)
   */
  async processPayment(orderId: string, transactionId: string, notes?: string): Promise<OrderDto> {
    const response = await api.put<OrderDto>(`${this.baseUrl}/${orderId}/process-payment`, { transactionId, notes });
    return response;
  }

  /**
   * Ship order (admin only)
   */
  async shipOrder(orderId: string, trackingNumber: string, carrier?: string, notes?: string): Promise<OrderDto> {
    const response = await api.put<OrderDto>(`${this.baseUrl}/${orderId}/ship`, { trackingNumber, carrier, notes });
    return response;
  }

  /**
   * Deliver order (admin only)
   */
  async deliverOrder(orderId: string, notes?: string): Promise<OrderDto> {
    const response = await api.put<OrderDto>(`${this.baseUrl}/${orderId}/deliver`, { notes });
    return response;
  }

  // Utility Methods

  /**
   * Format order status for display
   */
  formatOrderStatus(status: OrderStatus): string {
    const statusMap: Record<OrderStatus, string> = {
      [OrderStatus.PENDING]: 'Pending',
      [OrderStatus.CONFIRMED]: 'Confirmed',
      [OrderStatus.PAID]: 'Paid',
      [OrderStatus.PROCESSING]: 'Processing',
      [OrderStatus.SHIPPED]: 'Shipped',
      [OrderStatus.DELIVERED]: 'Delivered',
      [OrderStatus.CANCELLED]: 'Cancelled',
      [OrderStatus.REFUNDED]: 'Refunded',
      [OrderStatus.ON_HOLD]: 'On Hold',
      [OrderStatus.FAILED]: 'Failed',
    };
    return statusMap[status] || status;
  }

  /**
   * Get status color for UI
   */
  getStatusColor(status: OrderStatus): string {
    const colorMap: Record<OrderStatus, string> = {
      [OrderStatus.PENDING]: 'yellow',
      [OrderStatus.CONFIRMED]: 'blue',
      [OrderStatus.PAID]: 'green',
      [OrderStatus.PROCESSING]: 'purple',
      [OrderStatus.SHIPPED]: 'indigo',
      [OrderStatus.DELIVERED]: 'green',
      [OrderStatus.CANCELLED]: 'red',
      [OrderStatus.REFUNDED]: 'orange',
      [OrderStatus.ON_HOLD]: 'gray',
      [OrderStatus.FAILED]: 'red',
    };
    return colorMap[status] || 'gray';
  }

  /**
   * Get status icon for UI
   */
  getStatusIcon(status: OrderStatus): string {
    const iconMap: Record<OrderStatus, string> = {
      [OrderStatus.PENDING]: 'clock',
      [OrderStatus.CONFIRMED]: 'check',
      [OrderStatus.PAID]: 'credit-card',
      [OrderStatus.PROCESSING]: 'cog',
      [OrderStatus.SHIPPED]: 'truck',
      [OrderStatus.DELIVERED]: 'package',
      [OrderStatus.CANCELLED]: 'x',
      [OrderStatus.REFUNDED]: 'arrow-left',
      [OrderStatus.ON_HOLD]: 'pause',
      [OrderStatus.FAILED]: 'exclamation-triangle',
    };
    return iconMap[status] || 'info';
  }

  /**
   * Format payment method for display
   */
  formatPaymentMethod(method: PaymentMethod): string {
    const methodMap: Record<PaymentMethod, string> = {
      [PaymentMethod.CREDIT_CARD]: 'Credit Card',
      [PaymentMethod.DEBIT_CARD]: 'Debit Card',
      [PaymentMethod.PAYPAL]: 'PayPal',
      [PaymentMethod.APPLE_PAY]: 'Apple Pay',
      [PaymentMethod.GOOGLE_PAY]: 'Google Pay',
      [PaymentMethod.BANK_TRANSFER]: 'Bank Transfer',
      [PaymentMethod.CASH_ON_DELIVERY]: 'Cash on Delivery',
    };
    return methodMap[method] || method;
  }

  /**
   * Calculate order summary
   */
  calculateOrderSummary(order: OrderDto) {
    return {
      itemCount: order.items.length,
      totalQuantity: order.items.reduce((sum, item) => sum + item.quantity, 0),
      subtotal: order.subtotal,
      discount: order.discountAmount,
      tax: order.taxAmount,
      shipping: order.shippingAmount,
      total: order.totalAmount,
      formattedSubtotal: this.formatCurrency(order.subtotal),
      formattedDiscount: this.formatCurrency(order.discountAmount),
      formattedTax: this.formatCurrency(order.taxAmount),
      formattedShipping: this.formatCurrency(order.shippingAmount),
      formattedTotal: this.formatCurrency(order.totalAmount),
    };
  }

  /**
   * Format currency for display
   */
  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  }

  /**
   * Format date for display
   */
  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }

  /**
   * Format datetime for display
   */
  formatDateTime(dateString: string): string {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  /**
   * Check if order can be cancelled
   */
  canCancelOrder(status: OrderStatus): boolean {
    return [
      OrderStatus.PENDING,
      OrderStatus.CONFIRMED,
      OrderStatus.PAID,
    ].includes(status);
  }

  /**
   * Check if order can be refunded
   */
  canRefundOrder(status: OrderStatus): boolean {
    return [
      OrderStatus.DELIVERED,
      OrderStatus.SHIPPED,
    ].includes(status);
  }

  /**
   * Get order progress percentage
   */
  getOrderProgress(status: OrderStatus): number {
    const progressMap: Record<OrderStatus, number> = {
      [OrderStatus.PENDING]: 10,
      [OrderStatus.CONFIRMED]: 25,
      [OrderStatus.PAID]: 40,
      [OrderStatus.PROCESSING]: 60,
      [OrderStatus.SHIPPED]: 80,
      [OrderStatus.DELIVERED]: 100,
      [OrderStatus.CANCELLED]: 0,
      [OrderStatus.REFUNDED]: 0,
      [OrderStatus.ON_HOLD]: 30,
      [OrderStatus.FAILED]: 0,
    };
    return progressMap[status] || 0;
  }
}

export default new OrderService(); 