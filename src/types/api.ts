// API Types that match backend DTOs and domain models

// Auth Types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface AuthResponse {
  token: string;
  user: UserDto;
}

// User Types
export interface UserDto {
  id: string;
  email: string;
  name: string;
  role: 'CUSTOMER' | 'ADMIN' | 'SUPPORT' | 'MANAGER';
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'PENDING_VERIFICATION';
  avatar?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AddressDto {
  id: string;
  type: 'BILLING' | 'SHIPPING' | 'BOTH';
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAddressRequest {
  type: 'BILLING' | 'SHIPPING' | 'BOTH';
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  isDefault?: boolean;
}

export interface UpdateAddressRequest extends Partial<CreateAddressRequest> {}

// Product Types
export interface ProductDto {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  // Price component fields
  baseAmount?: number;
  taxRate?: number;
  taxAmount?: number;
  sku: string;
  status: 'ACTIVE' | 'INACTIVE' | 'OUT_OF_STOCK' | 'DISCONTINUED';
  stockQuantity: number;
  minStockLevel: number;
  maxStockLevel: number;
  weight: number;
  dimensions: ProductDimensionsDto;
  category: CategoryDto;
  images: string[];
  specifications: { [key: string]: string };
  tags: string[];
  rating: number;
  reviewCount: number;
  brand: string;
  // Variable dimension fields
  isVariableDimension?: boolean;
  fixedHeight?: number;
  variableDimensionRate?: number;
  maxLength?: number;
  dimensionUnit?: 'MILLIMETER' | 'CENTIMETER' | 'METER' | 'INCH' | 'FOOT' | 'YARD';
  createdAt: string;
  updatedAt: string;
}

export interface ProductDimensionsDto {
  length: number;
  width: number;
  height: number;
  unit: 'INCHES' | 'CENTIMETERS';
}

export interface CategoryDto {
  id: string;
  name: string;
  description?: string;
  slug: string;
  parentId?: string;
  level: number;
  isActive: boolean;
  displayOrder: number;
  image?: string;
  seoTitle?: string;
  seoDescription?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProductSearchRequest {
  query?: string;
  categoryId?: string;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  inStock?: boolean;
  brand?: string;
  sortBy?: 'name' | 'price' | 'rating' | 'createdAt';
  sortOrder?: 'ASC' | 'DESC';
  page?: number;
  size?: number;
}

export interface ProductSearchResponse {
  products: ProductDto[];
  totalElements: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

// Cart Types
export interface CartDto {
  id: string;
  userId?: string;
  sessionId?: string;
  items: CartItemDto[];
  total: number;
  totalItems: number;
  discountAmount: number;
  taxAmount: number;
  shippingAmount: number;
  status: 'ACTIVE' | 'CHECKED_OUT' | 'ABANDONED' | 'EXPIRED';
  expiresAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CartItemDto {
  id: string;
  productId: string;
  productName: string;
  productImageUrl?: string;
  productSku?: string;
  productBrand?: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  originalPrice?: number;
  discountAmount?: number;
  savingsAmount?: number;
  // Price component fields from product
  baseAmount?: number;
  taxRate?: number;
  taxAmount?: number;
  isGift?: boolean;
  giftMessage?: string;
  isAvailable?: boolean;
  isPriceChanged?: boolean;
  unavailabilityReason?: string;
  // Variable dimension fields
  customLength?: number;
  calculatedUnitPrice?: number;
  dimensionDetails?: string;
  // Product variable dimension properties
  isVariableDimension?: boolean;
  fixedHeight?: number;
  dimensionUnit?: string;
  variableDimensionRate?: number;
  maxLength?: number;
  addedAt: string;
  updatedAt?: string;
}

export interface AddToCartRequest {
  productId: string;
  quantity: number;
  customLength?: number; // For variable dimension products
}

export interface UpdateCartItemRequest {
  quantity: number;
}

// Order Types
export interface OrderDto {
  id: string;
  userId: string;
  orderNumber: string;
  items: OrderItemDto[];
  subtotal: number;
  discountAmount: number;
  taxAmount: number;
  shippingAmount: number;
  total: number;
  status: 'PENDING' | 'CONFIRMED' | 'PAID' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED' | 'REFUNDED';
  paymentMethod: 'CREDIT_CARD' | 'PAYPAL' | 'BANK_TRANSFER' | 'CASH_ON_DELIVERY';
  paymentStatus: 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED';
  shippingAddress: AddressDto;
  billingAddress: AddressDto;
  trackingNumber?: string;
  notes?: string;
  statusHistory: OrderStatusHistoryDto[];
  estimatedDeliveryDate?: string;
  actualDeliveryDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface OrderItemDto {
  id: string;
  productId: string;
  productName: string;
  productImage: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  productSnapshot: any; // JSON representation of product at time of order
}

export interface OrderStatusHistoryDto {
  id: string;
  status: string;
  timestamp: string;
  notes?: string;
  changedBy?: string;
}

export interface CreateOrderRequest {
  cartId: string;
  shippingAddressId: string;
  billingAddressId: string;
  paymentMethod: 'CREDIT_CARD' | 'PAYPAL' | 'BANK_TRANSFER' | 'CASH_ON_DELIVERY';
  notes?: string;
}

export interface OrderSearchRequest {
  status?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  size?: number;
}

export interface OrderSearchResponse {
  orders: OrderDto[];
  totalElements: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

// Pagination Types
export interface PageRequest {
  page?: number;
  size?: number;
  sort?: string;
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
  hasNext: boolean;
  hasPrevious: boolean;
  message?: string; // Optional message for empty states or other notifications
}

// Error Types
export interface ApiErrorResponse {
  message: string;
  error: string;
  status: number;
  timestamp: string;
  path: string;
  details?: any;
}

// Generic API Response
export interface ApiResponse<T = any> {
  data: T;
  message?: string;
  success: boolean;
}

// Mapping functions to convert between API types and frontend types
export const mapProductDtoToProduct = (productDto: any) => ({
  id: productDto.id,
  name: productDto.name,
  price: productDto.price,
  originalPrice: productDto.originalPrice || productDto.price,
  // Price component fields
  baseAmount: productDto.baseAmount,
  taxRate: productDto.taxRate,
  taxAmount: productDto.taxAmount,
  image: productDto.imageUrl || productDto.images?.[0] || '',
  images: productDto.images || [productDto.imageUrl || ''],
  description: productDto.description,
  category: productDto.categoryName || productDto.category?.name || productDto.category || 'Unknown',
  rating: productDto.rating || productDto.averageRating || 4.5,
  reviewCount: productDto.reviewCount || 0,
  inStock: productDto.available !== undefined ? productDto.available : (productDto.status === 'ACTIVE' && productDto.stockQuantity > 0),
  stockQuantity: productDto.stock || productDto.stockQuantity || 999,
  brand: productDto.brand || 'Unknown',
  specifications: productDto.specifications || {},
  tags: productDto.tags || [],
  // Variable dimension fields
  isVariableDimension: productDto.isVariableDimension || false,
  fixedHeight: productDto.fixedHeight,
  variableDimensionRate: productDto.variableDimensionRate,
  maxLength: productDto.maxLength,
  dimensionUnit: productDto.dimensionUnit,
});

export const mapCategoryDtoToCategory = (categoryDto: any) => ({
  id: categoryDto.id,
  name: categoryDto.name,
  image: categoryDto.image || '',
  productCount: categoryDto.productCount || 0,
  slug: categoryDto.slug || categoryDto.name.toLowerCase().replace(/\s+/g, '-'),
});

export const mapAddressDtoToAddress = (addressDto: AddressDto) => ({
  id: addressDto.id,
  type: addressDto.type === 'BILLING' ? 'work' : addressDto.type === 'SHIPPING' ? 'home' : 'other',
  street: addressDto.street,
  city: addressDto.city,
  state: addressDto.state,
  zipCode: addressDto.zipCode,
  country: addressDto.country,
  isDefault: addressDto.isDefault,
});

export const mapAddressToCreateRequest = (address: {
  type: 'home' | 'work' | 'other';
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  isDefault?: boolean;
}): CreateAddressRequest => ({
  type: address.type === 'home' ? 'SHIPPING' : address.type === 'work' ? 'BILLING' : 'BOTH',
  street: address.street,
  city: address.city,
  state: address.state,
  zipCode: address.zipCode,
  country: address.country,
  isDefault: address.isDefault,
});

// Address type mapping utilities
export const mapFrontendToBackendAddressType = (frontendType: 'home' | 'work' | 'other'): 'BILLING' | 'SHIPPING' | 'BOTH' => {
  switch (frontendType) {
    case 'home':
      return 'SHIPPING';
    case 'work':
      return 'BILLING';
    case 'other':
      return 'BOTH';
    default:
      return 'SHIPPING';
  }
};

export const mapBackendToFrontendAddressType = (backendType: 'BILLING' | 'SHIPPING' | 'BOTH'): 'home' | 'work' | 'other' => {
  switch (backendType) {
    case 'SHIPPING':
      return 'home';
    case 'BILLING':
      return 'work';
    case 'BOTH':
      return 'other';
    default:
      return 'home';
  }
};

export const mapOrderDtoToOrder = (orderDto: OrderDto) => ({
  id: orderDto.id,
  userId: orderDto.userId,
  items: orderDto.items.map(item => ({
    id: item.id,
    product: {
      id: item.productId,
      name: item.productName,
      price: item.unitPrice,
      image: item.productImage,
    },
    quantity: item.quantity,
  })),
  total: orderDto.total,
  status: orderDto.status.toLowerCase() as 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled',
  createdAt: new Date(orderDto.createdAt),
  deliveryAddress: mapAddressDtoToAddress(orderDto.shippingAddress),
  paymentMethod: orderDto.paymentMethod.replace('_', ' '),
  trackingNumber: orderDto.trackingNumber,
}); 