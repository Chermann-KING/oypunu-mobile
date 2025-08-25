/**
 * @fileoverview Collection Filters Component
 * Follows SOLID principles - Single Responsibility for collection filtering
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { FavoriteCollection } from '../../../core/interfaces/IFavoritesService';
import { Colors, Spacing, Typography } from '../../../design-system';

interface CollectionFiltersProps {
  collections: FavoriteCollection[];
  selectedCollectionId: string | null;
  onCollectionSelect: (collectionId: string | null) => void;
}

export const CollectionFilters: React.FC<CollectionFiltersProps> = ({
  collections,
  selectedCollectionId,
  onCollectionSelect,
}) => {
  if (collections.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Collections :</Text>
      
      <View style={styles.filterButtons}>
        {/* Bouton "Toutes" */}
        <TouchableOpacity
          style={[
            styles.filterButton,
            !selectedCollectionId && styles.filterButtonActive
          ]}
          onPress={() => onCollectionSelect(null)}
        >
          <Text style={[
            styles.filterButtonText,
            !selectedCollectionId && styles.filterButtonTextActive
          ]}>
            Toutes
          </Text>
        </TouchableOpacity>
        
        {/* Boutons collections */}
        {collections.map((collection) => (
          <TouchableOpacity
            key={collection.id}
            style={[
              styles.filterButton,
              selectedCollectionId === collection.id && styles.filterButtonActive
            ]}
            onPress={() => onCollectionSelect(collection.id)}
          >
            <Text style={[
              styles.filterButtonText,
              selectedCollectionId === collection.id && styles.filterButtonTextActive
            ]}>
              {collection.name}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Spacing[4],
    paddingVertical: Spacing[3],
    borderBottomWidth: 1,
    borderBottomColor: Colors.primary[300],
  },
  title: {
    ...Typography.styles.labelMedium,
    color: Colors.text.secondary,
    marginBottom: Spacing[2],
  },
  filterButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing[2],
  },
  filterButton: {
    paddingHorizontal: Spacing[3],
    paddingVertical: Spacing[2],
    borderRadius: 16,
    backgroundColor: Colors.surface.elevated,
    borderWidth: 1,
    borderColor: Colors.primary[300],
  },
  filterButtonActive: {
    backgroundColor: Colors.primary[600],
    borderColor: Colors.primary[600],
  },
  filterButtonText: {
    ...Typography.styles.caption,
    color: Colors.text.secondary,
  },
  filterButtonTextActive: {
    color: Colors.text.onPrimary,
  },
});