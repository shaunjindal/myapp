export enum OrderStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  PAID = 'PAID',
  PROCESSING = 'PROCESSING',
  SHIPPED = 'SHIPPED',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED',
  REFUNDED = 'REFUNDED',
  ON_HOLD = 'ON_HOLD',
  FAILED = 'FAILED',
}

export enum PaymentMethod {
  CREDIT_CARD = 'CREDIT_CARD',
  DEBIT_CARD = 'DEBIT_CARD',
  PAYPAL = 'PAYPAL',
  APPLE_PAY = 'APPLE_PAY',
  GOOGLE_PAY = 'GOOGLE_PAY',
  BANK_TRANSFER = 'BANK_TRANSFER',
  CASH_ON_DELIVERY = 'CASH_ON_DELIVERY',
  RAZORPAY_CARD = 'RAZORPAY_CARD',
  RAZORPAY_UPI = 'RAZORPAY_UPI',
}

export interface PaymentComponent {
  type: string;
  amount: number;
  text: string;
  isNegative?: boolean;
}

export interface CreateOrderRequest {
  billingAddressId: string;
  shippingAddressId: string;
  paymentMethod: PaymentMethod;
  customerNotes?: string;
  discountCode?: string;
  items?: OrderItemRequest[];
}

export interface OrderItemRequest {
  productId: string;
  quantity: number;
  isGift?: boolean;
  giftMessage?: string;
}

export interface OrderDto {
  id: string;
  orderNumber: string;
  userId: string;
  status: OrderStatus;
  subtotal: number;
  discountAmount: number;
  taxAmount: number;
  shippingAmount: number;
  totalAmount: number;
  discountCode?: string;
  currency?: string;
  paymentComponents?: PaymentComponent[];
  billingAddress: AddressDto;
  shippingAddress: AddressDto;
  paymentMethod: PaymentMethod;
  paymentTransactionId?: string;
  orderDate: string;
  shippedDate?: string;
  deliveredDate?: string;
  cancelledDate?: string;
  cancellationReason?: string;
  customerNotes?: string;
  internalNotes?: string;
  trackingNumber?: string;
  shippingCarrier?: string;
  totalWeight?: number;
  items: OrderItemDto[];
  statusHistory?: OrderStatusHistoryDto[];
  createdAt: string;
  updatedAt: string;
  // Helper methods
  statusDisplayName?: string;
  canBeCancelled?: boolean;
  canBeRefunded?: boolean;
  isShippable?: boolean;
  isFinal?: boolean;
  isActive?: boolean;
  requiresCustomerAction?: boolean;
  requiresSellerAction?: boolean;
  formattedTotalAmount?: string;
  formattedSubtotal?: string;
  formattedShippingAmount?: string;
  formattedTaxAmount?: string;
  formattedDiscountAmount?: string;
  totalItemCount?: number;
  uniqueItemCount?: number;
}

export interface OrderItemDto {
  id: string;
  productId: string;
  productName: string;
  productSku: string;
  productDescription?: string;
  productImageUrl?: string;
  productBrand?: string;
  productCategory?: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  productWeight?: number;
  discountAmount?: number;
  taxAmount?: number;
  addedAt: string;
  // Price component fields
  baseAmount?: number;
  taxRate?: number;
  isGift: boolean;
  giftMessage?: string;
  customAttributes?: string;
  // Helper methods
  formattedUnitPrice?: string;
  formattedTotalPrice?: string;
  formattedDiscountAmount?: string;
  totalWeight?: number;
  formattedTotalWeight?: string;
  hasDiscount?: boolean;
  hasTax?: boolean;
  displayName?: string;
}

export interface OrderStatusHistoryDto {
  id: string;
  status: OrderStatus;
  previousStatus?: OrderStatus;
  timestamp: string;
  notes?: string;
  changedBy?: string;
  systemGenerated: boolean;
  notificationSent: boolean;
  customerVisible: boolean;
  // Helper methods
  statusDisplayName?: string;
  previousStatusDisplayName?: string;
  isStatusUpgrade?: boolean;
  isStatusDowngrade?: boolean;
  changeType?: string;
  formattedTimestamp?: string;
  changeDescription?: string;
  iconClass?: string;
  statusColor?: string;
  isPrimaryStatus?: boolean;
  isNegativeStatus?: boolean;
  isPositiveStatus?: boolean;
}

export interface AddressDto {
  firstName?: string;
  lastName?: string;
  company?: string;
  street: string;
  street2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone?: string;
} 