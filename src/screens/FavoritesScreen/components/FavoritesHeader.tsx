/**
 * @fileoverview Favorites Header Component
 * Follows SOLID principles - Single Responsibility for header display
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, Spacing, Typography } from '../../../design-system';

interface FavoritesHeaderProps {
  totalCount: number;
  hasSearchQuery?: boolean;
  hasSelectedCollection?: boolean;
  selectedCollectionName?: string;
}

export const FavoritesHeader: React.FC<FavoritesHeaderProps> = ({
  totalCount,
  hasSearchQuery,
  hasSelectedCollection,
  selectedCollectionName,
}) => {
  const getSubtitle = () => {
    let subtitle = `${totalCount} mot${totalCount !== 1 ? 's' : ''}`;
    
    if (hasSearchQuery) {
      subtitle += ' trouvé(s)';
    } else if (hasSelectedCollection && selectedCollectionName) {
      subtitle += ` dans ${selectedCollectionName}`;
    }
    
    return subtitle;
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Mes Favoris</Text>
      <Text style={styles.subtitle}>{getSubtitle()}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Spacing[4],
    paddingVertical: Spacing[4],
  },
  title: {
    ...Typography.styles.headingLarge,
  },
  subtitle: {
    ...Typography.styles.labelMedium,
    color: Colors.text.secondary,
    marginTop: Spacing[1],
  },
});