/**
 * @fileoverview Favorites Loading State Component
 * Follows SOLID principles - Single Responsibility for loading state display
 */

import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { User } from 'lucide-react-native';
import { Button } from '../../../design-system/components';
import { Colors, Spacing, Typography } from '../../../design-system';

interface FavoritesLoadingStateProps {
  isAuthenticated: boolean;
  isLoading: boolean;
  error?: string;
  onRetry?: () => void;
  onNavigateToLogin?: () => void;
}

export const FavoritesLoadingState: React.FC<FavoritesLoadingStateProps> = ({
  isAuthenticated,
  isLoading,
  error,
  onRetry,
  onNavigateToLogin,
}) => {
  // État non connecté
  if (!isAuthenticated) {
    return (
      <View style={styles.centerContainer}>
        <User size={64} color={Colors.text.secondary} />
        <Text style={styles.loginTitle}>Connectez-vous</Text>
        <Text style={styles.loginSubtitle}>
          Connectez-vous pour accéder à vos favoris et collections
        </Text>
        {onNavigateToLogin && (
          <Button
            title="Se connecter"
            onPress={onNavigateToLogin}
            variant="primary"
          />
        )}
      </View>
    );
  }

  // État d'erreur
  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>{error}</Text>
        {onRetry && (
          <Button
            title="Réessayer"
            onPress={onRetry}
            variant="primary"
          />
        )}
      </View>
    );
  }

  // État de chargement
  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={Colors.primary[600]} />
        <Text style={styles.loadingText}>Chargement de vos favoris...</Text>
      </View>
    );
  }

  return null;
};

const styles = StyleSheet.create({
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing[6],
  },
  loginTitle: {
    ...Typography.styles.headingLarge,
    textAlign: 'center',
    marginTop: Spacing[6],
    marginBottom: Spacing[2],
  },
  loginSubtitle: {
    ...Typography.styles.bodyMedium,
    color: Colors.text.secondary,
    textAlign: 'center',
    marginBottom: Spacing[8],
    lineHeight: 24,
  },
  loadingText: {
    ...Typography.styles.bodyMedium,
    color: Colors.text.secondary,
    marginTop: Spacing[4],
  },
  errorText: {
    ...Typography.styles.bodyMedium,
    color: Colors.semantic.error,
    textAlign: 'center',
    marginBottom: Spacing[4],
  },
});