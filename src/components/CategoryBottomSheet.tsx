import React, { useRef, useEffect, useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  Animated,
  PanResponder,
  Dimensions,
  TouchableWithoutFeedback,
  FlatList,
  TextInput,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../styles/theme';
import { Category } from '../types';

interface CategoryBottomSheetProps {
  isVisible: boolean;
  onClose: () => void;
  categories: Category[];
  selectedCategories?: string[];
  onCategorySelect: (categories: string[]) => void;
  loading?: boolean;
}

const { height: screenHeight, width: screenWidth } = Dimensions.get('window');

export const CategoryBottomSheet: React.FC<CategoryBottomSheetProps> = ({
  isVisible,
  onClose,
  categories,
  selectedCategories = [],
  onCategorySelect,
  loading = false,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [localSelectedCategories, setLocalSelectedCategories] = useState<string[]>(selectedCategories);
  const slideAnim = useRef(new Animated.Value(screenHeight)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  // Sync with props when they change
  useEffect(() => {
    setLocalSelectedCategories(selectedCategories);
  }, [selectedCategories]);

  const panResponder = PanResponder.create({
    onMoveShouldSetPanResponder: (evt, gestureState) => {
      return gestureState.dy > 0 && gestureState.vy > 0;
    },
    onPanResponderMove: (evt, gestureState) => {
      if (gestureState.dy > 0) {
        slideAnim.setValue(gestureState.dy);
      }
    },
    onPanResponderRelease: (evt, gestureState) => {
      if (gestureState.dy > 100 || gestureState.vy > 0.5) {
        handleClose();
      } else {
        Animated.spring(slideAnim, {
          toValue: 0,
          useNativeDriver: true,
        }).start();
      }
    },
  });

  useEffect(() => {
    if (isVisible) {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [isVisible]);

  const handleClose = () => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: screenHeight,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onClose();
      setSearchQuery('');
    });
  };

  const handleCategoryToggle = (categoryId: string) => {
    const newSelectedCategories = localSelectedCategories.includes(categoryId)
      ? localSelectedCategories.filter(id => id !== categoryId)
      : [...localSelectedCategories, categoryId];
    
    setLocalSelectedCategories(newSelectedCategories);
  };

  const handleApplyFilters = () => {
    onCategorySelect(localSelectedCategories);
    handleClose();
  };

  const handleClearAll = () => {
    console.log('🔄 CategoryBottomSheet: handleClearAll called');
    console.log('🔄 CategoryBottomSheet: Current localSelectedCategories:', localSelectedCategories);
    setLocalSelectedCategories([]);
    // Immediately apply the cleared filters
    onCategorySelect([]);
    handleClose();
  };

  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderCategoryItem = ({ item }: { item: Category }) => {
    const isSelected = localSelectedCategories.includes(item.id);
    
    return (
      <TouchableOpacity
        style={[
          styles.categoryItem,
          isSelected && styles.selectedCategoryItem,
        ]}
        onPress={() => handleCategoryToggle(item.id)}
        activeOpacity={0.7}
      >
        <View style={styles.categoryContent}>
          <Text style={[
            styles.categoryName,
            isSelected && styles.selectedCategoryName,
          ]}>
            {item.name}
          </Text>
          <Text style={[
            styles.categoryCount,
            isSelected && styles.selectedCategoryCount,
          ]}>
            {item.productCount} items
          </Text>
        </View>
        {isSelected && (
          <Ionicons 
            name="checkmark-circle" 
            size={24} 
            color={theme.colors.primary[600]} 
          />
        )}
      </TouchableOpacity>
    );
  };

  if (!isVisible) return null;

  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="none"
      onRequestClose={handleClose}
    >
      <TouchableWithoutFeedback onPress={handleClose}>
        <Animated.View style={[styles.backdrop, { opacity: opacityAnim }]}>
          <TouchableWithoutFeedback>
            <Animated.View
              style={[
                styles.bottomSheet,
                {
                  transform: [{ translateY: slideAnim }],
                },
              ]}
              {...panResponder.panHandlers}
            >
              {/* Handle Bar */}
              <View style={styles.handleBar} />
              
              {/* Header */}
              <View style={styles.header}>
                <Text style={styles.title}>Select Categories</Text>
                <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
                  <Ionicons name="close" size={24} color={theme.colors.text.primary} />
                </TouchableOpacity>
              </View>

              {/* Search Bar */}
              <View style={styles.searchContainer}>
                <Ionicons name="search" size={20} color={theme.colors.text.secondary} />
                <TextInput
                  style={styles.searchInput}
                  placeholder="Search categories..."
                  placeholderTextColor={theme.colors.text.secondary}
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                />
              </View>

              {/* Selection Info & Clear All */}
              <View style={styles.selectionInfo}>
                <Text style={styles.selectionCount}>
                  {localSelectedCategories.length} selected
                </Text>
                {localSelectedCategories.length > 0 && (
                  <TouchableOpacity onPress={handleClearAll} style={styles.clearAllButton}>
                    <Text style={styles.clearAllText}>Clear All</Text>
                  </TouchableOpacity>
                )}
              </View>

              {/* Categories List */}
              <FlatList
                data={filteredCategories}
                renderItem={renderCategoryItem}
                keyExtractor={(item) => item.id}
                numColumns={2}
                columnWrapperStyle={styles.row}
                contentContainerStyle={styles.categoriesContainer}
                showsVerticalScrollIndicator={false}
              />

              {/* Apply Button */}
              <TouchableOpacity
                style={[
                  styles.applyButton,
                  localSelectedCategories.length === 0 && styles.applyButtonDisabled,
                ]}
                onPress={handleApplyFilters}
                disabled={localSelectedCategories.length === 0}
              >
                <Text style={[
                  styles.applyButtonText,
                  localSelectedCategories.length === 0 && styles.applyButtonTextDisabled,
                ]}>
                  Apply {localSelectedCategories.length > 0 ? `(${localSelectedCategories.length})` : ''}
                </Text>
              </TouchableOpacity>
            </Animated.View>
          </TouchableWithoutFeedback>
        </Animated.View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  bottomSheet: {
    backgroundColor: theme.colors.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 16,
    paddingBottom: 34,
    maxHeight: screenHeight * 0.75,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  handleBar: {
    width: 40,
    height: 4,
    backgroundColor: theme.colors.gray[300],
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 8,
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: theme.colors.text.primary,
  },
  closeButton: {
    padding: 4,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.gray[100],
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    color: theme.colors.text.primary,
  },
  selectionInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  selectionCount: {
    fontSize: 14,
    color: theme.colors.text.secondary,
    fontWeight: '500',
  },
  clearAllButton: {
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  clearAllText: {
    fontSize: 14,
    color: theme.colors.primary[600],
    fontWeight: '600',
  },
  categoriesContainer: {
    paddingBottom: 16,
  },
  row: {
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  categoryItem: {
    flex: 1,
    backgroundColor: theme.colors.gray[100],
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 4,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedCategoryItem: {
    backgroundColor: theme.colors.primary[50],
    borderColor: theme.colors.primary[600],
  },
  categoryContent: {
    flex: 1,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text.primary,
    marginBottom: 4,
  },
  selectedCategoryName: {
    color: theme.colors.primary[600],
  },
  categoryCount: {
    fontSize: 12,
    color: theme.colors.text.secondary,
  },
  selectedCategoryCount: {
    color: theme.colors.primary[600],
  },
  applyButton: {
    backgroundColor: theme.colors.primary[600],
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  applyButtonDisabled: {
    backgroundColor: theme.colors.gray[400],
    opacity: 0.5,
  },
  applyButtonText: {
    color: theme.colors.surface,
    fontSize: 16,
    fontWeight: '600',
  },
  applyButtonTextDisabled: {
    color: theme.colors.text.secondary,
  },
}); 