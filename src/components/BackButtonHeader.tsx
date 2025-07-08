import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../styles/theme';

interface BackButtonHeaderProps {
  title: string;
  showBackButton?: boolean;
}

export const BackButtonHeader: React.FC<BackButtonHeaderProps> = ({ 
  title, 
  showBackButton = true 
}) => {
  const router = useRouter();

  const handleBackPress = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(tabs)/home');
    }
  };

  return (
    <View style={styles.header}>
      <View style={styles.headerContent}>
        {showBackButton && (
          <TouchableOpacity onPress={handleBackPress} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={theme.colors.text.primary} />
          </TouchableOpacity>
        )}
        <Text style={styles.title}>{title}</Text>
        <View style={styles.spacer} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.gray[200],
    paddingTop: 8,
    paddingBottom: 12,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    height: 44,
  },
  backButton: {
    marginRight: theme.spacing.md,
    padding: 4,
  },
  title: {
    fontSize: theme.typography.sizes.lg,
    fontWeight: '600',
    color: theme.colors.text.primary,
    flex: 1,
  },
  spacer: {
    width: 36, // Same width as back button to center title
  },
}); 