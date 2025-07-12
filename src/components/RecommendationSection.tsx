import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, Image, ActivityIndicator, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { recommendationService, RecommendationType } from '../services/recommendationService';
import { Product } from '../types';
import { theme } from '../styles/theme';

interface RecommendationSectionProps {
  productId: string;
  title?: string;
  limit?: number;
}

export const RecommendationSection: React.FC<RecommendationSectionProps> = ({
  productId,
  title = "You might also like",
  limit = 6
}) => {
  const [recommendations, setRecommendations] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Fetch recommendations
  useEffect(() => {
    const fetchRecommendations = async () => {
      if (!productId) return;

      try {
        setLoading(true);
        setError(null);

        const results = await recommendationService.getRecommendationsForProduct(productId, limit);
        setRecommendations(results);
      } catch (err: any) {
        console.error('Failed to fetch recommendations:', err);
        setError(err.message || 'Failed to load recommendations');
        setRecommendations([]);
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, [productId, limit]);

  const handleProductPress = (product: Product) => {
    router.push(`/(tabs)/products/${product.id}`);
  };

  const getTypeDisplayName = (type: RecommendationType): string => {
    const typeNames: Record<RecommendationType, string> = {
      [RecommendationType.SIMILAR]: 'Similar Products',
      [RecommendationType.FREQUENTLY_BOUGHT_TOGETHER]: 'Frequently Bought Together',
      [RecommendationType.VIEWED_TOGETHER]: 'Viewed Together',
      [RecommendationType.BRAND_RELATED]: 'Same Brand',
      [RecommendationType.CATEGORY_RELATED]: 'Same Category',
      [RecommendationType.PRICE_SIMILAR]: 'Similar Price',
      [RecommendationType.TRENDING]: 'Trending',
      [RecommendationType.SEASONAL]: 'Seasonal',
      [RecommendationType.PERSONALIZED]: 'For You'
    };
    return typeNames[type] || type;
  };

  const renderRecommendationItem = ({ item }: { item: Product }) => (
    <TouchableOpacity
      style={styles.recommendationCard}
      onPress={() => handleProductPress(item)}
      activeOpacity={0.9}
    >
      <View style={styles.imageContainer}>
        <Image source={{ uri: item.image }} style={styles.productImage} />
        {item.originalPrice && (item.originalPrice - item.price) > 0 && (
          <View style={styles.discountBadge}>
            <Text style={styles.discountText}>
              -{Math.round(((item.originalPrice - item.price) / item.originalPrice) * 100)}%
            </Text>
          </View>
        )}
      </View>
      
      <View style={styles.productInfo}>
        <View style={styles.brandBadge}>
          <Text style={styles.brandText}>{item.brand}</Text>
        </View>
        
        <Text style={styles.productName} numberOfLines={2}>
          {item.name}
        </Text>
        
        {item.rating > 0 && (
          <View style={styles.ratingContainer}>
            <Text style={styles.stars}>{'★'.repeat(Math.floor(item.rating))}</Text>
            <Text style={styles.ratingValue}>{item.rating}</Text>
          </View>
        )}
        
        <View style={styles.priceContainer}>
          <Text style={styles.price}>${item.price}</Text>
          {item.originalPrice && (item.originalPrice - item.price) > 0 && (
            <Text style={styles.originalPrice}>${item.originalPrice}</Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );



  if (loading) {
    return (
      <View style={styles.cardContainer}>
        <View style={styles.cardHeader}>
          <View style={styles.cardIconContainer}>
            <Ionicons name="sparkles-outline" size={20} color={theme.colors.primary[600]} />
          </View>
          <Text style={styles.cardTitle}>{title}</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color={theme.colors.primary[600]} />
          <Text style={styles.loadingText}>Loading recommendations...</Text>
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.cardContainer}>
        <View style={styles.cardHeader}>
          <View style={styles.cardIconContainer}>
            <Ionicons name="sparkles-outline" size={20} color={theme.colors.primary[600]} />
          </View>
          <Text style={styles.cardTitle}>{title}</Text>
        </View>
        <View style={styles.errorContainer}>
          <Ionicons name="warning-outline" size={24} color={theme.colors.error[500]} />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      </View>
    );
  }

  if (recommendations.length === 0) {
    return null;
  }

  return (
    <View style={styles.cardContainer}>
      <View style={styles.cardHeader}>
        <View style={styles.cardIconContainer}>
          <Ionicons name="sparkles-outline" size={20} color={theme.colors.primary[600]} />
        </View>
        <Text style={styles.cardTitle}>{title}</Text>
      </View>
      
      <FlatList
        data={recommendations}
        renderItem={renderRecommendationItem}
        keyExtractor={(item) => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.recommendationsList}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius['2xl'],
    marginHorizontal: theme.spacing.lg,
    marginTop: theme.spacing.lg,
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
  sectionContainer: {
    marginTop: theme.spacing.xl,
    paddingHorizontal: theme.spacing.md,
  },
  sectionTitle: {
    fontSize: theme.typography.sizes.lg,
    fontWeight: 'bold',
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.md,
  },

  recommendationsList: {
    paddingVertical: theme.spacing.xs,
    paddingHorizontal: theme.spacing.xs,
  },
  separator: {
    width: theme.spacing.md,
  },
  recommendationCard: {
    width: 160,
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius['2xl'],
    marginBottom: theme.spacing.sm,
    overflow: 'hidden',
    ...theme.shadows.md,
  },
  imageContainer: {
    position: 'relative',
    borderTopLeftRadius: theme.borderRadius['2xl'],
    borderTopRightRadius: theme.borderRadius['2xl'],
    overflow: 'hidden',
  },
  productImage: {
    width: '100%',
    height: 120,
    resizeMode: 'cover',
  },
  discountBadge: {
    position: 'absolute',
    top: theme.spacing.xs,
    right: theme.spacing.xs,
    backgroundColor: theme.colors.error[500],
    borderRadius: theme.borderRadius.sm,
    paddingHorizontal: theme.spacing.xs,
    paddingVertical: 2,
  },
  discountText: {
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.background,
    fontWeight: 'bold',
  },
  productInfo: {
    padding: theme.spacing.sm,
  },
  brandBadge: {
    alignSelf: 'flex-start',
    backgroundColor: theme.colors.primary[50],
    paddingHorizontal: theme.spacing.xs,
    paddingVertical: 2,
    borderRadius: theme.borderRadius.sm,
    marginBottom: theme.spacing.xs,
  },
  brandText: {
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.primary[600],
    fontWeight: '500',
  },
  productName: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.text.primary,
    fontWeight: '500',
    marginBottom: theme.spacing.xs,
    lineHeight: 18,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.xs,
  },
  stars: {
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.warning[500],
    marginRight: theme.spacing.xs,
  },
  ratingValue: {
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.text.secondary,
    fontWeight: '500',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  price: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.text.primary,
    fontWeight: 'bold',
    marginRight: theme.spacing.xs,
  },
  originalPrice: {
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.text.secondary,
    textDecorationLine: 'line-through',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.xl,
  },
  loadingText: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.text.secondary,
    marginLeft: theme.spacing.sm,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.xl,
  },
  errorText: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.error[500],
    marginLeft: theme.spacing.sm,
  },

}); 