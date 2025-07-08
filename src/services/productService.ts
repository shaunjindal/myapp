import { api } from '../utils/apiClient';
import { 
  ProductDto, 
  CategoryDto, 
  ProductSearchRequest, 
  ProductSearchResponse,
  PageRequest,
  PageResponse
} from '../types/api';

export const productService = {
  // Product endpoints
  getAllProducts: async (pageRequest?: PageRequest): Promise<PageResponse<any>> => {
    const params = new URLSearchParams();
    if (pageRequest?.page !== undefined) params.append('page', pageRequest.page.toString());
    if (pageRequest?.size !== undefined) params.append('size', pageRequest.size.toString());
    if (pageRequest?.sort) params.append('sort', pageRequest.sort);
    
    console.log('🔄 ProductService: Making API call to /products with params:', params.toString());
    const response = await api.get<PageResponse<any>>(`/products?${params.toString()}`);
    console.log('✅ ProductService: Raw API response:', response);
    return response;
  },

  getProductById: async (productId: string): Promise<ProductDto> => {
    const response = await api.get<ProductDto>(`/products/${productId}`);
    return response;
  },

  searchProducts: async (searchRequest: ProductSearchRequest): Promise<ProductSearchResponse> => {
    const params = new URLSearchParams();
    
    if (searchRequest.query) params.append('query', searchRequest.query);
    if (searchRequest.categoryId) params.append('categoryId', searchRequest.categoryId);
    if (searchRequest.minPrice !== undefined) params.append('minPrice', searchRequest.minPrice.toString());
    if (searchRequest.maxPrice !== undefined) params.append('maxPrice', searchRequest.maxPrice.toString());
    if (searchRequest.minRating !== undefined) params.append('minRating', searchRequest.minRating.toString());
    if (searchRequest.inStock !== undefined) params.append('inStock', searchRequest.inStock.toString());
    if (searchRequest.brand) params.append('brand', searchRequest.brand);
    if (searchRequest.sortBy) params.append('sortBy', searchRequest.sortBy);
    if (searchRequest.sortOrder) params.append('sortOrder', searchRequest.sortOrder);
    if (searchRequest.page !== undefined) params.append('page', searchRequest.page.toString());
    if (searchRequest.size !== undefined) params.append('size', searchRequest.size.toString());

    const response = await api.get<ProductSearchResponse>(`/products/search?${params.toString()}`);
    return response;
  },

  getProductsByCategory: async (categoryId: string, pageRequest?: PageRequest): Promise<ProductSearchResponse> => {
    const params = new URLSearchParams();
    if (pageRequest?.page !== undefined) params.append('page', pageRequest.page.toString());
    if (pageRequest?.size !== undefined) params.append('size', pageRequest.size.toString());
    if (pageRequest?.sort) params.append('sort', pageRequest.sort);

    const response = await api.get<ProductSearchResponse>(`/products/category/${categoryId}?${params.toString()}`);
    return response;
  },

  getRecommendedProducts: async (productId: string, limit: number = 6): Promise<ProductDto[]> => {
    const response = await api.get<ProductDto[]>(`/products/${productId}/recommendations?limit=${limit}`);
    return response;
  },

  getFeaturedProducts: async (limit: number = 10): Promise<ProductDto[]> => {
    const response = await api.get<ProductDto[]>(`/products/featured?limit=${limit}`);
    return response;
  },

  getTopRatedProducts: async (limit: number = 10): Promise<ProductDto[]> => {
    const response = await api.get<ProductDto[]>(`/products/top-rated?limit=${limit}`);
    return response;
  },

  getNewestProducts: async (limit: number = 10): Promise<ProductDto[]> => {
    const response = await api.get<ProductDto[]>(`/products/newest?limit=${limit}`);
    return response;
  },

  getProductsByBrand: async (brand: string, pageRequest?: PageRequest): Promise<ProductSearchResponse> => {
    const params = new URLSearchParams();
    if (pageRequest?.page !== undefined) params.append('page', pageRequest.page.toString());
    if (pageRequest?.size !== undefined) params.append('size', pageRequest.size.toString());
    if (pageRequest?.sort) params.append('sort', pageRequest.sort);

    const response = await api.get<ProductSearchResponse>(`/products/brand/${encodeURIComponent(brand)}?${params.toString()}`);
    return response;
  },

  // Category endpoints
  getAllCategories: async (): Promise<CategoryDto[]> => {
    const response = await api.get<CategoryDto[]>('/categories');
    return response;
  },

  getCategoriesForFilters: async (): Promise<{ id: string; name: string; slug: string; productCount: number }[]> => {
    console.log('🔄 ProductService: Fetching categories for filters...');
    const response = await api.get<{ id: string; name: string; slug: string; productCount: number }[]>('/categories/for-filters');
    console.log('✅ ProductService: Categories for filters response:', response);
    return response;
  },

  getCategoryById: async (categoryId: string): Promise<CategoryDto> => {
    const response = await api.get<CategoryDto>(`/categories/${categoryId}`);
    return response;
  },

  getRootCategories: async (): Promise<CategoryDto[]> => {
    const response = await api.get<CategoryDto[]>('/categories/root');
    return response;
  },

  getSubcategories: async (parentId: string): Promise<CategoryDto[]> => {
    const response = await api.get<CategoryDto[]>(`/categories/${parentId}/subcategories`);
    return response;
  },

  getCategoryTree: async (): Promise<CategoryDto[]> => {
    const response = await api.get<CategoryDto[]>('/categories/tree');
    return response;
  },

  // Product availability
  checkProductAvailability: async (productId: string, quantity: number): Promise<{ available: boolean; maxQuantity: number }> => {
    const response = await api.get<{ available: boolean; maxQuantity: number }>(`/products/${productId}/availability?quantity=${quantity}`);
    return response;
  },

  // Product reviews (if implemented in backend)
  getProductReviews: async (productId: string, pageRequest?: PageRequest): Promise<PageResponse<any>> => {
    const params = new URLSearchParams();
    if (pageRequest?.page !== undefined) params.append('page', pageRequest.page.toString());
    if (pageRequest?.size !== undefined) params.append('size', pageRequest.size.toString());
    if (pageRequest?.sort) params.append('sort', pageRequest.sort);

    const response = await api.get<PageResponse<any>>(`/products/${productId}/reviews?${params.toString()}`);
    return response;
  },

  // Search suggestions
  getSearchSuggestions: async (query: string): Promise<string[]> => {
    const response = await api.get<string[]>(`/products/search/suggestions?query=${encodeURIComponent(query)}`);
    return response;
  },

  // Product filters
  getProductFilters: async (categoryId?: string): Promise<{
    brands: string[];
    priceRange: { min: number; max: number };
    availableFilters: string[];
  }> => {
    const params = categoryId ? `?categoryId=${categoryId}` : '';
    const response = await api.get<{
      brands: string[];
      priceRange: { min: number; max: number };
      availableFilters: string[];
    }>(`/products/filters${params}`);
    return response;
  },
}; 