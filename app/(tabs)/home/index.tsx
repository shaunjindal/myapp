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
} from 'react-native';
import { useRouter } from 'expo-router';
import { useProductStore } from '../../../src/store/productStore';
import { useAuthStore } from '../../../src/store/authStore';
import { ProductCard } from '../../../src/components/ProductCard';
import { Button } from '../../../src/components/Button';
import { theme } from '../../../src/styles/theme';
import { Ionicons } from '@expo/vector-icons';

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

  const featuredProducts = products.slice(0, 4);
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

        {/* Hero Section */}
        <View style={styles.heroSection}>
          <View style={styles.heroContent}>
            <Text style={styles.heroTitle}>Special Offer</Text>
            <Text style={styles.heroSubtitle}>Up to 50% off on selected items</Text>
            <Button
              title="Shop Now"
              onPress={() => router.push('/products')}
              variant="secondary"
              size="md"
            />
          </View>
          <View style={styles.heroImageContainer}>
            <Ionicons name="gift" size={60} color={theme.colors.secondary[400]} />
          </View>
        </View>

        {/* Quick Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Ionicons name="cube" size={24} color={theme.colors.primary[600]} />
            <Text style={styles.statNumber}>{products.length}</Text>
            <Text style={styles.statLabel}>Products</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="grid" size={24} color={theme.colors.success[600]} />
            <Text style={styles.statNumber}>{categories.length}</Text>
            <Text style={styles.statLabel}>Categories</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="star" size={24} color={theme.colors.warning[500]} />
            <Text style={styles.statNumber}>4.8</Text>
            <Text style={styles.statLabel}>Rating</Text>
          </View>
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

        {/* Featured Products */}
        <View style={styles.featuredSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Featured Products</Text>
            <TouchableOpacity onPress={() => router.push('/(tabs)/products')}>
              <Text style={styles.seeAllLink}>See All</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.productsContainer}>
            {featuredProducts.map((product) => (
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
  heroSection: {
    backgroundColor: theme.colors.primary[600],
    marginHorizontal: theme.spacing.xl,
    marginTop: theme.spacing.xl,
    borderRadius: theme.borderRadius['2xl'],
    padding: theme.spacing.xl,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    ...theme.shadows.lg,
  },
  heroContent: {
    flex: 1,
  },
  heroTitle: {
    fontSize: theme.typography.sizes['3xl'],
    fontWeight: '800' as any,
    color: theme.colors.text.inverse,
    marginBottom: theme.spacing.sm,
  },
  heroSubtitle: {
    fontSize: theme.typography.sizes.base,
    color: theme.colors.primary[100],
    marginBottom: theme.spacing.lg,
    fontWeight: '500' as any,
  },
  heroImageContainer: {
    marginLeft: theme.spacing.lg,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: theme.spacing.xl,
    marginTop: theme.spacing.xl,
  },
  statCard: {
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.lg,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: theme.spacing.xs,
    ...theme.shadows.md,
  },
  statNumber: {
    fontSize: theme.typography.sizes['2xl'],
    fontWeight: '700' as any,
    color: theme.colors.text.primary,
    marginTop: theme.spacing.sm,
  },
  statLabel: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.text.secondary,
    fontWeight: '500' as any,
    marginTop: theme.spacing.xs,
  },
  categoriesSection: {
    marginTop: theme.spacing['4xl'],
  },
  featuredSection: {
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
    height: 160, // Fixed height to ensure content fits
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