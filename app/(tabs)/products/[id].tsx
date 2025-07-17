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
import { cartService } from '../../../src/services/cartService';
import { mapProductDtoToProduct, UpdateCartItemRequest } from '../../../src/types/api';
import { Product } from '../../../src/types';
import { RecommendationSection } from '../../../src/components/RecommendationSection';
import { DimensionSelector } from '../../../src/components/DimensionSelector';
import { DimensionVariantsManager } from '../../../src/components/DimensionVariantsManager';
import { formatPrice } from '../../../src/utils/currencyUtils';

const screenWidth = Dimensions.get('window').width;



export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { getProductById, getRecommendedProducts } = useProductStore();
  const { items, addItem, removeItem, updateQuantity, syncCart } = useCartStore();
  
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [indicatorsVisible, setIndicatorsVisible] = useState(true);
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [descriptionExpanded, setDescriptionExpanded] = useState(false);
  const [customLength, setCustomLength] = useState<number | null>(null);
  const [calculatedPrice, setCalculatedPrice] = useState<number | null>(null);
  const [cartUpdateTrigger, setCartUpdateTrigger] = useState(0);

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
  // For variable dimension products, check if any variant is in cart
  // For regular products, check if product is in cart
  const cartItems = items.filter(item => item.product.id === product?.id);
  const isInCart = cartItems.length > 0;
  const currentQuantity = cartItems.reduce((sum, item) => sum + item.quantity, 0);

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

  const handleDimensionChange = (length: number | null, price: number | null) => {
    setCustomLength(length);
    setCalculatedPrice(price);
  };



  const handleAddSingleItem = async (length: number, quantity: number) => {
    if (!product) return;
    
    try {
      for (let i = 0; i < quantity; i++) {
        await addItem(product, 1, length);
      }
      // Trigger cart update to refresh the dimension manager
      handleCartUpdate();
    } catch (error) {
      console.error('Failed to add item to cart:', error);
      throw error;
    }
  };

  // Get existing cart items for this product with custom dimensions
  const getExistingCartItems = () => {
    if (!product) return [];
    
    const productCartItems = items.filter(item => 
      item.product.id === product.id && item.customLength !== undefined
    );
    
    // Group by length and sum quantities
    const groupedItems = productCartItems.reduce((acc, item) => {
      const length = item.customLength!;
      const existing = acc.find(existing => existing.length === length);
      
      if (existing) {
        existing.quantity += item.quantity;
      } else {
        acc.push({
          length: length,
          quantity: item.quantity
        });
      }
      
      return acc;
    }, [] as Array<{ length: number; quantity: number }>);
    
    return groupedItems;
  };

  const handleCartUpdate = () => {
    setCartUpdateTrigger(prev => prev + 1);
  };

  const handleUpdateCartItem = async (length: number, newQuantity: number) => {
    if (!product) return;
    
    try {
      // Find the specific cart item with this product and custom length
      const targetItem = items.find(item => 
        item.product.id === product.id && 
        item.customLength === length
      );
      
      if (!targetItem) {
        throw new Error('Cart item not found');
      }
      
      if (newQuantity <= 0) {
        // Remove the item completely using cart item ID
        await cartService.removeCartItem(targetItem.id);
      } else {
        // Update the quantity using cart item ID
        const updateRequest: UpdateCartItemRequest = {
          quantity: newQuantity
        };
        await cartService.updateCartItem(targetItem.id, updateRequest);
      }
      
      // Sync cart state with backend
      await syncCart();
      
      // Trigger UI update
      handleCartUpdate();
      
    } catch (error) {
      console.error('Failed to update cart item:', error);
      throw error;
    }
  };

  const getUnitSymbol = (unit?: string): string => {
    switch (unit) {
      case 'FOOT': return 'ft';
      case 'METER': return 'm';
      case 'INCH': return 'in';
      case 'YARD': return 'yd';
      case 'CENTIMETER': return 'cm';
      case 'MILLIMETER': return 'mm';
      default: return 'unit';
    }
  };

  const handleAddToCart = () => {
    // For variable dimension products, check if custom length is required
    if (product.isVariableDimension && !customLength) {
      Alert.alert('Dimension Required', 'Please select a length for this product.');
      return;
    }

    addItem(product, 1, customLength || undefined);
    Alert.alert('Success', `Added ${product.name} to cart!`);
  };

  const handleIncrement = () => {
    if (product?.isVariableDimension) {
      // For variable dimension products, we can't simply increment
      // User should use the dimension selector to add specific variants
      Alert.alert('Use Dimension Selector', 'Please use the dimension selector to add specific sizes to your cart.');
      return;
    }
    updateQuantity(product.id, currentQuantity + 1);
  };

  const handleDecrement = () => {
    if (product?.isVariableDimension) {
      // For variable dimension products, we can't simply decrement
      Alert.alert('Use Cart Screen', 'Please go to the cart screen to modify individual dimension variants.');
      return;
    }
    if (currentQuantity > 0) {
      updateQuantity(product.id, currentQuantity - 1);
    }
  };

  const handleRemove = async () => {
    if (product?.isVariableDimension) {
      // For variable dimension products, remove all variants
      // We need to remove them one by one since each has the same product ID
      // The backend will handle removing the specific cart item
      for (const item of cartItems) {
        await removeItem(item.product.id);
      }
      Alert.alert('Removed', `All ${product.name} variants removed from cart!`);
    } else {
      await removeItem(product.id);
      Alert.alert('Removed', `${product.name} removed from cart!`);
    }
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



  // Handle loading state
  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingStateContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary[600]} />
          <Text style={styles.loadingStateText}>Loading product...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Handle error state
  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons name="warning-outline" size={48} color={theme.colors.error[600]} />
          <Text style={styles.errorText}>{error}</Text>
          <Button
            title="Try Again"
            onPress={() => {
              setError(null);
              setLoading(true);
            }}
            style={styles.retryButtonStyle}
          />
        </View>
      </SafeAreaView>
    );
  }

  // Handle missing product
  if (!product) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons name="cube-outline" size={48} color={theme.colors.text.secondary} />
          <Text style={styles.errorText}>Product not found</Text>
          <Button
            title="Go Back"
            onPress={() => router.back()}
            style={styles.retryButtonStyle}
          />
        </View>
      </SafeAreaView>
    );
  }

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

        {/* Product Information Card */}
        <View style={styles.cardContainer}>
          {/* Card Header */}
          <View style={styles.cardHeader}>
            <View style={styles.cardIconContainer}>
              <Ionicons name="information-circle-outline" size={20} color={theme.colors.primary[600]} />
            </View>
            <Text style={styles.cardTitle}>Product Information</Text>
          </View>

          {/* Product Summary */}
          <View style={styles.productSummary}>
            {/* Product Name */}
            <Text style={styles.productName}>{product.name}</Text>

            {/* Brand and Category Row */}
            <View style={styles.brandCategoryRow}>
              <View style={styles.brandBadge}>
                <Ionicons name="storefront-outline" size={14} color={theme.colors.text.inverse} />
                <Text style={styles.brandText}>{product.brand}</Text>
              </View>
              <View style={styles.categoryBadge}>
                <Ionicons name="folder-outline" size={14} color={theme.colors.primary[700]} />
                <Text style={styles.categoryText}>{product.category}</Text>
              </View>
            </View>

            {/* Price Section */}
            <View style={styles.priceSection}>
              <View style={styles.priceContainer}>
                <View style={styles.currentPriceRow}>
                  {product.isVariableDimension ? (
                    calculatedPrice ? (
                      <Text style={styles.price}>
                        {formatPrice(calculatedPrice)}
                      </Text>
                    ) : (
                      <View style={styles.variablePriceDisplay}>
                        <Text style={styles.price}>
                          {formatPrice(product.variableDimensionRate || 0)}
                        </Text>
                        <Text style={styles.priceUnit}>
                          per sq {getUnitSymbol(product.dimensionUnit)}
                        </Text>
                      </View>
                    )
                  ) : (
                    <Text style={styles.price}>
                      {formatPrice(product.price)}
                    </Text>
                  )}
                  {product.originalPrice && (product.originalPrice - product.price) > 0 && !product.isVariableDimension && (
                    <View style={styles.discountBadge}>
                      <Text style={styles.discountText}>
                        -{Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}%
                      </Text>
                    </View>
                  )}
                </View>
                {product.isVariableDimension ? (
                  calculatedPrice ? (
                    <View style={styles.originalPriceRow}>
                      <Text style={styles.originalPrice}>
                        Rate: {formatPrice(product.variableDimensionRate || 0)} per sq {getUnitSymbol(product.dimensionUnit)}
                      </Text>
                      <Text style={styles.savings}>
                        {product.fixedHeight} × {customLength} = {((product.fixedHeight || 0) * (customLength || 0)).toFixed(2)} sq {getUnitSymbol(product.dimensionUnit)}
                      </Text>
                    </View>
                  ) : (
                    <View style={styles.originalPriceRow}>
                      <Text style={styles.originalPrice}>
                        Fixed Height: {product.fixedHeight} {getUnitSymbol(product.dimensionUnit)}
                      </Text>
                      <Text style={styles.savings}>
                        Select length to calculate total
                      </Text>
                    </View>
                  )
                ) : (
                  product.originalPrice && (product.originalPrice - product.price) > 0 && (
                    <View style={styles.originalPriceRow}>
                      <Text style={styles.originalPrice}>Was {formatPrice(product.originalPrice)}</Text>
                      <Text style={styles.savings}>
                        You save {formatPrice(product.originalPrice - product.price)}
                      </Text>
                    </View>
                  )
                )}
              </View>
            </View>
          </View>

          {/* Dimension Variants Manager for Variable Dimension Products */}
          {product.isVariableDimension && (
                          <DimensionVariantsManager
                key={`dimension-manager-${cartUpdateTrigger}`}
                product={product}
                onAddSingleItem={handleAddSingleItem}
                existingCartItems={getExistingCartItems()}
                onUpdateCartItem={handleUpdateCartItem}
              />
          )}

          {/* Availability Section */}
          <View style={styles.availabilitySection}>
            <View style={styles.availabilityHeader}>
              <Ionicons 
                name={product.inStock ? "checkmark-circle" : "close-circle"} 
                size={20} 
                color={product.inStock ? theme.colors.success[600] : theme.colors.error[600]} 
              />
              <Text style={styles.availabilityLabel}>Availability</Text>
            </View>
            
            <View style={styles.availabilityContent}>
              <Text style={[
                styles.availabilityStatus,
                { color: product.inStock ? theme.colors.success[700] : theme.colors.error[700] }
              ]}>
                {product.inStock ? 'In Stock' : 'Out of Stock'}
              </Text>
              
              {product.inStock && (
                <Text style={styles.availabilityQuantity}>
                  {product.stockQuantity} units available
                </Text>
              )}
            </View>
          </View>

          {/* Description Divider */}
          <View style={styles.sectionDivider} />

          {/* Description Section */}
          <View style={styles.descriptionSection}>
            <View style={styles.descriptionHeader}>
              <View style={styles.descriptionTitleContainer}>
                <Ionicons name="document-text-outline" size={18} color={theme.colors.primary[600]} />
                <Text style={styles.descriptionTitle}>Description</Text>
              </View>
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
        </View>

        {/* Specifications Card */}
        {Object.keys(product.specifications).length > 0 && (
          <View style={styles.cardContainer}>
            <View style={styles.cardHeader}>
              <View style={styles.cardIconContainer}>
                <Ionicons name="list-outline" size={20} color={theme.colors.primary[600]} />
              </View>
              <Text style={styles.cardTitle}>Specifications</Text>
            </View>
            <View style={styles.cardContent}>
              {Object.entries(product.specifications).map(([key, value]) => (
                <View key={key} style={styles.specificationRow}>
                  <Text style={styles.specificationKey}>{key}:</Text>
                  <Text style={styles.specificationValue}>{String(value)}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Tags Card */}
        {product.tags.length > 0 && (
          <View style={styles.cardContainer}>
            <View style={styles.cardHeader}>
              <View style={styles.cardIconContainer}>
                <Ionicons name="pricetags-outline" size={20} color={theme.colors.primary[600]} />
              </View>
              <Text style={styles.cardTitle}>Tags</Text>
            </View>
            <View style={styles.cardContent}>
              <View style={styles.tags}>
                {product.tags.map((tag, index) => (
                  <View key={index} style={styles.tag}>
                    <Text style={styles.tagText}>{tag}</Text>
                  </View>
                ))}
              </View>
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

      {/* Add to Cart Section for Regular Products */}
      {product.inStock && !product.isVariableDimension && (
        <View style={styles.cartSection}>
          {!isInCart ? (
            <TouchableOpacity
              style={styles.addToCartButton}
              onPress={handleAddToCart}
              activeOpacity={0.8}
            >
              <Ionicons 
                name="cart-outline" 
                size={20} 
                color={theme.colors.background} 
              />
              <Text style={styles.addToCartText}>
                Add to Cart
              </Text>
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

      {/* Cart Summary for Variable Dimension Products */}
      {product.inStock && product.isVariableDimension && isInCart && (
        <View style={styles.cartSection}>
          <View style={styles.cartSummary}>
            <View style={styles.cartSummaryHeader}>
              <Ionicons name="cart" size={20} color={theme.colors.primary[600]} />
              <Text style={styles.cartSummaryTitle}>In Your Cart</Text>
            </View>
            <Text style={styles.cartSummaryText}>
              {cartItems.length} dimension variant{cartItems.length > 1 ? 's' : ''} • Total quantity: {currentQuantity}
            </Text>
            <View style={styles.cartSummaryActions}>
              <TouchableOpacity 
                style={styles.viewCartButton}
                onPress={() => router.push('/(tabs)/cart')}
              >
                <Ionicons name="eye-outline" size={16} color={theme.colors.primary[600]} />
                <Text style={styles.viewCartText}>View Cart</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.removeAllButton} onPress={handleRemove}>
                <Ionicons name="trash" size={16} color={theme.colors.error[600]} />
                <Text style={styles.removeAllText}>Remove All</Text>
              </TouchableOpacity>
            </View>
          </View>
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
    height: 250,
  },
  carousel: {
    height: 250,
    position: 'relative',
  },
  carouselSlide: {
    width: screenWidth,
    height: 250,
    justifyContent: 'center',
    alignItems: 'center',
  },
  carouselImage: {
    width: screenWidth,
    height: 250,
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
  sectionDivider: {
    height: 1,
    backgroundColor: theme.colors.gray[200],
    marginVertical: theme.spacing.lg,
  },
  availabilitySection: {
    backgroundColor: theme.colors.gray[50],
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    marginBottom: theme.spacing.md,
  },
  availabilityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.xs,
  },
  availabilityLabel: {
    fontSize: theme.typography.sizes.base,
    fontWeight: '600' as any,
    color: theme.colors.text.primary,
    marginLeft: theme.spacing.sm,
  },
  availabilityContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginLeft: theme.spacing.lg + theme.spacing.sm, // Align with label
  },
  availabilityStatus: {
    fontSize: theme.typography.sizes.base,
    fontWeight: '700' as any,
  },
  availabilityQuantity: {
    fontSize: theme.typography.sizes.sm,
    fontWeight: '500' as any,
    color: theme.colors.text.secondary,
  },
  descriptionSection: {
    marginTop: theme.spacing.xs,
  },
  descriptionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  descriptionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  descriptionTitle: {
    fontSize: theme.typography.sizes.base,
    fontWeight: '600' as any,
    color: theme.colors.text.primary,
    marginLeft: theme.spacing.sm,
  },
  productSummary: {
    backgroundColor: theme.colors.gray[50],
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.xl,
    marginBottom: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.gray[200],
  },
  productName: {
    fontSize: theme.typography.sizes['2xl'],
    fontWeight: '800' as any,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.md,
    lineHeight: theme.typography.lineHeights.tight * theme.typography.sizes['2xl'],
  },
  brandCategoryRow: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    marginBottom: theme.spacing.lg,
  },
  brandBadge: {
    backgroundColor: theme.colors.primary[600],
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.full,
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    ...theme.shadows.md,
    elevation: 3,
  },
  brandText: {
    fontSize: 12,
    fontWeight: '700' as any,
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
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    ...theme.shadows.sm,
  },
  categoryText: {
    fontSize: 12,
    color: theme.colors.primary[700],
    fontWeight: '700' as any,
    textTransform: 'capitalize',
  },
  priceSection: {
    marginTop: theme.spacing.sm,
  },
  priceContainer: {
    backgroundColor: theme.colors.background,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.colors.primary[200],
    ...theme.shadows.sm,
  },
  currentPriceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.xs,
  },
  currencySymbol: {
    fontSize: theme.typography.sizes.xl,
    fontWeight: '600' as any,
    color: theme.colors.text.primary,
    marginRight: 4,
  },
  price: {
    fontSize: theme.typography.sizes['3xl'],
    fontWeight: '800' as any,
    color: theme.colors.text.primary,
    marginRight: theme.spacing.md,
  },
  variablePriceDisplay: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginRight: theme.spacing.md,
  },
  priceUnit: {
    fontSize: theme.typography.sizes.lg,
    fontWeight: '600' as any,
    color: theme.colors.text.secondary,
    marginLeft: theme.spacing.sm,
  },
  discountBadge: {
    backgroundColor: theme.colors.error[600],
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.md,
    ...theme.shadows.md,
  },
  discountText: {
    fontSize: theme.typography.sizes.xs,
    fontWeight: '800' as any,
    color: theme.colors.text.inverse,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  originalPriceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: theme.spacing.xs,
    borderTopWidth: 1,
    borderTopColor: theme.colors.gray[200],
  },
  originalPrice: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.text.tertiary,
    textDecorationLine: 'line-through',
    fontWeight: '500' as any,
  },
  savings: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.success[700],
    fontWeight: '700' as any,
    backgroundColor: theme.colors.success[50],
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.success[200],
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
    marginTop: theme.spacing.xs,
  },
  readMoreText: {
    fontSize: theme.typography.sizes.sm,
    fontWeight: '600' as any,
    color: theme.colors.primary[700],
  },

  cardContainer: {
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius['2xl'],
    marginHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
    padding: theme.spacing.lg,
    ...theme.shadows.md,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  cardIconContainer: {
    width: 36,
    height: 36,
    borderRadius: theme.borderRadius.lg,
    backgroundColor: theme.colors.primary[50],
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.md,
  },
  cardTitle: {
    fontSize: theme.typography.sizes.lg,
    fontWeight: '700',
    color: theme.colors.text.primary,
    flex: 1,
  },
  cardContent: {
    marginTop: theme.spacing.xs,
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
    alignItems: 'center',
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.md,
    backgroundColor: theme.colors.gray[50],
    borderRadius: theme.borderRadius.lg,
    marginBottom: theme.spacing.xs,
  },
  specificationKey: {
    fontSize: theme.typography.sizes.base,
    color: theme.colors.text.secondary,
    flex: 1,
    fontWeight: '500' as any,
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
    gap: theme.spacing.xs,
  },
  tag: {
    backgroundColor: theme.colors.primary[100],
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.full,
    borderWidth: 1,
    borderColor: theme.colors.primary[200],
    ...theme.shadows.sm,
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
  addToCartButtonDisabled: {
    backgroundColor: theme.colors.gray[300],
    shadowOpacity: 0,
  },
  addToCartTextDisabled: {
    color: theme.colors.gray[500],
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
  cartSummary: {
    backgroundColor: theme.colors.primary[50],
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.colors.primary[200],
  },
  cartSummaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  cartSummaryTitle: {
    fontSize: theme.typography.sizes.base,
    fontWeight: '600',
    color: theme.colors.text.primary,
    marginLeft: theme.spacing.sm,
  },
  cartSummaryText: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.md,
  },
  cartSummaryActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  viewCartButton: {
    backgroundColor: theme.colors.primary[600],
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  viewCartText: {
    fontSize: theme.typography.sizes.sm,
    fontWeight: '600',
    color: theme.colors.text.inverse,
  },
  removeAllButton: {
    backgroundColor: theme.colors.error[50],
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.error[200],
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  removeAllText: {
    fontSize: theme.typography.sizes.sm,
    fontWeight: '600',
    color: theme.colors.error[600],
  },
  loadingStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.xl,
  },
  loadingStateText: {
    marginTop: theme.spacing.md,
    fontSize: theme.typography.sizes.base,
    color: theme.colors.text.secondary,
    textAlign: 'center',
  },
  retryButtonStyle: {
    marginTop: theme.spacing.lg,
    minWidth: 120,
  },
}); 