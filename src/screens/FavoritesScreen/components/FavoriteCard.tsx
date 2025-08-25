/**
 * @fileoverview Favorite Card Component
 * Follows SOLID principles - Single Responsibility for displaying a favorite word
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Trash2 } from 'lucide-react-native';
import { Card } from '../../../design-system/components';
import { Colors, Spacing, Typography } from '../../../design-system';
import { FavoriteWord, FavoriteCollection } from '../../../core/interfaces/IFavoritesService';

interface FavoriteCardProps {
  favorite: FavoriteWord;
  collections: FavoriteCollection[];
  onRemove: (favorite: FavoriteWord) => void;
  onPress?: (favorite: FavoriteWord) => void;
}

export const FavoriteCard: React.FC<FavoriteCardProps> = ({
  favorite,
  collections,
  onRemove,
  onPress,
}) => {
  const renderCollections = () => {
    if (favorite.collections.length === 0) {
      return null;
    }

    return (
      <View style={styles.favoriteCollections}>
        {favorite.collections.map((collectionId, index) => {
          const collection = collections.find(c => c.id === collectionId);
          return (
            <Text key={collectionId} style={styles.collectionTag}>
              {collection?.name || 'Collection inconnue'}
              {index < favorite.collections.length - 1 ? ', ' : ''}
            </Text>
          );
        })}
      </View>
    );
  };

  return (
    <Card 
      variant="default" 
      padding={4}
      onPress={onPress ? () => onPress(favorite) : undefined}
    >
      <View style={styles.favoriteHeader}>
        <View style={styles.favoriteInfo}>
          <Text style={styles.favoriteTitle}>{favorite.word}</Text>
          <Text style={styles.favoriteLanguage}>{favorite.language}</Text>
        </View>
        <TouchableOpacity 
          onPress={() => onRemove(favorite)}
          style={styles.removeButton}
        >
          <Trash2 size={18} color={Colors.semantic.error} />
        </TouchableOpacity>
      </View>
      
      {favorite.pronunciation && (
        <Text style={styles.favoritePronunciation}>/{favorite.pronunciation}/</Text>
      )}
      
      <Text style={styles.favoriteDefinition}>{favorite.definition}</Text>
      
      <View style={styles.favoriteFooter}>
        <Text style={styles.favoriteCategory}>{favorite.category}</Text>
        
        {favorite.notes && (
          <Text style={styles.favoriteNotes} numberOfLines={1}>
            {favorite.notes}
          </Text>
        )}
        
        <Text style={styles.favoriteDate}>
          Ajouté le {new Date(favorite.addedToFavoritesAt).toLocaleDateString('fr-FR')}
        </Text>
      </View>

      {renderCollections()}
    </Card>
  );
};

const styles = StyleSheet.create({
  favoriteHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing[2],
  },
  favoriteInfo: {
    flex: 1,
  },
  favoriteTitle: {
    ...Typography.styles.headingMedium,
    marginBottom: Spacing[1],
  },
  favoriteLanguage: {
    ...Typography.styles.labelMedium,
    color: Colors.text.secondary,
  },
  removeButton: {
    padding: Spacing[2],
    marginRight: -Spacing[2],
  },
  favoritePronunciation: {
    ...Typography.styles.caption,
    color: Colors.text.tertiary,
    fontStyle: 'italic',
    marginBottom: Spacing[2],
  },
  favoriteDefinition: {
    ...Typography.styles.bodyMedium,
    color: Colors.text.secondary,
    marginBottom: Spacing[3],
  },
  favoriteFooter: {
    marginBottom: Spacing[2],
  },
  favoriteCategory: {
    ...Typography.styles.caption,
    color: Colors.interactive.focus,
    backgroundColor: Colors.surface.elevated,
    paddingHorizontal: Spacing[2],
    paddingVertical: Spacing[1],
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginBottom: Spacing[2],
  },
  favoriteNotes: {
    ...Typography.styles.caption,
    color: Colors.text.tertiary,
    fontStyle: 'italic',
    marginBottom: Spacing[1],
  },
  favoriteDate: {
    ...Typography.styles.caption,
    color: Colors.text.tertiary,
  },
  favoriteCollections: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: Spacing[2],
    paddingTop: Spacing[2],
    borderTopWidth: 1,
    borderTopColor: Colors.primary[300],
  },
  collectionTag: {
    ...Typography.styles.caption,
    color: Colors.semantic.info,
  },
});