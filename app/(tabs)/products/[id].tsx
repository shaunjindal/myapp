import React, { useState, useRef, useCallback, useEffect } from 'react';
import { View, Text, Image, TouchableOpacity, ScrollView, FlatList, Dimensions, Alert, Animated, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useProductStore } from '../../../src/store/productStore';
import { useCartStore } from '../../../src/store/cartStore';
import { Button } from '../../../src/components/Button';
import { theme } from '../../../src/styles/theme';
import { StyleSheet } from 'react-native';
import { productService } from '../../../src/services/productService';
import { mapProductDtoToProduct } from '../../../src/types/api';
import { Product } from '../../../src/types';

const screenWidth = Dimensions.get('window').width;

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { getProductById, getRecommendedProducts } = useProductStore();
  const { items, addItem, removeItem, updateQuantity } = useCartStore();
  
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [indicatorsVisible, setIndicatorsVisible] = useState(true);
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const carouselRef = useRef<FlatList>(null);
  const indicatorOpacity = useRef(new Animated.Value(1)).current;
  const hideTimer = useRef<NodeJS.Timeout | null>(null);
  const resetHideTimerRef = useRef<() => void>();
  
  // All hooks must be called before any conditional returns
  const viewabilityConfig = useRef({
    viewAreaCoveragePercentThreshold: 50,
  }).current;

  // Fetch product data on component mount
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // First try to get from store
        const storeProduct = getProductById(id as string);
        if (storeProduct) {
          setProduct(storeProduct);
          setLoading(false);
          return;
        }
        
        // If not in store, fetch from API
        console.log('Product not found in store, fetching from API...');
        const productDto = await productService.getProductById(id as string);
        const mappedProduct = mapProductDtoToProduct(productDto);
        setProduct(mappedProduct);
        setLoading(false);
      } catch (err: any) {
        console.error('Failed to fetch product:', err);
        setError(err.message || 'Failed to load product');
        setLoading(false);
      }
    };
    
    if (id) {
      fetchProduct();
    }
  }, [id]);

  const showIndicators = useCallback(() => {
    setIndicatorsVisible(true);
    Animated.timing(indicatorOpacity, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [indicatorOpacity]);

  const hideIndicators = useCallback(() => {
    Animated.timing(indicatorOpacity, {
      toValue: 0,
      duration: 500,
      useNativeDriver: true,
    }).start(() => {
      setIndicatorsVisible(false);
    });
  }, [indicatorOpacity]);

  const resetHideTimer = useCallback(() => {
    if (hideTimer.current) {
      clearTimeout(hideTimer.current);
    }
    showIndicators();
    hideTimer.current = setTimeout(() => {
      hideIndicators();
    }, 3000); // Hide after 3 seconds
  }, [showIndicators, hideIndicators]);

  // Initialize timer on component mount
  useEffect(() => {
    if (product?.images && product.images.length > 1) {
      resetHideTimer();
    }
    
    // Cleanup timer on unmount
    return () => {
      if (hideTimer.current) {
        clearTimeout(hideTimer.current);
      }
    };
  }, [product?.images, resetHideTimer]);

  const onViewableItemsChanged = useCallback(({ viewableItems }: any) => {
    if (viewableItems.length > 0) {
      setSelectedImageIndex(viewableItems[0].index);
      resetHideTimer();
    }
  }, [resetHideTimer]);

  // Computed values (not hooks)
  const recommendedProducts = getRecommendedProducts(id as string, 6);
  const cartItem = items.find(item => item.product.id === product?.id);
  const isInCart = !!cartItem;
  const currentQuantity = cartItem?.quantity || 0;

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary[500]} />
        <Text style={styles.loadingText}>Loading product...</Text>
      </SafeAreaView>
    );
  }

  if (error || !product) {
    return (
      <SafeAreaView style={styles.errorContainer}>
        <Text style={styles.errorText}>{error || 'Product not found'}</Text>
        <Button title="Go Back" onPress={() => router.back()} />
      </SafeAreaView>
    );
  }

  const handleAddToCart = () => {
    addItem(product, 1);
    Alert.alert('Success', `Added ${product.name} to cart!`);
  };

  const handleIncrement = () => {
    updateQuantity(product.id, currentQuantity + 1);
  };

  const handleDecrement = () => {
    if (currentQuantity > 0) {
      updateQuantity(product.id, currentQuantity - 1);
    }
  };

  const handleRemove = () => {
    removeItem(product.id);
    Alert.alert('Removed', `${product.name} removed from cart!`);
  };

  const handleThumbnailPress = (index: number) => {
    setSelectedImageIndex(index);
    carouselRef.current?.scrollToIndex({ index, animated: true });
    resetHideTimer();
  };

  const renderCarouselItem = ({ item }: { item: string; index: number }) => (
    <View style={styles.carouselSlide}>
      <Image source={{ uri: item }} style={styles.carouselImage} />
    </View>
  );

  const getItemLayout = (_: any, index: number) => ({
    length: screenWidth,
    offset: screenWidth * index,
    index,
  });

  const renderRecommendedProduct = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.recommendedProductCard}
      onPress={() => router.push(`/(tabs)/products/${item.id}`)}
    >
      <Image source={{ uri: item.images[0] }} style={styles.recommendedProductImage} />
      <View style={styles.recommendedProductInfo}>
        <Text style={styles.recommendedProductName} numberOfLines={2}>
          {item.name}
        </Text>
        <Text style={styles.recommendedProductPrice}>${item.price}</Text>
        <View style={styles.recommendedProductRating}>
          <Text style={styles.recommendedProductRatingText}>⭐ {item.rating}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Product Image Carousel */}
        <View style={styles.imageContainer}>
          <TouchableOpacity 
            style={styles.carouselContainer}
            activeOpacity={1}
            onPress={resetHideTimer}
          >
            <FlatList
              ref={carouselRef}
              data={product.images}
              renderItem={renderCarouselItem}
              keyExtractor={(_, index) => index.toString()}
              horizontal
              pagingEnabled={true}
              showsHorizontalScrollIndicator={false}
              onViewableItemsChanged={onViewableItemsChanged}
              viewabilityConfig={viewabilityConfig}
              style={styles.carousel}
              getItemLayout={getItemLayout}
              scrollEventThrottle={16}
              decelerationRate="fast"
              bounces={false}
              removeClippedSubviews={false}
            />
            
            {/* Page Indicators - Overlaid on carousel */}
            {product.images.length > 1 && (
              <Animated.View style={[styles.pageIndicatorContainer, { opacity: indicatorOpacity }]}>
                {product.images.map((_, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.pageIndicator,
                      selectedImageIndex === index && styles.activePageIndicator,
                    ]}
                    onPress={() => handleThumbnailPress(index)}
                  />
                ))}
              </Animated.View>
            )}
          </TouchableOpacity>
          
          {/* Thumbnail Selector */}
          <View>
            <ScrollView horizontal style={styles.thumbnailSelector} showsHorizontalScrollIndicator={false}>
              {product.images.map((image, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.thumbnailContainer,
                    selectedImageIndex === index && styles.selectedThumbnail,
                  ]}
                  onPress={() => handleThumbnailPress(index)}
                >
                  <Image source={{ uri: image }} style={styles.thumbnail} />
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>

        {/* Product Info */}
        <View style={styles.infoContainer}>
          <Text style={styles.productName}>{product.name}</Text>
          <View style={styles.brandCategoryContainer}>
            <Text style={styles.brand}>{product.brand}</Text>
            <Text style={styles.category}>{product.category}</Text>
          </View>
          
          <View style={styles.priceRatingContainer}>
            <View style={styles.priceContainer}>
              <Text style={styles.price}>${product.price}</Text>
              {product.originalPrice && (
                <Text style={styles.originalPrice}>${product.originalPrice}</Text>
              )}
            </View>
            <View style={styles.ratingContainer}>
              <Text style={styles.rating}>⭐ {product.rating}</Text>
              <Text style={styles.reviews}>({product.reviewCount} reviews)</Text>
            </View>
          </View>

          <Text style={styles.description}>{product.description}</Text>

          {/* Stock Status */}
          <View style={[
            styles.stockContainer,
            { 
              backgroundColor: product.inStock ? theme.colors.success[50] : theme.colors.error[50],
              borderColor: product.inStock ? theme.colors.success[200] : theme.colors.error[200]
            }
          ]}>
            {product.inStock ? (
              <Text style={[styles.inStock, { color: theme.colors.success[700] }]}>
                ✓ In Stock ({product.stockQuantity} available)
              </Text>
            ) : (
              <Text style={[styles.outOfStock, { color: theme.colors.error[700] }]}>
                ✗ Out of Stock
              </Text>
            )}
          </View>

        </View>

        {/* Specifications */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Specifications</Text>
          {Object.entries(product.specifications).map(([key, value]) => (
            <View key={key} style={styles.specificationRow}>
              <Text style={styles.specificationKey}>{key}:</Text>
              <Text style={styles.specificationValue}>{String(value)}</Text>
            </View>
          ))}
        </View>

        {/* Tags */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Tags</Text>
          <View style={styles.tags}>
            {product.tags.map((tag, index) => (
              <View key={index} style={styles.tag}>
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Recommended Products */}
        {recommendedProducts.length > 0 && (
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>You might also like</Text>
            <FlatList
              data={recommendedProducts}
              renderItem={renderRecommendedProduct}
              keyExtractor={(item) => item.id}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.recommendedProducts}
            />
          </View>
        )}
      </ScrollView>

      {/* Add to Cart Section */}
      {product.inStock && (
        <View style={styles.cartSection}>
          {!isInCart ? (
            <Button
              title="Add to Cart"
              onPress={handleAddToCart}
              variant="primary"
              size="lg"
              fullWidth
            />
          ) : (
            <View style={styles.cartControls}>
              <View style={styles.quantityContainer}>
                <Text style={styles.quantityLabel}>Quantity:</Text>
                <View style={styles.quantityControls}>
                  <TouchableOpacity
                    style={styles.quantityButton}
                    onPress={handleDecrement}
                  >
                    <Ionicons name="remove" size={20} color={theme.colors.text.primary} />
                  </TouchableOpacity>
                  <Text style={styles.quantityText}>{currentQuantity}</Text>
                  <TouchableOpacity
                    style={styles.quantityButton}
                    onPress={handleIncrement}
                  >
                    <Ionicons name="add" size={20} color={theme.colors.text.primary} />
                  </TouchableOpacity>
                </View>
              </View>
              <TouchableOpacity style={styles.removeButton} onPress={handleRemove}>
                <Ionicons name="trash" size={18} color={theme.colors.error[600]} />
                <Text style={styles.removeText}>Remove</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollView: {
    flex: 1,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.xl,
  },
  errorText: {
    fontSize: theme.typography.sizes.lg,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.xl,
    textAlign: 'center',
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
    textAlign: 'center',
    marginTop: theme.spacing.md,
  },
  imageContainer: {
    backgroundColor: theme.colors.surface,
    position: 'relative',
  },
  carouselContainer: {
    position: 'relative',
    height: 350,
  },
  carousel: {
    height: 350,
    position: 'relative',
  },
  carouselSlide: {
    width: screenWidth,
    height: 350,
    justifyContent: 'center',
    alignItems: 'center',
  },
  carouselImage: {
    width: screenWidth,
    height: 350,
    resizeMode: 'cover',
  },
  pageIndicatorContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    zIndex: 10,
    paddingHorizontal: theme.spacing.md,
  },
  pageIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    marginHorizontal: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 4,
  },
  activePageIndicator: {
    backgroundColor: theme.colors.primary[600],
    width: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
    elevation: 6,
  },
  thumbnailSelector: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.gray[200],
  },
  thumbnailContainer: {
    marginRight: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedThumbnail: {
    borderColor: theme.colors.primary[600],
  },
  thumbnail: {
    width: 60,
    height: 60,
    borderRadius: theme.borderRadius.sm,
  },
  infoContainer: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.xl,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.gray[200],
  },
  productName: {
    fontSize: theme.typography.sizes['2xl'],
    fontWeight: '700',
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.sm,
    lineHeight: 32,
  },
  brandCategoryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  brand: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.text.secondary,
    marginRight: theme.spacing.md,
    fontWeight: '600',
  },
  category: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.text.secondary,
    backgroundColor: theme.colors.gray[100],
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.sm,
  },
  priceRatingContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  price: {
    fontSize: theme.typography.sizes['3xl'],
    fontWeight: '700',
    color: theme.colors.primary[600],
  },
  originalPrice: {
    fontSize: theme.typography.sizes.lg,
    color: theme.colors.text.secondary,
    textDecorationLine: 'line-through',
    marginLeft: theme.spacing.md,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rating: {
    fontSize: theme.typography.sizes.base,
    color: theme.colors.text.primary,
    marginRight: theme.spacing.xs,
  },
  reviews: {
    fontSize: theme.typography.sizes.base,
    color: theme.colors.text.secondary,
  },
  description: {
    fontSize: theme.typography.sizes.base,
    color: theme.colors.text.primary,
    lineHeight: 24,
    marginBottom: theme.spacing.md,
  },
  stockContainer: {
    marginBottom: theme.spacing.lg,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    marginTop: theme.spacing.md,
  },
  inStock: {
    fontSize: theme.typography.sizes.base,
    fontWeight: '600',
    textAlign: 'center',
  },
  outOfStock: {
    fontSize: theme.typography.sizes.base,
    fontWeight: '600',
    textAlign: 'center',
  },
  sectionContainer: {
    backgroundColor: theme.colors.surface,
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.gray[200],
  },
  sectionTitle: {
    fontSize: theme.typography.sizes.lg,
    fontWeight: '700',
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.md,
  },
  specificationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.gray[100],
  },
  specificationKey: {
    fontSize: theme.typography.sizes.base,
    color: theme.colors.text.secondary,
    flex: 1,
  },
  specificationValue: {
    fontSize: theme.typography.sizes.base,
    color: theme.colors.text.primary,
    fontWeight: '600',
    flex: 1,
    textAlign: 'right',
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  tag: {
    backgroundColor: theme.colors.gray[100],
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.full,
    marginRight: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
  },
  tagText: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.text.primary,
    fontWeight: '500',
  },
  recommendedProducts: {
    paddingLeft: theme.spacing.xl,
  },
  recommendedProductCard: {
    width: 140,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.gray[200],
    borderRadius: theme.borderRadius.md,
    marginRight: theme.spacing.md,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  recommendedProductImage: {
    width: '100%',
    height: 100,
    resizeMode: 'cover',
  },
  recommendedProductInfo: {
    padding: theme.spacing.md,
  },
  recommendedProductName: {
    fontSize: theme.typography.sizes.sm,
    fontWeight: '600',
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs,
    height: 32,
  },
  recommendedProductPrice: {
    fontSize: theme.typography.sizes.base,
    fontWeight: '600',
    color: theme.colors.primary[600],
    marginBottom: theme.spacing.xs,
  },
  recommendedProductRating: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  recommendedProductRatingText: {
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.text.secondary,
  },
  cartSection: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.xl,
    borderTopWidth: 1,
    borderTopColor: theme.colors.gray[200],
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 8,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.lg,
  },
  quantityLabel: {
    fontSize: theme.typography.sizes.base,
    fontWeight: '600',
    color: theme.colors.text.primary,
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quantityButton: {
    backgroundColor: theme.colors.gray[100],
    borderRadius: theme.borderRadius.md,
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: theme.colors.gray[300],
  },
  quantityText: {
    fontSize: theme.typography.sizes.lg,
    fontWeight: '600',
    marginHorizontal: theme.spacing.lg,
    color: theme.colors.text.primary,
    minWidth: 24,
    textAlign: 'center',
  },
  cartControls: {
    gap: theme.spacing.md,
  },
  removeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.error[50],
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.error[200],
  },
  removeText: {
    fontSize: theme.typography.sizes.base,
    fontWeight: '600',
    color: theme.colors.error[600],
    marginLeft: theme.spacing.sm,
  },
}); 