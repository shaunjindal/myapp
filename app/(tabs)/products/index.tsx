import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  TextInput,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useProductStore } from '../../../src/store/productStore';
import { ProductCard } from '../../../src/components/ProductCard';
import { BackButtonHeader } from '../../../src/components/BackButtonHeader';
import { CategoryBottomSheet } from '../../../src/components/CategoryBottomSheet';
import { theme } from '../../../src/styles/theme';
import { Ionicons } from '@expo/vector-icons';

export default function ProductsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const {
    getFilteredProducts,
    categories,
    searchQuery,
    setSearchQuery,
    filters,
    setFilters,
    fetchProducts,
    loading,
    error,
    products,
  } = useProductStore();

  const [localSearchQuery, setLocalSearchQuery] = useState(searchQuery);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [isCategoryBottomSheetVisible, setIsCategoryBottomSheetVisible] = useState(false);

  // Fetch products on mount and restore any existing filters
  useEffect(() => {
    console.log('🛍️ ProductsScreen: Component mounted, calling fetchProducts...');
    console.log('🛍️ ProductsScreen: Initial loading state:', loading);
    console.log('🛍️ ProductsScreen: Initial products length:', products.length);
    console.log('🛍️ ProductsScreen: Existing filters on mount:', filters);
    
    // Restore UI state from existing store filters (important for login/logout persistence)
    if (filters.categories && filters.categories.length > 0) {
      console.log('🛍️ ProductsScreen: Restoring selectedCategories from existing filters:', filters.categories);
      setSelectedCategories(filters.categories);
    }
    
    // Only fetch if we don't have products yet
    if (products.length === 0) {
      fetchProducts();
    } else {
      setIsInitialLoad(false);
    }
  }, []);

  // Debug logging for state changes
  useEffect(() => {
    console.log('🛍️ ProductsScreen: Loading state changed to:', loading);
    console.log('🛍️ ProductsScreen: Products length:', products.length);
    console.log('🛍️ ProductsScreen: Categories length:', categories.length);
    console.log('🛍️ ProductsScreen: Categories:', categories);
    console.log('🛍️ ProductsScreen: Selected categories:', selectedCategories);
    console.log('🛍️ ProductsScreen: Filters:', filters);
    console.log('🛍️ ProductsScreen: Error state:', error);
    console.log('🛍️ ProductsScreen: Initial load state:', isInitialLoad);
  }, [loading, products, categories, selectedCategories, filters, error, isInitialLoad]);

  // Update initial load state when products are loaded
  useEffect(() => {
    if (products.length > 0 && isInitialLoad) {
      setIsInitialLoad(false);
    }
  }, [products.length, isInitialLoad]);

  // Sync local UI state with store state (important for login/logout cycles)
  useEffect(() => {
    console.log('🛍️ ProductsScreen: Syncing UI state with store state');
    console.log('🛍️ ProductsScreen: Store filters:', filters);
    console.log('🛍️ ProductsScreen: Current selectedCategories:', selectedCategories);
    
    if (filters.categories && filters.categories.length > 0) {
      // Sync selectedCategories with store filters
      if (JSON.stringify(selectedCategories.sort()) !== JSON.stringify(filters.categories.sort())) {
        console.log('🛍️ ProductsScreen: Syncing selectedCategories with store filters:', filters.categories);
        setSelectedCategories(filters.categories);
      }
    } else if (selectedCategories.length > 0) {
      // If store has no filters but UI shows selected categories, clear UI
      console.log('🛍️ ProductsScreen: Clearing selectedCategories as store has no filters');
      setSelectedCategories([]);
    }
  }, [filters.categories]);

  useEffect(() => {
    if (params.category && categories.length > 0) {
      console.log('🛍️ ProductsScreen: Setting category from params:', params.category);
      console.log('🛍️ ProductsScreen: Available categories when setting filter:', categories.map(c => ({ id: c.id, name: c.name })));
      setSelectedCategories([params.category as string]);
      setFilters({ ...filters, categories: [params.category as string] });
    }
    
    // Auto-open category bottom sheet if requested from home screen
    if (params.openCategorySheet === 'true') {
      setIsCategoryBottomSheetVisible(true);
    }
  }, [params.category, params.openCategorySheet, categories]);

  const handleSearch = () => {
    setSearchQuery(localSearchQuery);
  };

  const handleCategorySelect = (newCategories: string[]) => {
    console.log('🛍️ ProductsScreen: handleCategorySelect called with:', newCategories);
    console.log('🛍️ ProductsScreen: Current selectedCategories:', selectedCategories);
    console.log('🛍️ ProductsScreen: Available categories:', categories.map(c => ({ id: c.id, name: c.name })));
    console.log('🛍️ ProductsScreen: Current filters before update:', filters);
    
    if (newCategories.length > 0) {
      console.log('🛍️ ProductsScreen: Setting categories filter to:', newCategories);
      setSelectedCategories(newCategories);
      setFilters({ ...filters, categories: newCategories });
    } else {
      console.log('🛍️ ProductsScreen: Clearing categories filter');
      setSelectedCategories([]);
      const { categories: _, ...restFilters } = filters;
      setFilters(restFilters);
    }
  };

  const handleOpenCategoryBottomSheet = () => {
    setIsCategoryBottomSheetVisible(true);
  };

  const handleCloseCategoryBottomSheet = () => {
    setIsCategoryBottomSheetVisible(false);
  };

  // Helper function to get category name from ID
  const getCategoryName = (categoryId: string): string => {
    const category = categories.find(cat => cat.id === categoryId);
    const categoryName = category ? category.name : categoryId;
    console.log('🛍️ ProductsScreen: getCategoryName called:', {
      categoryId,
      foundCategory: category,
      categoryName,
      availableCategories: categories.map(c => ({ id: c.id, name: c.name }))
    });
    return categoryName;
  };

  // Helper function to get all selected category names
  const getSelectedCategoryNames = (): string[] => {
    return selectedCategories.map(getCategoryName);
  };

  const filteredProducts = getFilteredProducts();
  
  // Debug filtered products
  useEffect(() => {
    console.log('🛍️ ProductsScreen: Filtered products updated:', {
      count: filteredProducts.length,
      selectedCategories,
      filters,
      sampleProducts: filteredProducts.slice(0, 3).map(p => ({ name: p.name, category: p.category }))
    });
  }, [filteredProducts, selectedCategories, filters]);

  // Show loading state for initial load
  if (isInitialLoad && (loading || products.length === 0)) {
    return (
      <SafeAreaView style={styles.container}>
        <BackButtonHeader title="Products" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary[600]} />
          <Text style={styles.loadingText}>Loading products...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Show error state
  if (error && products.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <BackButtonHeader title="Products" />
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={64} color={theme.colors.error[500]} />
          <Text style={styles.errorText}>Failed to load products</Text>
          <Text style={styles.errorSubtext}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => {
            setIsInitialLoad(true);
            fetchProducts();
          }}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <BackButtonHeader title="Products" />
      <View style={styles.searchSection}>
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search products..."
            value={localSearchQuery}
            onChangeText={setLocalSearchQuery}
            onSubmitEditing={handleSearch}
          />
          <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
            <Ionicons name="search" size={20} color="#2563eb" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.scrollView}>
        {/* Category Filter Button */}
        <View style={styles.filterSection}>
          <View style={styles.filterHeader}>
            <Text style={styles.filterTitle}>Categories</Text>
            <TouchableOpacity
              style={styles.categoryButton}
              onPress={handleOpenCategoryBottomSheet}
            >
              <Ionicons name="options" size={20} color={theme.colors.primary[600]} />
              <Text style={styles.categoryButtonText}>
                {selectedCategories.length > 0 
                  ? selectedCategories.length === 1 
                    ? getCategoryName(selectedCategories[0]) 
                    : `${selectedCategories.length} Categories`
                  : 'All Categories'}
              </Text>
              <Ionicons name="chevron-down" size={16} color={theme.colors.gray[600]} />
            </TouchableOpacity>
          </View>
          
          {/* Selected Categories Info */}
          {selectedCategories.length > 0 && (
            <View style={styles.selectedCategoryInfo}>
              {selectedCategories.map((categoryId, index) => (
                <View key={index} style={styles.selectedCategoryBadge}>
                  <Text style={styles.selectedCategoryText}>{getCategoryName(categoryId)}</Text>
                  <TouchableOpacity
                    onPress={() => handleCategorySelect(selectedCategories.filter(c => c !== categoryId))}
                    style={styles.clearCategoryButton}
                  >
                    <Ionicons name="close" size={14} color={theme.colors.primary[600]} />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Products */}
        <View style={styles.productsSection}>
          <Text style={styles.resultsText}>
            {filteredProducts.length} products found
          </Text>
          <View style={styles.productsContainer}>
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onPress={() => router.push(`/(tabs)/products/${product.id}`)}
              />
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Category Bottom Sheet */}
      <CategoryBottomSheet
        isVisible={isCategoryBottomSheetVisible}
        onClose={handleCloseCategoryBottomSheet}
        categories={categories}
        selectedCategories={selectedCategories}
        onCategorySelect={handleCategorySelect}
        loading={loading}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    backgroundColor: '#ffffff',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  searchSection: {
    backgroundColor: '#ffffff',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#374151',
    marginBottom: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchInput: {
    flex: 1,
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    marginRight: 12,
  },
  searchButton: {
    backgroundColor: '#e5e7eb',
    padding: 12,
    borderRadius: 8,
  },
  scrollView: {
    flex: 1,
  },
  filterSection: {
    backgroundColor: '#ffffff',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  filterHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  filterTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.gray[100],
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.gray[200],
  },
  categoryButtonText: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.text.primary,
    fontWeight: '600',
    marginLeft: theme.spacing.sm,
    marginRight: theme.spacing.sm,
  },
  selectedCategoryInfo: {
    marginTop: theme.spacing.md,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  selectedCategoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.primary[50],
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.full,
    borderWidth: 1,
    borderColor: theme.colors.primary[200],
    alignSelf: 'flex-start',
  },
  selectedCategoryText: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.primary[700],
    fontWeight: '600',
    marginRight: theme.spacing.sm,
  },
  clearCategoryButton: {
    backgroundColor: theme.colors.primary[100],
    borderRadius: theme.borderRadius.full,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterButton: {
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
  },
  filterButtonActive: {
    backgroundColor: '#2563eb',
  },
  filterButtonText: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '600',
  },
  filterButtonTextActive: {
    color: '#ffffff',
  },
  productsSection: {
    padding: 20,
  },
  resultsText: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.xl,
  },
  loadingText: {
    fontSize: theme.typography.sizes.lg,
    color: theme.colors.text.secondary,
    marginTop: theme.spacing.lg,
    textAlign: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.xl,
  },
  errorText: {
    fontSize: theme.typography.sizes.xl,
    color: theme.colors.error[600],
    marginTop: theme.spacing.lg,
    textAlign: 'center',
    fontWeight: '600',
  },
  errorSubtext: {
    fontSize: theme.typography.sizes.base,
    color: theme.colors.text.secondary,
    marginTop: theme.spacing.sm,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: theme.colors.primary[600],
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    marginTop: theme.spacing.xl,
  },
  retryButtonText: {
    color: theme.colors.text.inverse,
    fontSize: theme.typography.sizes.base,
    fontWeight: '600',
  },
  productsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    gap: theme.spacing.sm,
  },
}); 