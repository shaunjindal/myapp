import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Image,
  Dimensions,
  ActivityIndicator,
  ImageBackground,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useProductStore } from '../../../src/store/productStore';
import { useAuthStore } from '../../../src/store/authStore';
import { ProductCard } from '../../../src/components/ProductCard';
import { Button } from '../../../src/components/Button';
import { theme } from '../../../src/styles/theme';
import { Ionicons } from '@expo/vector-icons';
import { formatPrice } from '../../../src/utils/currencyUtils';

const { width: screenWidth } = Dimensions.get('window');

export default function HomeScreen() {
  const router = useRouter();
  const { products, categories, fetchProducts, loading, error } = useProductStore();
  const { isAuthenticated, user } = useAuthStore();
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  useEffect(() => {
    // Only fetch if we don't have products yet
    if (products.length === 0) {
      fetchProducts();
    } else {
      setIsInitialLoad(false);
    }
  }, []);

  // Update initial load state when products are loaded
  useEffect(() => {
    if (products.length > 0 && isInitialLoad) {
      setIsInitialLoad(false);
    }
  }, [products.length, isInitialLoad]);

  const featuredProducts = products.slice(0, 6); // Show fewer but more prominent products
  console.log('🏠 HomeScreen: Featured products for display:', featuredProducts?.length || 0);

  const handleProductPress = (productId: string) => {
    router.push(`/(tabs)/products/${productId}`);
  };

  const handleCategoryPress = (categoryId: string) => {
    router.push({
      pathname: '/(tabs)/products',
      params: { category: categoryId },
    });
  };

  const renderHeroFeaturedProduct = (product: any, index: number) => (
    <TouchableOpacity
      key={product.id}
      style={[
        styles.heroProductCard,
        { marginLeft: index === 0 ? theme.spacing.xl : 0 }
      ]}
      onPress={() => handleProductPress(product.id)}
      activeOpacity={0.9}
    >
      <ImageBackground
        source={{ uri: product.image }}
        style={styles.heroProductImage}
        imageStyle={styles.heroProductImageStyle}
      >
        <View style={styles.heroProductOverlay}>
          <View style={styles.heroProductHeader}>
            {product.discount > 0 && (
              <View style={styles.heroDiscountBadge}>
                <Text style={styles.heroDiscountText}>-{product.discount}%</Text>
              </View>
            )}
          </View>
          
          <View style={styles.heroProductInfo}>
            <Text style={styles.heroProductCategory}>
              {product.category || 'Featured'}
            </Text>
            <Text style={styles.heroProductName} numberOfLines={2}>
              {product.name}
            </Text>
            
            <View style={styles.heroProductPricing}>
              <Text style={styles.heroProductPrice}>
                {formatPrice(product.price)}
              </Text>
              {product.originalPrice > product.price && (
                <Text style={styles.heroProductOriginalPrice}>
                  {formatPrice(product.originalPrice)}
                </Text>
              )}
            </View>
            
            <View style={styles.heroProductRating}>
              <View style={styles.heroStarsContainer}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <Ionicons
                    key={star}
                    name={star <= (product.rating || 4.5) ? "star" : "star-outline"}
                    size={14}
                    color={theme.colors.warning[400]}
                  />
                ))}
              </View>
              <Text style={styles.heroProductRatingText}>
                {product.rating || 4.5} ({product.reviews || 128})
              </Text>
            </View>
          </View>
        </View>
      </ImageBackground>
    </TouchableOpacity>
  );

  // Show loading state for initial load
  if (isInitialLoad && (loading || products.length === 0)) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary[600]} />
          <Text style={styles.loadingText}>Loading your dashboard...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Show error state
  if (error && products.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={64} color={theme.colors.error[500]} />
          <Text style={styles.errorText}>Failed to load data</Text>
          <Text style={styles.errorSubtext}>{error}</Text>
          <Button
            title="Retry"
            onPress={() => {
              setIsInitialLoad(true);
              fetchProducts();
            }}
            variant="primary"
            size="md"
            style={styles.retryButton}
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <View style={styles.headerLeft}>
              <Text style={styles.greeting}>
                {isAuthenticated ? `Hello, ${user?.name?.split(' ')[0]}!` : 'Welcome!'}
              </Text>
              <Text style={styles.title}>Discover Amazing Products</Text>
            </View>
            <View style={styles.headerRight}>
              {isAuthenticated ? (
                <TouchableOpacity style={styles.profileButton}>
                  <Image
                    source={{ uri: user?.avatar || 'https://via.placeholder.com/40' }}
                    style={styles.avatar}
                  />
                </TouchableOpacity>
              ) : (
                <Button
                  title="Login"
                  onPress={() => router.push('/login')}
                  variant="primary"
                  size="sm"
                />
              )}
            </View>
          </View>
        </View>

        {/* Hero Featured Products Carousel */}
        <View style={styles.heroFeaturedSection}>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false} 
            contentContainerStyle={styles.heroCarouselContainer}
            decelerationRate="fast"
            snapToInterval={screenWidth * 0.8}
            snapToAlignment="start"
            pagingEnabled={false}
          >
            {featuredProducts.map(renderHeroFeaturedProduct)}
          </ScrollView>
        </View>

        {/* Categories */}
        <View style={styles.categoriesSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Shop by Category</Text>
            <TouchableOpacity onPress={() => router.push({
              pathname: '/(tabs)/products',
              params: { openCategorySheet: 'true' }
            })}>
              <Text style={styles.seeAllLink}>See All</Text>
            </TouchableOpacity>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoriesContainer}>
            {categories.map((category) => (
              <TouchableOpacity
                key={category.id}
                style={styles.categoryCard}
                onPress={() => handleCategoryPress(category.id)}
                activeOpacity={0.8}
              >
                <View style={styles.categoryImageContainer}>
                  <Image
                    source={{ uri: category.image }}
                    style={styles.categoryImage}
                  />
                  <View style={styles.categoryOverlay} />
                </View>
                <View style={styles.categoryInfo}>
                  <Text style={styles.categoryName}>{category.name}</Text>
                  <Text style={styles.categoryCount}>
                    {category.productCount} items
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* More Products */}
        <View style={styles.moreProductsSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>More Products</Text>
            <TouchableOpacity onPress={() => router.push('/(tabs)/products')}>
              <Text style={styles.seeAllLink}>See All</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.productsContainer}>
            {products.slice(6, 10).map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onPress={() => handleProductPress(product.id)}
              />
            ))}
          </View>
        </View>

        {/* Bottom Spacer */}
        <View style={styles.bottomSpacer} />
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
  },
  header: {
    backgroundColor: theme.colors.background,
    paddingTop: theme.spacing.md,
    paddingBottom: theme.spacing.lg,
    ...theme.shadows.sm,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.xl,
  },
  headerLeft: {
    flex: 1,
  },
  headerRight: {
    marginLeft: theme.spacing.md,
    minWidth: 80,
    alignItems: 'flex-end',
  },
  greeting: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.text.secondary,
    fontWeight: '500' as any,
    marginBottom: theme.spacing.xs,
  },
  title: {
    fontSize: theme.typography.sizes['2xl'],
    fontWeight: '700' as any,
    color: theme.colors.text.primary,
  },
  profileButton: {
    borderRadius: theme.borderRadius.full,
    ...theme.shadows.sm,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  
  // Hero Featured Section
  heroFeaturedSection: {
    marginTop: theme.spacing.xl,
    marginBottom: theme.spacing.xl,
  },
  heroCarouselContainer: {
    paddingRight: theme.spacing.xl,
  },
  heroProductCard: {
    width: screenWidth * 0.8,
    height: 420,
    marginRight: theme.spacing.lg,
    borderRadius: theme.borderRadius['2xl'],
    overflow: 'hidden',
    ...theme.shadows.xl,
  },
  heroProductImage: {
    width: '100%',
    height: '100%',
    justifyContent: 'space-between',
  },
  heroProductImageStyle: {
    borderRadius: theme.borderRadius['2xl'],
  },
  heroProductOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'space-between',
    padding: theme.spacing.xl,
  },
  heroProductHeader: {
    alignItems: 'flex-start',
  },
  heroDiscountBadge: {
    backgroundColor: theme.colors.error[500],
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  heroDiscountText: {
    color: 'white',
    fontSize: theme.typography.sizes.sm,
    fontWeight: '700' as any,
  },

  heroProductInfo: {
    width: '100%',
  },
  heroProductCategory: {
    fontSize: theme.typography.sizes.xs,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '600' as any,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    marginBottom: theme.spacing.xs,
  },
  heroProductName: {
    fontSize: theme.typography.sizes.xl,
    fontWeight: '700' as any,
    color: 'white',
    marginBottom: theme.spacing.sm,
    lineHeight: 24,
  },
  heroProductPricing: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  heroProductPrice: {
    fontSize: theme.typography.sizes['2xl'],
    fontWeight: '800' as any,
    color: 'white',
  },
  heroProductOriginalPrice: {
    fontSize: theme.typography.sizes.base,
    color: 'rgba(255, 255, 255, 0.7)',
    textDecorationLine: 'line-through',
    marginLeft: theme.spacing.sm,
  },
  heroProductRating: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  heroStarsContainer: {
    flexDirection: 'row',
    marginRight: theme.spacing.sm,
  },
  heroProductRatingText: {
    fontSize: theme.typography.sizes.sm,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '500' as any,
  },
  
  // Regular sections
  categoriesSection: {
    marginTop: theme.spacing['2xl'],
  },
  moreProductsSection: {
    marginTop: theme.spacing['3xl'],
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.xl,
    marginBottom: theme.spacing.lg,
  },
  sectionTitle: {
    fontSize: theme.typography.sizes.xl,
    fontWeight: '700' as any,
    color: theme.colors.text.primary,
  },
  seeAllLink: {
    fontSize: theme.typography.sizes.base,
    color: theme.colors.primary[600],
    fontWeight: '600' as any,
  },
  categoriesContainer: {
    paddingLeft: theme.spacing.xl,
  },
  categoryCard: {
    width: 140,
    height: 160,
    marginRight: theme.spacing.lg,
    borderRadius: theme.borderRadius.xl,
    overflow: 'hidden',
    backgroundColor: theme.colors.background,
    ...theme.shadows.md,
  },
  categoryImageContainer: {
    position: 'relative',
    height: 100,
  },
  categoryImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  categoryOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  categoryInfo: {
    padding: theme.spacing.md,
  },
  categoryName: {
    fontSize: theme.typography.sizes.sm,
    fontWeight: '600' as any,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs,
  },
  categoryCount: {
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.text.secondary,
    fontWeight: '500' as any,
  },
  productsContainer: {
    paddingHorizontal: theme.spacing.xl,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    gap: theme.spacing.sm,
  },
  bottomSpacer: {
    height: theme.spacing['3xl'],
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.xl,
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
    padding: theme.spacing.xl,
  },
  errorText: {
    fontSize: theme.typography.sizes.lg,
    color: theme.colors.error[500],
    fontWeight: '600',
    marginTop: theme.spacing.md,
    textAlign: 'center',
  },
  errorSubtext: {
    fontSize: theme.typography.sizes.base,
    color: theme.colors.text.secondary,
    marginTop: theme.spacing.sm,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: theme.spacing.lg,
  },
}); 