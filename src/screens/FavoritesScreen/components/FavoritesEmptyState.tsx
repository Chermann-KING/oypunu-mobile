/**
 * @fileoverview Favorites Empty State Component
 * Follows SOLID principles - Single Responsibility for empty state display
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Heart, Search, Folder } from 'lucide-react-native';
import { Button } from '../../../design-system/components';
import { Colors, Spacing, Typography } from '../../../design-system';
import { FavoriteCollection } from '../../../core/interfaces/IFavoritesService';

interface FavoritesEmptyStateProps {
  searchQuery?: string;
  selectedCollection?: FavoriteCollection | null;
  onClearSearch?: () => void;
  onClearCollection?: () => void;
}

export const FavoritesEmptyState: React.FC<FavoritesEmptyStateProps> = ({
  searchQuery,
  selectedCollection,
  onClearSearch,
  onClearCollection,
}) => {
  // État de recherche vide
  if (searchQuery?.trim()) {
    return (
      <View style={styles.emptyContainer}>
        <Search size={48} color={Colors.text.tertiary} />
        <Text style={styles.emptyTitle}>Aucun résultat</Text>
        <Text style={styles.emptySubtitle}>
          Aucun favori trouvé pour "{searchQuery}"
        </Text>
        {onClearSearch && (
          <Button
            title="Effacer la recherche"
            onPress={onClearSearch}
            variant="secondary"
          />
        )}
      </View>
    );
  }

  // État de collection vide
  if (selectedCollection) {
    return (
      <View style={styles.emptyContainer}>
        <Folder size={48} color={Colors.text.tertiary} />
        <Text style={styles.emptyTitle}>Collection vide</Text>
        <Text style={styles.emptySubtitle}>
          Aucun mot dans la collection "{selectedCollection.name}"
        </Text>
        {onClearCollection && (
          <Button
            title="Voir tous les favoris"
            onPress={onClearCollection}
            variant="secondary"
          />
        )}
      </View>
    );
  }

  // État par défaut - aucun favori
  return (
    <View style={styles.emptyContainer}>
      <Heart size={48} color={Colors.text.tertiary} />
      <Text style={styles.emptyTitle}>Aucun favori</Text>
      <Text style={styles.emptySubtitle}>
        Vous n'avez pas encore de mots favoris.{'\n'}
        Parcourez le dictionnaire et ajoutez vos mots préférés !
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: Spacing[8],
    paddingHorizontal: Spacing[6],
  },
  emptyTitle: {
    ...Typography.styles.headingMedium,
    color: Colors.text.primary,
    marginTop: Spacing[4],
    marginBottom: Spacing[2],
    textAlign: 'center',
  },
  emptySubtitle: {
    ...Typography.styles.bodyMedium,
    color: Colors.text.secondary,
    textAlign: 'center',
    marginBottom: Spacing[6],
    lineHeight: 24,
  },
});