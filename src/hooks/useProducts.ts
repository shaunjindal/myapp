import { useCallback } from 'react';
import { useApi, usePaginatedApi, useDebouncedApi, useCachedApi } from './useApi';
import { productService } from '../services/productService';
import { 
  ProductDto, 
  CategoryDto, 
  ProductSearchRequest, 
  ProductSearchResponse 
} from '../types/api';

// Product hooks
export const useProducts = (pageSize: number = 20, options?: { immediate?: boolean }) => {
  return usePaginatedApi<ProductDto>(
    async (page, size) => {
      const response = await productService.getAllProducts({ page, size });
      return {
        content: response.products,
        totalPages: response.totalPages,
        currentPage: response.currentPage,
        hasNext: response.hasNext,
      };
    },
    pageSize,
    {
      immediate: options?.immediate ?? true,
      onError: (error) => {
        console.error('Failed to fetch products:', error);
      },
    }
  );
};

export const useProduct = (productId: string, options?: { immediate?: boolean }) => {
  return useCachedApi<ProductDto>(
    () => productService.getProductById(productId),
    `product-${productId}`,
    5 * 60 * 1000, // Cache for 5 minutes
    {
      immediate: options?.immediate ?? true,
      onError: (error) => {
        console.error('Failed to fetch product:', error);
      },
    }
  );
};

export const useProductSearch = (searchRequest: ProductSearchRequest, options?: { immediate?: boolean }) => {
  return useApi<ProductSearchResponse>(
    () => productService.searchProducts(searchRequest),
    {
      immediate: options?.immediate ?? false,
      onError: (error) => {
        console.error('Failed to search products:', error);
      },
    }
  );
};

export const useDebouncedProductSearch = (delay: number = 300) => {
  return useDebouncedApi<ProductSearchResponse>(
    async (query: string) => {
      return await productService.searchProducts({ query });
    },
    delay,
    {
      onError: (error) => {
        console.error('Failed to search products:', error);
      },
    }
  );
};

export const useProductsByCategory = (categoryId: string, pageSize: number = 20, options?: { immediate?: boolean }) => {
  return usePaginatedApi<ProductDto>(
    async (page, size) => {
      const response = await productService.getProductsByCategory(categoryId, { page, size });
      return {
        content: response.products,
        totalPages: response.totalPages,
        currentPage: response.currentPage,
        hasNext: response.hasNext,
      };
    },
    pageSize,
    {
      immediate: options?.immediate ?? true,
      onError: (error) => {
        console.error('Failed to fetch products by category:', error);
      },
    }
  );
};

export const useRecommendedProducts = (productId: string, limit: number = 6, options?: { immediate?: boolean }) => {
  return useCachedApi<ProductDto[]>(
    () => productService.getRecommendedProducts(productId, limit),
    `recommendations-${productId}-${limit}`,
    10 * 60 * 1000, // Cache for 10 minutes
    {
      immediate: options?.immediate ?? true,
      onError: (error) => {
        console.error('Failed to fetch recommended products:', error);
      },
    }
  );
};

export const useFeaturedProducts = (limit: number = 10, options?: { immediate?: boolean }) => {
  return useCachedApi<ProductDto[]>(
    () => productService.getFeaturedProducts(limit),
    `featured-products-${limit}`,
    15 * 60 * 1000, // Cache for 15 minutes
    {
      immediate: options?.immediate ?? true,
      onError: (error) => {
        console.error('Failed to fetch featured products:', error);
      },
    }
  );
};

export const useTopRatedProducts = (limit: number = 10, options?: { immediate?: boolean }) => {
  return useCachedApi<ProductDto[]>(
    () => productService.getTopRatedProducts(limit),
    `top-rated-products-${limit}`,
    15 * 60 * 1000, // Cache for 15 minutes
    {
      immediate: options?.immediate ?? true,
      onError: (error) => {
        console.error('Failed to fetch top rated products:', error);
      },
    }
  );
};

export const useNewestProducts = (limit: number = 10, options?: { immediate?: boolean }) => {
  return useCachedApi<ProductDto[]>(
    () => productService.getNewestProducts(limit),
    `newest-products-${limit}`,
    10 * 60 * 1000, // Cache for 10 minutes
    {
      immediate: options?.immediate ?? true,
      onError: (error) => {
        console.error('Failed to fetch newest products:', error);
      },
    }
  );
};

export const useProductsByBrand = (brand: string, pageSize: number = 20, options?: { immediate?: boolean }) => {
  return usePaginatedApi<ProductDto>(
    async (page, size) => {
      const response = await productService.getProductsByBrand(brand, { page, size });
      return {
        content: response.products,
        totalPages: response.totalPages,
        currentPage: response.currentPage,
        hasNext: response.hasNext,
      };
    },
    pageSize,
    {
      immediate: options?.immediate ?? true,
      onError: (error) => {
        console.error('Failed to fetch products by brand:', error);
      },
    }
  );
};

// Category hooks
export const useCategories = (options?: { immediate?: boolean }) => {
  return useCachedApi<CategoryDto[]>(
    () => productService.getAllCategories(),
    'all-categories',
    30 * 60 * 1000, // Cache for 30 minutes
    {
      immediate: options?.immediate ?? true,
      onError: (error) => {
        console.error('Failed to fetch categories:', error);
      },
    }
  );
};

export const useCategory = (categoryId: string, options?: { immediate?: boolean }) => {
  return useCachedApi<CategoryDto>(
    () => productService.getCategoryById(categoryId),
    `category-${categoryId}`,
    30 * 60 * 1000, // Cache for 30 minutes
    {
      immediate: options?.immediate ?? true,
      onError: (error) => {
        console.error('Failed to fetch category:', error);
      },
    }
  );
};

export const useRootCategories = (options?: { immediate?: boolean }) => {
  return useCachedApi<CategoryDto[]>(
    () => productService.getRootCategories(),
    'root-categories',
    30 * 60 * 1000, // Cache for 30 minutes
    {
      immediate: options?.immediate ?? true,
      onError: (error) => {
        console.error('Failed to fetch root categories:', error);
      },
    }
  );
};

export const useSubcategories = (parentId: string, options?: { immediate?: boolean }) => {
  return useCachedApi<CategoryDto[]>(
    () => productService.getSubcategories(parentId),
    `subcategories-${parentId}`,
    30 * 60 * 1000, // Cache for 30 minutes
    {
      immediate: options?.immediate ?? true,
      onError: (error) => {
        console.error('Failed to fetch subcategories:', error);
      },
    }
  );
};

export const useCategoryTree = (options?: { immediate?: boolean }) => {
  return useCachedApi<CategoryDto[]>(
    () => productService.getCategoryTree(),
    'category-tree',
    60 * 60 * 1000, // Cache for 1 hour
    {
      immediate: options?.immediate ?? true,
      onError: (error) => {
        console.error('Failed to fetch category tree:', error);
      },
    }
  );
};

// Product availability and filters
export const useProductAvailability = (productId: string, quantity: number, options?: { immediate?: boolean }) => {
  return useApi<{ available: boolean; maxQuantity: number }>(
    () => productService.checkProductAvailability(productId, quantity),
    {
      immediate: options?.immediate ?? false,
      onError: (error) => {
        console.error('Failed to check product availability:', error);
      },
    }
  );
};

export const useProductFilters = (categoryId?: string, options?: { immediate?: boolean }) => {
  return useCachedApi<{
    brands: string[];
    priceRange: { min: number; max: number };
    availableFilters: string[];
  }>(
    () => productService.getProductFilters(categoryId),
    `product-filters-${categoryId || 'all'}`,
    15 * 60 * 1000, // Cache for 15 minutes
    {
      immediate: options?.immediate ?? true,
      onError: (error) => {
        console.error('Failed to fetch product filters:', error);
      },
    }
  );
};

// Search suggestions
export const useSearchSuggestions = () => {
  return useDebouncedApi<string[]>(
    async (query: string) => {
      if (query.length < 2) return [];
      return await productService.getSearchSuggestions(query);
    },
    200,
    {
      showErrorAlert: false,
      onError: (error) => {
        console.error('Failed to fetch search suggestions:', error);
      },
    }
  );
};

// Combined product actions
export const useProductActions = () => {
  const searchProducts = useCallback(async (searchRequest: ProductSearchRequest) => {
    try {
      return await productService.searchProducts(searchRequest);
    } catch (error) {
      console.error('Product search failed:', error);
      throw error;
    }
  }, []);

  const checkAvailability = useCallback(async (productId: string, quantity: number) => {
    try {
      return await productService.checkProductAvailability(productId, quantity);
    } catch (error) {
      console.error('Availability check failed:', error);
      throw error;
    }
  }, []);

  const getRecommendations = useCallback(async (productId: string, limit: number = 6) => {
    try {
      return await productService.getRecommendedProducts(productId, limit);
    } catch (error) {
      console.error('Failed to get recommendations:', error);
      throw error;
    }
  }, []);

  return {
    searchProducts,
    checkAvailability,
    getRecommendations,
  };
}; 