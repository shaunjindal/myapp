import { create } from 'zustand';
import { ProductState, ProductFilters, Product, Category } from '../types';
import { productService } from '../services/productService';
import { 
  ProductSearchRequest,
  mapProductDtoToProduct,
  mapCategoryDtoToCategory
} from '../types/api';

export const useProductStore = create<ProductState>((set, get) => ({
  products: [],
  categories: [],
  loading: false,
  error: null,
  filters: {},
  searchQuery: '',
  
  fetchProducts: async () => {
    console.log('🔄 ProductStore: Starting fetchProducts...');
    set({ loading: true, error: null });
    try {
      console.log('🔄 ProductStore: Calling productService.getAllProducts...');
      const response = await productService.getAllProducts({ page: 0, size: 100 });
      console.log('✅ ProductStore: Raw API response:', response);
      console.log('✅ ProductStore: Response content:', response.content);
      console.log('✅ ProductStore: Response content length:', response.content?.length || 0);
      
      // Check if response.content exists and is an array
      if (!response.content || !Array.isArray(response.content)) {
        console.error('❌ ProductStore: Invalid response format, content is not an array:', response);
        // Try to handle different response formats
        if (Array.isArray(response)) {
          console.log('✅ ProductStore: Response is directly an array, using it as products');
          const products = response.map(mapProductDtoToProduct);
          console.log('✅ ProductStore: Mapped products:', products);
          console.log('✅ ProductStore: Mapped products length:', products.length);
          set({ products, loading: false });
          return;
        } else {
          throw new Error('Invalid response format: content is not an array');
        }
      }
      
      // Backend returns { content: [...], page: 0, size: 10, totalElements: 3, totalPages: 1 }
      const products = response.content.map(mapProductDtoToProduct);
      console.log('✅ ProductStore: Mapped products:', products);
      console.log('✅ ProductStore: Mapped products length:', products.length);
      
      // Fetch categories using the optimized endpoint
      try {
        console.log('🔄 ProductStore: Fetching categories for filters...');
        const categoriesResponse = await productService.getCategoriesForFilters();
        console.log('✅ ProductStore: Categories response:', categoriesResponse);
        const categories = categoriesResponse.map(cat => ({
          id: cat.id,
          name: cat.name,
          description: '', // Not needed for filters
          image: '', // Not needed for filters
          productCount: cat.productCount,
          slug: cat.slug
        }));
        console.log('✅ ProductStore: Mapped categories:', categories);
        set({ products, categories, loading: false });
        console.log('✅ ProductStore: Store updated successfully');
      } catch (categoriesError) {
        console.warn('⚠️ ProductStore: Failed to fetch categories, using fallback:', categoriesError);
        // Extract unique categories from products as fallback
        const uniqueCategories = [...new Set(products.map(p => p.category))];
        const categories = uniqueCategories.map((categoryName, index) => ({
          id: `cat-${index + 1}`,
          name: categoryName,
          description: '',
          image: '',
          productCount: products.filter(p => p.category === categoryName).length,
          slug: categoryName.toLowerCase().replace(/\s+/g, '-')
        }));
        set({ products, categories, loading: false });
        console.log('✅ ProductStore: Store updated with fallback categories');
      }
    } catch (error: any) {
      console.error('❌ ProductStore: Failed to fetch products:', error);
      set({ error: error.message || 'Failed to fetch products', loading: false });
    }
  },
  
  setFilters: (filters: ProductFilters) => {
    set({ filters });
  },
  
  setSearchQuery: (query: string) => {
    set({ searchQuery: query });
  },
  
  getFilteredProducts: () => {
    const { products, filters, searchQuery } = get();
    let filteredProducts = [...products];
    
    console.log('🔍 ProductStore: Starting filtering with:', {
      totalProducts: products.length,
      filters,
      searchQuery,
      sampleProduct: products[0] // Show first product for debugging
    });
    
    // Apply search query
    if (searchQuery) {
      filteredProducts = filteredProducts.filter(product =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
      console.log('🔍 ProductStore: After search filter:', filteredProducts.length);
    }
    
    // Apply category filters (prioritize multiple categories over single category)
    if (filters.categories && filters.categories.length > 0) {
      console.log('🔍 ProductStore: Applying multiple categories filter (OR logic):', filters.categories);
      console.log('🔍 ProductStore: Available product categories:', [...new Set(products.map(p => p.category))]);
      
      // Convert category IDs to names for filtering
      const { categories } = get();
      const selectedCategoryNames = filters.categories.map(categoryId => {
        const category = categories.find(cat => cat.id === categoryId);
        return category ? category.name : categoryId; // fallback to ID if name not found
      });
      
      console.log('🔍 ProductStore: Converted category IDs to names:', {
        categoryIds: filters.categories,
        categoryNames: selectedCategoryNames
      });
      
      const beforeCount = filteredProducts.length;
      filteredProducts = filteredProducts.filter(product => {
        // OR logic: product belongs to ANY of the selected categories
        const match = selectedCategoryNames.includes(product.category);
        console.log('🔍 ProductStore: Category match check:', {
          productCategory: product.category,
          selectedCategoryNames,
          isMatch: match,
          productName: product.name
        });
        return match;
      });
      
      console.log('🔍 ProductStore: After multiple categories filter:', {
        before: beforeCount,
        after: filteredProducts.length,
        categoriesFilter: filters.categories,
        categoryNames: selectedCategoryNames,
        matchingProducts: filteredProducts.map(p => ({ name: p.name, category: p.category }))
      });
    } else if (filters.category) {
      console.log('🔍 ProductStore: Applying single category filter:', filters.category);
      console.log('🔍 ProductStore: Available product categories:', [...new Set(products.map(p => p.category))]);
      
      // Convert category ID to name for filtering
      const { categories } = get();
      const category = categories.find(cat => cat.id === filters.category);
      const categoryName = category ? category.name : filters.category; // fallback to ID if name not found
      
      console.log('🔍 ProductStore: Converted single category ID to name:', {
        categoryId: filters.category,
        categoryName
      });
      
      const beforeCount = filteredProducts.length;
      filteredProducts = filteredProducts.filter(product => {
        const match = product.category === categoryName;
        if (!match) {
          console.log('🔍 ProductStore: Product category mismatch:', {
            productCategory: product.category,
            filterCategoryName: categoryName,
            productName: product.name
          });
        }
        return match;
      });
      
      console.log('🔍 ProductStore: After single category filter:', {
        before: beforeCount,
        after: filteredProducts.length,
        categoryFilter: filters.category,
        categoryName: categoryName
      });
    }
    
    if (filters.minPrice !== undefined) {
      filteredProducts = filteredProducts.filter(product => 
        product.price >= filters.minPrice!
      );
      console.log('🔍 ProductStore: After minPrice filter:', filteredProducts.length);
    }
    
    if (filters.maxPrice !== undefined) {
      filteredProducts = filteredProducts.filter(product => 
        product.price <= filters.maxPrice!
      );
      console.log('🔍 ProductStore: After maxPrice filter:', filteredProducts.length);
    }
    
    if (filters.rating !== undefined) {
      filteredProducts = filteredProducts.filter(product => 
        product.rating >= filters.rating!
      );
      console.log('🔍 ProductStore: After rating filter:', filteredProducts.length);
    }
    
    if (filters.inStock !== undefined) {
      filteredProducts = filteredProducts.filter(product => 
        product.inStock === filters.inStock
      );
      console.log('🔍 ProductStore: After stock filter:', filteredProducts.length);
    }
    
    if (filters.brand) {
      filteredProducts = filteredProducts.filter(product => 
        product.brand === filters.brand
      );
      console.log('🔍 ProductStore: After brand filter:', filteredProducts.length);
    }
    
    // Apply sorting
    if (filters.sortBy) {
      filteredProducts.sort((a, b) => {
        const order = filters.sortOrder === 'desc' ? -1 : 1;
        
        switch (filters.sortBy) {
          case 'name':
            return a.name.localeCompare(b.name) * order;
          case 'price':
            return (a.price - b.price) * order;
          case 'rating':
            return (a.rating - b.rating) * order;
          case 'newest':
            return (Date.now() - Date.now()) * order; // Mock sorting by newest
          default:
            return 0;
        }
      });
    }
    
    console.log('🔍 ProductStore: Final filtered products:', {
      count: filteredProducts.length,
      products: filteredProducts.map(p => ({ name: p.name, category: p.category }))
    });
    
    return filteredProducts;
  },
  
  getProductById: (id: string) => {
    const { products } = get();
    return products.find(product => product.id === id);
  },

  getRecommendedProducts: (currentProductId: string, limit: number = 6) => {
    const { products } = get();
    const currentProduct = products.find(p => p.id === currentProductId);
    
    if (!currentProduct) return [];
    
    // Get products from the same category, excluding current product
    let recommended = products.filter(product => 
      product.id !== currentProductId && 
      product.inStock && 
      product.category === currentProduct.category
    );
    
    // If not enough products in same category, add products from other categories
    if (recommended.length < limit) {
      const otherProducts = products.filter(product => 
        product.id !== currentProductId && 
        product.inStock && 
        product.category !== currentProduct.category
      );
      recommended = [...recommended, ...otherProducts];
    }
    
    // Sort by rating and price similarity
    recommended.sort((a, b) => {
      const ratingDiff = Math.abs(a.rating - currentProduct.rating) - Math.abs(b.rating - currentProduct.rating);
      const priceDiff = Math.abs(a.price - currentProduct.price) - Math.abs(b.price - currentProduct.price);
      return ratingDiff + (priceDiff * 0.001); // Weight rating more than price
    });
    
    return recommended.slice(0, limit);
  },
})); 