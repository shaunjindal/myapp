# E-Commerce Backend System

A scalable, modular e-commerce backend application built with Java Spring Boot following Domain-Driven Design (DDD) principles and clean architecture patterns.

## 🏗️ Architecture Overview

This system follows a layered architecture with clear separation of concerns:

```
┌─────────────────────────────────────────┐
│             Presentation Layer           │
│     (Controllers, DTOs, API Docs)       │
├─────────────────────────────────────────┤
│              Service Layer               │
│        (Business Logic Services)        │
├─────────────────────────────────────────┤
│              Domain Layer                │
│     (Entities, Value Objects, Enums)    │
├─────────────────────────────────────────┤
│           Infrastructure Layer           │
│    (Repositories, External Services)    │
└─────────────────────────────────────────┘
```

## 🚀 Key Features

### ✅ **Domain-Driven Design Implementation**
- Rich domain models with embedded business logic
- Immutable value objects for data integrity
- Clear separation between entities and value objects
- Business rules enforced at the domain level

### ✅ **Comprehensive User Management**
- User registration and authentication
- Role-based access control (Customer, Admin, Support, Manager)
- Multiple address management
- User status management (Active, Inactive, Suspended)

### ✅ **Advanced Product Catalog**
- Hierarchical category system
- Product variants and specifications
- Inventory management with stock reservation
- Multi-image support
- SEO-friendly slugs
- Price management with discount support

### ✅ **Smart Shopping Cart**
- Guest and authenticated user carts
- Cart expiration and persistence
- Real-time stock validation
- Discount code application
- Cart abandonment tracking

### ✅ **Robust Order Management**
- Complete order lifecycle management
- Order status tracking with history
- Multiple payment method support
- Shipping and billing address management
- Order cancellation and refund capabilities

### ✅ **Security & Validation**
- JWT-based authentication
- Input validation using Jakarta Validation
- Role-based authorization
- CORS configuration
- Security best practices

## 📁 Project Structure

```
src/main/java/com/ecommerce/
├── EcommerceBackendApplication.java          # Main Spring Boot application
├── domain/                                   # Domain layer (DDD)
│   ├── common/                              # Shared domain objects
│   │   ├── AuditableEntity.java            # Base entity with auditing
│   │   ├── Address.java                    # Address value object
│   │   └── AddressType.java                # Address type enumeration
│   ├── user/                               # User domain
│   │   ├── User.java                       # User aggregate root
│   │   ├── UserRole.java                   # User roles with permissions
│   │   └── UserStatus.java                 # User status enumeration
│   ├── product/                            # Product domain
│   │   ├── Product.java                    # Product aggregate root
│   │   ├── Category.java                   # Product category entity
│   │   ├── ProductStatus.java              # Product status enumeration
│   │   ├── ProductDimensions.java          # Product dimensions value object
│   │   └── DimensionUnit.java              # Dimension units enumeration
│   ├── cart/                               # Shopping cart domain
│   │   ├── Cart.java                       # Cart aggregate root
│   │   ├── CartItem.java                   # Cart item value object
│   │   └── CartStatus.java                 # Cart status enumeration
│   └── order/                              # Order domain
│       ├── Order.java                      # Order aggregate root
│       ├── OrderItem.java                  # Order item value object
│       ├── OrderStatus.java                # Order status enumeration
│       ├── OrderStatusHistory.java         # Order status tracking
│       └── PaymentMethod.java              # Payment methods enumeration
├── dto/                                     # Data Transfer Objects (TODO)
├── repository/                              # Repository interfaces (TODO)
├── service/                                 # Service layer (TODO)
├── controller/                              # REST controllers (TODO)
└── config/                                  # Configuration classes (TODO)
```

## 🔧 Technology Stack

- **Java 17** - Modern Java features and performance
- **Spring Boot 3.2.0** - Application framework
- **Spring Security** - Authentication and authorization
- **Spring Web** - REST API development
- **Spring Validation** - Input validation
- **JWT** - Token-based authentication
- **MapStruct** - Object mapping
- **OpenAPI/Swagger** - API documentation
- **Maven** - Dependency management

## 🏃‍♂️ Getting Started

### Prerequisites
- Java 17 or higher
- Maven 3.6 or higher

### Running the Application

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd app/backend
   ```

2. **Build the application**
   ```bash
   mvn clean compile
   ```

3. **Run the application**
   ```bash
   mvn spring-boot:run
   ```

4. **Access the application**
   - API Base URL: `http://localhost:8080/api`
   - Swagger UI: `http://localhost:8080/api/swagger-ui.html`
   - Health Check: `http://localhost:8080/api/actuator/health`

## 📚 Domain Models

### User Domain
- **User**: Customer information, authentication, roles, and addresses
- **UserRole**: Role-based permissions (Customer, Admin, Support, Manager)
- **UserStatus**: Account status management

### Product Domain
- **Product**: Product information, pricing, inventory, and specifications
- **Category**: Hierarchical product categorization
- **ProductDimensions**: Physical product dimensions with unit conversion

### Cart Domain
- **Cart**: Shopping cart with items, discounts, and expiration
- **CartItem**: Individual items in cart with price snapshots

### Order Domain
- **Order**: Complete order with items, payment, shipping, and status tracking
- **OrderItem**: Order line items with historical product information
- **OrderStatusHistory**: Comprehensive order status change tracking

## 🔒 Security Features

### Authentication
- JWT-based token authentication
- Token expiration management
- Secure password handling

### Authorization
- Role-based access control
- Method-level security
- Resource-specific permissions

### Validation
- Input validation at domain level
- Request validation in controllers
- Business rule validation in services

## 🚀 Scalability Features

### Design Patterns
- **Repository Pattern** - Data access abstraction
- **Strategy Pattern** - Payment method handling
- **Observer Pattern** - Order status change notifications
- **Builder Pattern** - Complex object creation
- **Factory Pattern** - Entity creation

### Future Extensibility
- **Plugin Architecture** - Easy integration of new features
- **Event-Driven Architecture** - Loose coupling between modules
- **Microservice Ready** - Domain boundaries for service extraction
- **Cache Integration** - Performance optimization points identified

## 📊 Business Logic Highlights

### Inventory Management
- Real-time stock tracking
- Stock reservation for cart items
- Automatic stock adjustment on order fulfillment

### Pricing Engine
- Dynamic pricing with discount support
- Promotional pricing capabilities
- Price history tracking

### Order Lifecycle
- Complete order state machine
- Business rule validation at each step
- Audit trail for all changes

### Cart Management
- Guest and user cart support
- Cart persistence and recovery
- Smart expiration policies

## 🔄 Development Status

### ✅ Completed
- [x] Project structure and Maven configuration
- [x] Complete domain models with rich business logic
- [x] Comprehensive validation and error handling
- [x] Security configuration foundation
- [x] Documentation and API specs setup

### 🚧 In Progress
- [ ] Data Transfer Objects (DTOs)
- [ ] Repository interfaces and implementations
- [ ] Service layer with business logic
- [ ] REST API controllers
- [ ] Security implementation

### 📋 Planned
- [ ] Unit and integration tests
- [ ] API documentation completion
- [ ] Performance optimization
- [ ] Database integration
- [ ] Caching layer
- [ ] Event-driven features

## 🤝 Contributing

This project follows clean architecture principles and domain-driven design. When contributing:

1. Maintain separation of concerns between layers
2. Keep business logic in domain models
3. Use dependency injection consistently
4. Write comprehensive tests
5. Follow established naming conventions
6. Document complex business rules

## 📝 API Documentation

Once the controllers are implemented, full API documentation will be available at:
- **Swagger UI**: `http://localhost:8080/api/swagger-ui.html`
- **OpenAPI Spec**: `http://localhost:8080/api/api-docs`

## 🔍 Monitoring & Health

- **Health Endpoints**: `/actuator/health`
- **Metrics**: `/actuator/metrics`
- **Application Info**: `/actuator/info`

---

**Built with ❤️ using Spring Boot and Domain-Driven Design principles** 