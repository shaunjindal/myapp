import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../styles/theme';

interface ViewDetailsButtonProps {
  text?: string;
}

export function ViewDetailsButton({ text = "Tap to view details" }: ViewDetailsButtonProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>{text}</Text>
      <Ionicons name="chevron-forward" size={16} color={theme.colors.primary[600]} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: theme.colors.gray[200],
  },
  text: {
    fontSize: 14,
    color: theme.colors.primary[600],
    marginRight: 4,
    fontWeight: '500',
  },
}); 