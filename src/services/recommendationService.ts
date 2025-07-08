import apiClient from '../utils/apiClient';
import { Product } from '../types';

export interface RecommendationResponse {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  brand: string;
  categoryName: string;
  categoryId: string;
  images: string[];
  averageRating: number;
  reviewCount: number;
  inStock: boolean;
  stockQuantity: number;
  tags: string[];
  specifications: Record<string, string>;
  mainImageUrl?: string;
}

export interface RecommendationStats {
  totalRecommendations: number;
  categoryRelated: number;
  brandRelated: number;
  priceSimilar: number;
  similar: number;
}

export enum RecommendationType {
  SIMILAR = 'SIMILAR',
  FREQUENTLY_BOUGHT_TOGETHER = 'FREQUENTLY_BOUGHT_TOGETHER',
  VIEWED_TOGETHER = 'VIEWED_TOGETHER',
  BRAND_RELATED = 'BRAND_RELATED',
  CATEGORY_RELATED = 'CATEGORY_RELATED',
  PRICE_SIMILAR = 'PRICE_SIMILAR',
  TRENDING = 'TRENDING',
  SEASONAL = 'SEASONAL',
  PERSONALIZED = 'PERSONALIZED'
}

class RecommendationService {
  private baseUrl = '/recommendations';

  /**
   * Get recommendations for a specific product
   */
  async getRecommendationsForProduct(productId: string, limit: number = 6): Promise<Product[]> {
    try {
      const response = await apiClient.get<RecommendationResponse[]>(
        `${this.baseUrl}/products/${productId}?limit=${limit}`
      );
      
      return response.data.map(this.mapRecommendationResponseToProduct);
    } catch (error) {
      console.error('Failed to fetch recommendations:', error);
      throw error;
    }
  }

  /**
   * Get recommendations by type for a specific product
   */
  async getRecommendationsByType(
    productId: string, 
    type: RecommendationType, 
    limit: number = 6
  ): Promise<Product[]> {
    try {
      const response = await apiClient.get<RecommendationResponse[]>(
        `${this.baseUrl}/products/${productId}/type/${type}?limit=${limit}`
      );
      
      return response.data.map(this.mapRecommendationResponseToProduct);
    } catch (error) {
      console.error('Failed to fetch recommendations by type:', error);
      throw error;
    }
  }

  /**
   * Get recommendation statistics for a product
   */
  async getRecommendationStats(productId: string): Promise<RecommendationStats> {
    try {
      const response = await apiClient.get<RecommendationStats>(
        `${this.baseUrl}/products/${productId}/stats`
      );
      
      return response.data;
    } catch (error) {
      console.error('Failed to fetch recommendation stats:', error);
      throw error;
    }
  }

  /**
   * Generate recommendations for a specific product
   */
  async generateRecommendationsForProduct(productId: string): Promise<void> {
    try {
      await apiClient.post(`${this.baseUrl}/products/${productId}/generate`);
    } catch (error) {
      console.error('Failed to generate recommendations:', error);
      throw error;
    }
  }

  /**
   * Get available recommendation types
   */
  async getRecommendationTypes(): Promise<RecommendationType[]> {
    try {
      const response = await apiClient.get<RecommendationType[]>(`${this.baseUrl}/types`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch recommendation types:', error);
      throw error;
    }
  }

  /**
   * Map backend recommendation response to frontend Product type
   */
  private mapRecommendationResponseToProduct(response: RecommendationResponse): Product {
    return {
      id: response.id,
      name: response.name,
      description: response.description,
      price: response.price,
      originalPrice: response.originalPrice,
      brand: response.brand,
      category: response.categoryName,
      image: response.mainImageUrl || response.images?.[0] || '',
      images: response.images || [],
      rating: response.averageRating,
      reviewCount: response.reviewCount,
      inStock: response.inStock,
      stockQuantity: response.stockQuantity,
      tags: response.tags || [],
      specifications: response.specifications || {}
    };
  }
}

export const recommendationService = new RecommendationService(); 