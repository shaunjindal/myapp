# Cart Persistence System Integration Guide

## Overview

This guide documents the comprehensive cart persistence system that handles both authenticated users and guest users, following modern e-commerce patterns. The system provides seamless cart management with session-based guest identification, automatic cart merging on user authentication, and robust persistence mechanisms.

## Architecture Overview

### Backend Architecture

The backend follows a clean architecture approach with:

- **Domain Layer**: Core business logic and entities
- **Application Layer**: Service layer with business rules
- **Infrastructure Layer**: Data persistence and external integrations
- **Controller Layer**: REST API endpoints

### Frontend Architecture

The frontend uses:

- **Zustand Store**: State management with persistence
- **Service Layer**: API communication abstraction
- **Session Manager**: Guest cart session handling
- **Hooks**: React hooks for cart operations

## Key Features

### 1. Dual User Support
- **Authenticated Users**: Persistent carts with 30-day expiration
- **Guest Users**: Session-based carts with 24-hour expiration

### 2. Session Management
- Device fingerprinting for guest identification
- Session ID generation and persistence
- Automatic session header injection

### 3. Cart Merging
- Seamless cart merging when guests authenticate
- Conflict resolution for duplicate items
- Preservation of cart state across sessions

### 4. Advanced Features
- Cart expiration management
- Scheduled cleanup tasks
- Cart validation and pricing
- Discount and coupon support
- Shipping and tax calculations

## Backend Implementation

### 1. Database Schema

#### Cart Entity
```sql
CREATE TABLE carts (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36),
    session_id VARCHAR(128),
    device_fingerprint VARCHAR(255),
    status ENUM('ACTIVE', 'ABANDONED', 'EXPIRED', 'CHECKED_OUT'),
    expires_at TIMESTAMP,
    discount_amount DECIMAL(19,2),
    discount_code VARCHAR(50),
    tax_amount DECIMAL(19,2),
    shipping_amount DECIMAL(19,2),
    user_agent VARCHAR(500),
    ip_address VARCHAR(45),
    last_activity_at TIMESTAMP,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    INDEX idx_cart_user_id (user_id),
    INDEX idx_cart_session_id (session_id),
    INDEX idx_cart_status (status),
    INDEX idx_cart_expires_at (expires_at)
);
```

#### Cart Item Entity
```sql
CREATE TABLE cart_items (
    id VARCHAR(36) PRIMARY KEY,
    cart_id VARCHAR(36),
    product_id VARCHAR(36),
    quantity INTEGER,
    unit_price DECIMAL(19,2),
    total_price DECIMAL(19,2),
    price_at_time DECIMAL(19,2),
    notes TEXT,
    is_gift BOOLEAN,
    gift_message TEXT,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    INDEX idx_cart_item_cart_id (cart_id),
    INDEX idx_cart_item_product_id (product_id),
    FOREIGN KEY (cart_id) REFERENCES carts(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);
```

### 2. Service Layer

#### CartService.java
```java
@Service
@Transactional
public class CartService {
    
    // Get or create cart for authenticated user
    public CartJpaEntity getOrCreateUserCart(String userId) {
        // Implementation...
    }
    
    // Get or create cart for guest user
    public CartJpaEntity getOrCreateGuestCart(String sessionId, String deviceFingerprint, HttpServletRequest request) {
        // Implementation...
    }
    
    // Merge guest cart with user cart on login
    public CartJpaEntity mergeGuestCartWithUserCart(String userId, String sessionId, String deviceFingerprint) {
        // Implementation...
    }
    
    // Scheduled cleanup of expired carts
    @Scheduled(fixedRate = 3600000) // Every hour
    public void cleanupExpiredCarts() {
        // Implementation...
    }
}
```

### 3. Controller Layer

#### CartController.java
```java
@RestController
@RequestMapping("/api/cart")
public class CartController {
    
    @GetMapping
    public ResponseEntity<CartDto> getCart(HttpServletRequest request) {
        // Implementation...
    }
    
    @PostMapping("/items")
    public ResponseEntity<CartDto> addToCart(@RequestBody AddToCartRequest request, HttpServletRequest httpRequest) {
        // Implementation...
    }
    
    @PostMapping("/merge")
    public ResponseEntity<CartDto> mergeCart(@RequestBody MergeCartRequest request, HttpServletRequest httpRequest) {
        // Implementation...
    }
}
```

## Frontend Implementation

### 1. Session Manager

#### sessionManager.ts
```typescript
class SessionManager {
    private sessionInfo: SessionInfo | null = null;
    
    async initialize(): Promise<SessionInfo> {
        // Initialize session with device fingerprinting
    }
    
    async authenticateUser(userId: string): Promise<SessionInfo> {
        // Update session when user logs in
    }
    
    async getSessionHeaders(): Promise<Record<string, string>> {
        // Return headers for API requests
    }
}
```

### 2. Cart Store

#### cartStore.ts
```typescript
export const useCartStore = create<CartStoreState>()(
  persist(
    (set, get) => ({
      // Initialize cart with session management
      initializeCart: async () => {
        const sessionInfo = await sessionManager.initialize();
        // Implementation...
      },
      
      // Merge guest cart when user authenticates
      mergeGuestCart: async (userId: string) => {
        const mergedCart = await cartService.mergeGuestCart(state.sessionId);
        // Implementation...
      },
      
      // Enhanced cart operations with session awareness
      addItemWithSession: async (product: Product, quantity: number = 1) => {
        // Implementation...
      },
    }),
    {
      name: 'cart-storage-v3',
      version: 2,
    }
  )
);
```

### 3. Cart Service

#### cartService.ts
```typescript
export const cartService = {
  // Cart management with session headers
  getCart: async (): Promise<CartDto> => {
    const response = await api.get<CartDto>('/cart');
    return response;
  },
  
  // Guest cart merging
  mergeGuestCart: async (guestCartId: string): Promise<CartDto> => {
    const response = await api.post<CartDto>('/cart/merge', { guestCartId });
    return response;
  },
  
  // Cart validation
  validateCart: async (): Promise<ValidationResult> => {
    const response = await api.post<ValidationResult>('/cart/validate');
    return response;
  },
};
```

### 4. API Client Enhancement

#### apiClient.ts
```typescript
// Request interceptor to add session headers
apiClient.interceptors.request.use(
  async (config) => {
    const sessionHeaders = await sessionManager.getSessionHeaders();
    Object.keys(sessionHeaders).forEach(key => {
      config.headers[key] = sessionHeaders[key];
    });
    return config;
  }
);
```

## Usage Examples

### 1. Initialize Cart System

```typescript
// Initialize cart system on app startup
const App = () => {
  const { initializeCart } = useCartStore();
  
  useEffect(() => {
    initializeCart();
  }, []);
  
  return <YourAppComponent />;
};
```

### 2. Handle User Authentication

```typescript
// When user logs in
const handleLogin = async (userId: string) => {
  const { handleUserAuthentication } = useCartStore();
  await handleUserAuthentication(userId);
};
```

### 3. Cart Operations

```typescript
// Add item to cart
const { addItemWithSession } = useCartStore();
await addItemWithSession(product, quantity);

// Update quantity
const { updateQuantityWithSession } = useCartStore();
await updateQuantityWithSession(productId, newQuantity);

// Remove item
const { removeItemWithSession } = useCartStore();
await removeItemWithSession(productId);
```

### 4. Cart Validation

```typescript
// Validate cart before checkout
const { validateCart } = useValidateCart();
const result = await validateCart.mutate();

if (result.isValid) {
  // Proceed to checkout
} else {
  // Handle validation errors
  console.log('Cart validation issues:', result.issues);
}
```

## Configuration

### Backend Configuration

#### application.yml
```yaml
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/ecommerce
    username: ${DB_USERNAME}
    password: ${DB_PASSWORD}
  
  jpa:
    hibernate:
      ddl-auto: validate
    show-sql: false
    properties:
      hibernate:
        dialect: org.hibernate.dialect.MySQL8Dialect

cart:
  guest-expiry-hours: 24
  user-expiry-days: 30
  cleanup-interval: 3600000 # 1 hour
```

### Frontend Configuration

#### Environment Variables
```env
EXPO_PUBLIC_API_URL=http://localhost:8080/api
```

## Testing

### Backend Tests

```java
@SpringBootTest
class CartServiceTest {
    
    @Test
    void shouldCreateGuestCart() {
        // Test guest cart creation
    }
    
    @Test
    void shouldMergeGuestCartWithUserCart() {
        // Test cart merging
    }
    
    @Test
    void shouldCleanupExpiredCarts() {
        // Test cleanup functionality
    }
}
```

### Frontend Tests

```typescript
describe('Cart Store', () => {
  it('should initialize cart with session', async () => {
    // Test cart initialization
  });
  
  it('should merge guest cart on authentication', async () => {
    // Test cart merging
  });
  
  it('should sync with server', async () => {
    // Test server synchronization
  });
});
```

## Deployment Considerations

### Database Optimization
- Add appropriate indexes for cart queries
- Configure connection pooling
- Set up database monitoring

### Session Management
- Use Redis for session storage in production
- Configure session timeout appropriately
- Implement session cleanup jobs

### API Performance
- Implement caching for cart data
- Use connection pooling
- Add rate limiting

### Security
- Validate session headers
- Implement CSRF protection
- Sanitize user inputs

## Monitoring and Metrics

### Key Metrics to Track
- Cart abandonment rate
- Cart conversion rate
- Session duration
- Cart item count distribution
- API response times

### Logging
- Cart operations (add, update, remove)
- Session management events
- Cart merging operations
- Validation failures

## Troubleshooting

### Common Issues

1. **Session Not Found**
   - Check session headers in API requests
   - Verify session manager initialization

2. **Cart Merging Failures**
   - Validate guest cart session
   - Check user authentication state

3. **Performance Issues**
   - Review database queries
   - Check connection pooling
   - Monitor memory usage

### Debug Tools
- Use browser developer tools for session inspection
- Check backend logs for cart operations
- Monitor database queries

## Future Enhancements

### Planned Features
- Real-time cart synchronization
- Cart sharing between devices
- Advanced cart analytics
- Multi-currency support
- Wishlist integration

### Performance Optimizations
- Implement cart caching
- Add batch operations
- Optimize database queries
- Use CDN for static assets

## Conclusion

The cart persistence system provides a robust foundation for e-commerce applications with comprehensive support for both authenticated and guest users. The implementation follows modern best practices and provides excellent scalability and maintainability.

For support or questions about this implementation, please refer to the development team documentation or create an issue in the project repository. 