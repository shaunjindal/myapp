# Frontend-Backend Integration Guide

## Overview

This document outlines the integration between the React Native frontend and the Spring Boot backend for the e-commerce application.

## Integration Components

### 1. API Client (`src/utils/apiClient.ts`)
- Configured axios instance with base URL and interceptors
- Automatic token management for authentication
- Error handling and logging
- Development vs production URL configuration

### 2. API Types (`src/types/api.ts`)
- TypeScript interfaces matching backend DTOs
- Request/response types for all API endpoints
- Mapping functions to convert between API DTOs and frontend types

### 3. API Services (`src/services/`)
- **authService.ts**: Authentication, user management, addresses
- **productService.ts**: Product catalog, search, categories
- **cartService.ts**: Shopping cart operations
- **orderService.ts**: Order management, tracking, history

### 4. Custom Hooks (`src/hooks/`)
- **useApi.ts**: Generic hooks for API calls, mutations, pagination, caching
- **useAuth.ts**: Authentication-specific hooks
- **useProducts.ts**: Product management hooks
- **useCart.ts**: Cart operation hooks
- **useOrders.ts**: Order management hooks

### 5. Updated Stores (`src/store/`)
- **authStore.ts**: Updated to use real API calls
- **productStore.ts**: Fetches from backend
- **cartStore.ts**: Synchronized with backend cart

## Key Features

### Authentication
- JWT token-based authentication
- Automatic token storage and management
- Session handling with refresh tokens
- Role-based access control

### Product Management
- Real-time product data from backend
- Search and filtering capabilities
- Category management
- Product recommendations
- Inventory tracking

### Shopping Cart
- Server-synchronized cart state
- Guest cart support
- Cart persistence across sessions
- Real-time inventory validation
- Coupon and discount management

### Order Management
- Complete order lifecycle
- Order tracking and status updates
- Return and refund requests
- Order history and analytics

## Error Handling

### Graceful Degradation
- Fallback to local state when API calls fail
- Offline support for critical operations
- User-friendly error messages
- Retry mechanisms for failed requests

### Loading States
- Loading indicators for async operations
- Optimistic UI updates where appropriate
- Skeleton screens for better UX

## Configuration

### Environment Variables
Update your environment configuration:

```typescript
const API_BASE_URL = __DEV__ 
  ? 'http://localhost:8080/api' 
  : 'https://your-production-api.com/api';
```

### Backend Configuration
Ensure your Spring Boot backend is running on:
- Development: `http://localhost:8080`
- Production: Update the production URL in `apiClient.ts`

## Usage Examples

### Using Hooks in Components

```typescript
import { useProducts, useCart, useAuth } from '../hooks';

function ProductList() {
  const { data: products, loading, error } = useProducts();
  const { addProduct } = useCartActions();
  
  const handleAddToCart = async (product) => {
    await addProduct(product.id, 1);
  };
  
  return (
    // Component JSX
  );
}
```

### Authentication Flow

```typescript
import { useAuthActions } from '../hooks/useAuth';

function LoginScreen() {
  const { loginUser, loginLoading } = useAuthActions();
  
  const handleLogin = async (email, password) => {
    const success = await loginUser({ email, password });
    if (success) {
      // Navigate to dashboard
    }
  };
}
```

## Migration from Mock Data

### Removed Files
- `src/data/mockData.ts` - No longer needed

### Updated Components
- All cart operations now async
- Error handling added to API calls
- Loading states properly managed

### Type Updates
- Cart and Auth store methods now return Promises
- Updated interface definitions to reflect async operations

## Next Steps

1. **Testing**: Add comprehensive tests for API integration
2. **Caching**: Implement more sophisticated caching strategies
3. **Offline Support**: Add offline-first functionality
4. **Push Notifications**: Integrate order status notifications
5. **Analytics**: Add user behavior tracking

## Troubleshooting

### Common Issues

1. **CORS Errors**: Ensure backend CORS configuration allows frontend origin
2. **Token Expiry**: Check token refresh logic
3. **Network Timeouts**: Verify timeout configurations
4. **Type Mismatches**: Ensure DTO types match backend exactly

### Debug Mode
Enable debug logging by setting `__DEV__` flag and checking console outputs.

## Security Considerations

- Tokens stored securely using secure storage
- API calls use HTTPS in production
- Sensitive data sanitized in logs
- Request/response interceptors for security headers 