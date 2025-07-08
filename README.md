# React Native E-Commerce App

A full-featured, cross-platform e-commerce application built with React Native, Expo, and TypeScript. This app runs as a Progressive Web App (PWA), Android app, and iOS app from the same codebase.

## Features

- **Cross-Platform**: Runs on iOS, Android, and Web
- **Modern UI**: Clean, responsive design with proper styling
- **Product Catalog**: Browse products with search and filtering
- **Shopping Cart**: Add, remove, and manage cart items
- **User Authentication**: Mock login/registration system
- **Product Details**: Comprehensive product information with image gallery
- **User Profile**: Order history and address management
- **State Management**: Zustand for efficient state handling
- **Routing**: File-based routing with Expo Router
- **TypeScript**: Full type safety throughout the application

## Tech Stack

- **React Native** - Cross-platform mobile development
- **Expo** - Development platform and tools
- **TypeScript** - Type safety and developer experience
- **Expo Router** - File-based navigation
- **Zustand** - State management
- **React Native StyleSheet** - Styling
- **Expo Vector Icons** - Icon library

## Prerequisites

- Node.js (version 16 or higher)
- npm or yarn
- Expo CLI (`npm install -g @expo/cli`)

## Installation

1. **Clone the repository** (or navigate to the project directory)
   ```bash
   cd /path/to/project
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm start
   ```

## Running the App

### Web
```bash
npm run web
# or press 'w' in the Expo CLI terminal
```
Access at: http://localhost:8081

### iOS Simulator
```bash
npm run ios
# or press 'i' in the Expo CLI terminal
```
*Requires Xcode installed on macOS*

### Android Emulator
```bash
npm run android
# or press 'a' in the Expo CLI terminal
```
*Requires Android Studio and emulator setup*

### Physical Device
1. Install Expo Go app on your device
2. Scan the QR code displayed in the terminal
3. The app will load on your device

## Project Structure

```
app/
├── (tabs)/              # Tab navigation screens
│   ├── _layout.tsx      # Tab layout configuration
│   ├── index.tsx        # Home screen
│   ├── products.tsx     # Product listing
│   ├── cart.tsx         # Shopping cart
│   └── profile.tsx      # User profile
├── product/
│   └── [id].tsx         # Dynamic product detail page
├── _layout.tsx          # Root layout
├── login.tsx            # Login screen
└── register.tsx         # Registration screen

src/
├── components/          # Reusable UI components
│   ├── Button.tsx       # Custom button component
│   ├── Input.tsx        # Text input component
│   ├── ProductCard.tsx  # Product display card
│   └── CartItem.tsx     # Cart item component
├── store/               # Zustand state stores
│   ├── authStore.ts     # Authentication state
│   ├── cartStore.ts     # Shopping cart state
│   └── productStore.ts  # Product catalog state
├── data/
│   └── mockData.ts      # Sample product data
└── types/
    └── index.ts         # TypeScript type definitions
```

## Demo Credentials

For testing the authentication system:
- **Email**: demo@example.com
- **Password**: password

## Key Features Explained

### Authentication
- Mock authentication system with persistent login
- Registration creates new user accounts
- Protected routes require authentication

### Product Catalog
- 10 sample products across 6 categories
- Search functionality with multiple criteria
- Category filtering
- Product ratings and reviews

### Shopping Cart
- Add/remove items with quantity management
- Persistent cart state
- Mock checkout process
- Authentication-required checkout

### User Profile
- Order history display
- Multiple delivery addresses
- User information management

### State Management
- **Auth Store**: User authentication and profile
- **Cart Store**: Shopping cart with persistence
- **Product Store**: Product catalog with filtering

## Customization

### Adding New Products
Edit `src/data/mockData.ts` to add more products:

```typescript
export const mockProducts: Product[] = [
  // Add your products here
];
```

### Styling
The app uses React Native StyleSheet. Modify styles in individual component files or create a centralized theme system.

### API Integration
Replace mock data and functions in the stores with actual API calls:

```typescript
// Example in productStore.ts
fetchProducts: async () => {
  const response = await fetch('/api/products');
  const products = await response.json();
  set({ products });
}
```

## Building for Production

### Web Build
```bash
npm run build:web
```

### Native Builds
For production builds, you'll need to use EAS Build:

```bash
npx eas build --platform ios
npx eas build --platform android
```

## Troubleshooting

### Common Issues

1. **Metro bundler cache issues**
   ```bash
   npx expo start --clear
   ```

2. **Node modules issues**
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

3. **TypeScript errors**
   - Check that all required dependencies are installed
   - Ensure TypeScript version compatibility

### Development Tips

- Use `npx expo doctor` to check for common configuration issues
- Enable Fast Refresh for better development experience
- Use React DevTools for debugging state and components

## Contributing

1. Create feature branches from main
2. Follow TypeScript best practices
3. Add proper error handling
4. Test on multiple platforms
5. Update documentation as needed

## License

MIT License - feel free to use this project as a starting point for your own e-commerce applications.

## Support

For issues and questions:
- Check the Expo documentation: https://docs.expo.dev/
- Review React Native docs: https://reactnative.dev/
- Check TypeScript handbook: https://www.typescriptlang.org/docs/
``` 