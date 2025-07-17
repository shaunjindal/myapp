export interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  // Price component fields
  baseAmount?: number;
  taxRate?: number;
  taxAmount?: number;
  image: string;
  images: string[];
  description: string;
  category: string;
  rating: number;
  reviewCount: number;
  inStock: boolean;
  stockQuantity: number;
  brand: string;
  specifications: { [key: string]: string };
  tags: string[];
  // Variable dimension fields
  isVariableDimension?: boolean;
  fixedHeight?: number;
  variableDimensionRate?: number;
  maxLength?: number;
  dimensionUnit?: 'MILLIMETER' | 'CENTIMETER' | 'METER' | 'INCH' | 'FOOT' | 'YARD';
}

export interface CartItem {
  id: string;
  product: Product;
  quantity: number;
  // Variable dimension fields
  customLength?: number;
  calculatedUnitPrice?: number;
  dimensionDetails?: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  orders: Order[];
}

export interface Address {
  id: string;
  type: 'home' | 'work' | 'other';
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  isDefault: boolean;
}

export interface Order {
  id: string;
  userId: string;
  items: CartItem[];
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  createdAt: Date;
  deliveryAddress: Address;
  paymentMethod: string;
  trackingNumber?: string;
}

export interface Category {
  id: string;
  name: string;
  image: string;
  productCount: number;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isInitializing: boolean;
  token: string | null;
  initializeAuth: () => Promise<void>;
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string, autoLogin?: boolean) => Promise<boolean>;
  logout: () => Promise<void>;
  addOrder: (order: Order) => void;
  setToken: (token: string) => void;
}

export interface CartState {
  items: CartItem[];
  total: number;
  addItem: (product: Product, quantity?: number) => Promise<void>;
  removeItem: (productId: string) => Promise<void>;
  updateQuantity: (productId: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;

  createOrder: () => Order | null;
  syncCart: () => Promise<void>;
}

export interface ProductFilters {
  category?: string;
  categories?: string[];
  minPrice?: number;
  maxPrice?: number;
  rating?: number;
  inStock?: boolean;
  brand?: string;
  sortBy?: 'name' | 'price' | 'rating' | 'newest';
  sortOrder?: 'asc' | 'desc';
}

export interface ProductState {
  products: Product[];
  categories: Category[];
  loading: boolean;
  error: string | null;
  filters: ProductFilters;
  searchQuery: string;
  fetchProducts: () => Promise<void>;
  setFilters: (filters: ProductFilters) => void;
  setSearchQuery: (query: string) => void;
  getFilteredProducts: () => Product[];
  getProductById: (id: string) => Product | undefined;
  getRecommendedProducts: (currentProductId: string, limit?: number) => Product[];
} 