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
import { recommendationService } from '../../../src/services/recommendationService';
import { mapProductDtoToProduct } from '../../../src/types/api';
import { Product } from '../../../src/types';
import { RecommendationSection } from '../../../src/components/RecommendationSection';

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
  const [descriptionExpanded, setDescriptionExpanded] = useState(false);
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
          {/* Brand and Category Row */}
          <View style={styles.brandCategoryRow}>
            <View style={styles.brandBadge}>
              <Text style={styles.brandText}>{product.brand}</Text>
            </View>
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryText}>{product.category}</Text>
            </View>
          </View>

          {/* Product Name */}
          <Text style={styles.productName}>{product.name}</Text>

          {/* Rating and Reviews */}
          <View style={styles.ratingSection}>
            <View style={styles.starsContainer}>
              <Text style={styles.stars}>{'★'.repeat(Math.floor(product.rating)) + '☆'.repeat(5 - Math.floor(product.rating))}</Text>
              <Text style={styles.ratingValue}>{product.rating}</Text>
            </View>
            <Text style={styles.reviewCount}>({product.reviewCount} reviews)</Text>
          </View>

          {/* Price Section */}
          <View style={styles.priceSection}>
            <View style={styles.currentPriceContainer}>
              <Text style={styles.currencySymbol}>$</Text>
              <Text style={styles.price}>{product.price}</Text>
            </View>
            {product.originalPrice && (product.originalPrice - product.price) > 0 && (
              <View style={styles.originalPriceContainer}>
                <Text style={styles.originalPrice}>${product.originalPrice}</Text>
                <Text style={styles.savings}>
                  Save ${(product.originalPrice - product.price).toFixed(2)}
                </Text>
              </View>
            )}
          </View>

          {/* Description Section */}
          <View style={styles.descriptionSection}>
            <View style={styles.descriptionHeader}>
              <Text style={styles.descriptionTitle}>Description</Text>
              <TouchableOpacity 
                style={styles.expandButton}
                onPress={() => setDescriptionExpanded(!descriptionExpanded)}
                activeOpacity={0.7}
              >
                <Ionicons 
                  name={descriptionExpanded ? "chevron-up" : "chevron-down"} 
                  size={20} 
                  color={theme.colors.primary[600]} 
                />
              </TouchableOpacity>
            </View>
            
            <Text 
              style={styles.description}
              numberOfLines={descriptionExpanded ? undefined : 3}
            >
              {product.description}
            </Text>
            
            {product.description.length > 150 && !descriptionExpanded && (
              <TouchableOpacity 
                style={styles.readMoreButton}
                onPress={() => setDescriptionExpanded(true)}
                activeOpacity={0.7}
              >
                <Text style={styles.readMoreText}>Read more</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Stock Status */}
          <View style={styles.stockSection}>
            <View style={styles.stockHeader}>
              <Text style={styles.stockLabel}>Availability</Text>
              <View style={[
                styles.stockStatusDot,
                { backgroundColor: product.inStock ? theme.colors.success[500] : theme.colors.error[500] }
              ]} />
            </View>
            
            <View style={styles.stockContent}>
              <Text style={[
                styles.stockStatus,
                { color: product.inStock ? theme.colors.success[700] : theme.colors.error[700] }
              ]}>
                {product.inStock ? 'In Stock' : 'Out of Stock'}
              </Text>
              
              {product.inStock && (
                <Text style={styles.stockQuantity}>
                  {product.stockQuantity} units available
                </Text>
              )}
            </View>
          </View>

        </View>

        {/* Specifications */}
        {Object.keys(product.specifications).length > 0 && (
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Specifications</Text>
            {Object.entries(product.specifications).map(([key, value]) => (
              <View key={key} style={styles.specificationRow}>
                <Text style={styles.specificationKey}>{key}:</Text>
                <Text style={styles.specificationValue}>{String(value)}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Tags */}
        {product.tags.length > 0 && (
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
        )}

        {/* Recommended Products */}
        <RecommendationSection
          productId={product.id}
          title="You might also like"
          limit={6}
        />
      </ScrollView>

      {/* Add to Cart Section */}
      {product.inStock && (
        <View style={styles.cartSection}>
          {!isInCart ? (
            <TouchableOpacity
              style={styles.addToCartButton}
              onPress={handleAddToCart}
              activeOpacity={0.8}
            >
              <Ionicons name="cart-outline" size={20} color={theme.colors.background} />
              <Text style={styles.addToCartText}>Add to Cart</Text>
            </TouchableOpacity>
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
    fontSize: theme.typography.sizes.xl,
    fontWeight: '700',
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.sm,
    lineHeight: theme.typography.lineHeights.tight * theme.typography.sizes.xl,
  },
  brandCategoryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  brandBadge: {
    backgroundColor: theme.colors.primary[600],
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.full,
    ...theme.shadows.md,
    elevation: 3,
  },
  brandText: {
    fontSize: 12,
    fontWeight: '800' as any,
    color: theme.colors.text.inverse,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  categoryBadge: {
    backgroundColor: theme.colors.background,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.full,
    borderWidth: 1.5,
    borderColor: theme.colors.primary[200],
    ...theme.shadows.sm,
  },
  categoryText: {
    fontSize: 12,
    color: theme.colors.primary[700],
    fontWeight: '700' as any,
    textTransform: 'capitalize',
  },
  ratingSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
  },
  starsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.warning[50],
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.warning[200],
  },
  stars: {
    fontSize: theme.typography.sizes.base,
    color: theme.colors.warning[500],
    marginRight: theme.spacing.sm,
  },
  ratingValue: {
    fontSize: theme.typography.sizes.base,
    fontWeight: '700' as any,
    color: theme.colors.warning[700],
  },
  reviewCount: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.text.secondary,
    fontWeight: '500' as any,
    fontStyle: 'italic',
  },
  priceSection: {
    marginBottom: theme.spacing.lg,
  },
  currentPriceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: theme.spacing.sm,
  },
  currencySymbol: {
    fontSize: theme.typography.sizes.xl,
    fontWeight: '600' as any,
    color: theme.colors.text.primary,
    marginRight: 4,
  },
  price: {
    fontSize: theme.typography.sizes['2xl'],
    fontWeight: '800' as any,
    color: theme.colors.text.primary,
  },
  originalPriceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  originalPrice: {
    fontSize: theme.typography.sizes.base,
    color: theme.colors.text.tertiary,
    textDecorationLine: 'line-through',
    fontWeight: '500' as any,
  },
  savings: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.success[700],
    fontWeight: '600' as any,
    backgroundColor: theme.colors.success[50],
    paddingHorizontal: theme.spacing.xs,
    paddingVertical: 2,
    borderRadius: theme.borderRadius.sm,
  },
  descriptionSection: {
    marginBottom: theme.spacing.lg,
  },
  descriptionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  descriptionTitle: {
    fontSize: theme.typography.sizes.base,
    fontWeight: '700' as any,
    color: theme.colors.text.primary,
    textTransform: 'uppercase',
    letterSpacing: theme.typography.letterSpacing.wide,
  },
  expandButton: {
    padding: theme.spacing.xs,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.primary[50],
  },
  description: {
    fontSize: theme.typography.sizes.base,
    color: theme.colors.text.primary,
    lineHeight: theme.typography.lineHeights.relaxed * theme.typography.sizes.base,
    marginBottom: theme.spacing.sm,
  },
  readMoreButton: {
    alignSelf: 'flex-start',
    paddingVertical: theme.spacing.xs,
    paddingHorizontal: theme.spacing.sm,
    backgroundColor: theme.colors.primary[50],
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.primary[200],
  },
  readMoreText: {
    fontSize: theme.typography.sizes.sm,
    fontWeight: '600' as any,
    color: theme.colors.primary[700],
  },
  stockSection: {
    marginBottom: theme.spacing.lg,
    marginTop: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderTopColor: theme.colors.gray[200],
    borderBottomColor: theme.colors.gray[200],
  },
  stockHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.xs,
  },
  stockLabel: {
    fontSize: theme.typography.sizes.base,
    fontWeight: '600' as any,
    color: theme.colors.text.secondary,
    textTransform: 'uppercase',
    letterSpacing: theme.typography.letterSpacing.wide,
  },
  stockStatusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginLeft: theme.spacing.sm,
  },
  stockContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  stockStatus: {
    fontSize: theme.typography.sizes.base,
    fontWeight: '700' as any,
  },
  stockQuantity: {
    fontSize: theme.typography.sizes.base,
    fontWeight: '500' as any,
    color: theme.colors.text.secondary,
  },
  sectionContainer: {
    backgroundColor: theme.colors.surface,
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.gray[200],
  },
  sectionTitle: {
    fontSize: theme.typography.sizes.xl,
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
    backgroundColor: theme.colors.primary[100],
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.full,
    marginRight: theme.spacing.xs,
    marginBottom: theme.spacing.xs,
  },
  tagText: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.primary[700],
    fontWeight: '600' as any,
  },
  recommendedProducts: {
    paddingLeft: theme.spacing.xl,
  },
  recommendedProductCard: {
    width: 160,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius['2xl'],
    marginRight: theme.spacing.md,
    overflow: 'hidden',
    ...theme.shadows.md,
  },
  recommendedImageContainer: {
    position: 'relative',
    width: '100%',
    height: 120,
    overflow: 'hidden',
    borderTopLeftRadius: theme.borderRadius['2xl'],
    borderTopRightRadius: theme.borderRadius['2xl'],
  },
  recommendedProductImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  recommendedDiscountBadge: {
    position: 'absolute',
    top: theme.spacing.xs,
    right: theme.spacing.xs,
    backgroundColor: theme.colors.error[600],
    paddingHorizontal: theme.spacing.xs,
    paddingVertical: 2,
    borderRadius: theme.borderRadius.sm,
    ...theme.shadows.sm,
  },
  recommendedDiscountText: {
    color: theme.colors.text.inverse,
    fontSize: theme.typography.sizes.sm,
    fontWeight: '700' as any,
    textTransform: 'uppercase',
  },
  recommendedProductInfo: {
    padding: theme.spacing.md,
  },
  recommendedBrandCategoryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.xs,
  },
  recommendedBrandBadge: {
    backgroundColor: theme.colors.primary[600],
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.full,
    marginBottom: theme.spacing.xs,
    alignSelf: 'flex-start',
    ...theme.shadows.sm,
    elevation: 2,
  },
  recommendedCategoryBadge: {
    backgroundColor: theme.colors.background,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.full,
    borderWidth: 1,
    borderColor: theme.colors.primary[200],
    ...theme.shadows.sm,
  },
  recommendedCategoryText: {
    fontSize: 9,
    color: theme.colors.primary[700],
    fontWeight: '700' as any,
    textTransform: 'capitalize',
  },
  recommendedBrandText: {
    fontSize: 10,
    fontWeight: '800' as any,
    color: theme.colors.text.inverse,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  recommendedProductName: {
    fontSize: theme.typography.sizes.sm,
    fontWeight: '700' as any,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs,
    lineHeight: theme.typography.lineHeights.tight * theme.typography.sizes.sm,
  },
  recommendedRatingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.warning[50],
    paddingHorizontal: theme.spacing.xs,
    paddingVertical: 2,
    borderRadius: theme.borderRadius.sm,
    marginBottom: theme.spacing.xs,
    alignSelf: 'flex-start',
  },
  recommendedStars: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.warning[500],
    marginRight: 2,
  },
  recommendedRatingValue: {
    fontSize: theme.typography.sizes.sm,
    fontWeight: '700' as any,
    color: theme.colors.warning[700],
  },
  recommendedPriceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  recommendedPrice: {
    fontSize: theme.typography.sizes.base,
    fontWeight: '800' as any,
    color: theme.colors.text.primary,
  },
  recommendedOriginalPrice: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.text.tertiary,
    textDecorationLine: 'line-through',
    fontWeight: '500' as any,
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
  addToCartButton: {
    backgroundColor: theme.colors.primary[600],
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.lg,
    paddingHorizontal: theme.spacing.xl,
    borderRadius: theme.borderRadius.lg,
    ...theme.shadows.md,
  },
  addToCartText: {
    color: theme.colors.background,
    fontSize: theme.typography.sizes.base,
    fontWeight: '600' as any,
    marginLeft: theme.spacing.sm,
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
  recommendationsLoadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.xl,
  },
  recommendationsLoadingText: {
    fontSize: theme.typography.sizes.base,
    color: theme.colors.text.secondary,
    marginLeft: theme.spacing.md,
  },
  noRecommendationsContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.xl,
  },
  noRecommendationsText: {
    fontSize: theme.typography.sizes.base,
    color: theme.colors.text.secondary,
    fontStyle: 'italic',
  },
}); 