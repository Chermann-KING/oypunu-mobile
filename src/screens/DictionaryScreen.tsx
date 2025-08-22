import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Heart, Plus } from 'lucide-react-native';
import { Colors, Spacing, Typography } from '../design-system';
import { SearchBar, Card } from '../design-system/components';
import { mockWords } from '../data/mockData';
import { Word } from '../types';

export const DictionaryScreen: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredWords, setFilteredWords] = useState<Word[]>(mockWords);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.trim() === '') {
      setFilteredWords(mockWords);
    } else {
      const filtered = mockWords.filter(word =>
        word.word.toLowerCase().includes(query.toLowerCase()) ||
        word.definition.toLowerCase().includes(query.toLowerCase()) ||
        word.language.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredWords(filtered);
    }
  };

  const renderWordCard = ({ item }: { item: Word }) => (
    <Card variant="default" padding={4}>
      <View style={styles.wordHeader}>
        <View style={styles.wordInfo}>
          <Text style={styles.wordTitle}>{item.word}</Text>
          <Text style={styles.language}>{item.language}</Text>
        </View>
        <TouchableOpacity>
          <Heart 
            size={20} 
            color={item.isFavorite ? Colors.semantic.error : Colors.text.tertiary}
            fill={item.isFavorite ? Colors.semantic.error : 'transparent'}
          />
        </TouchableOpacity>
      </View>
      
      <Text style={styles.pronunciation}>/{item.pronunciation}/</Text>
      <Text style={styles.definition}>{item.definition}</Text>
      
      <View style={styles.wordFooter}>
        <Text style={styles.category}>{item.category}</Text>
        <Text style={styles.author}>Par {item.author} • {item.timeAgo}</Text>
      </View>
    </Card>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Dictionnaire</Text>
      </View>
      
      <SearchBar
        placeholder="Rechercher un mot..."
        onSearch={handleSearch}
      />

      <FlatList
        data={filteredWords}
        renderItem={renderWordCard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />

      <TouchableOpacity style={styles.fab}>
        <Plus size={24} color={Colors.text.onPrimary} />
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.surface.background,
  },
  header: {
    paddingHorizontal: Spacing[4],
    paddingVertical: Spacing[4],
  },
  title: {
    ...Typography.styles.headingLarge,
  },
  listContainer: {
    paddingHorizontal: Spacing[4],
    paddingBottom: Spacing[20],
  },
  wordHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing[2],
  },
  wordInfo: {
    flex: 1,
  },
  wordTitle: {
    ...Typography.styles.headingMedium,
    marginBottom: Spacing[1],
  },
  language: {
    ...Typography.styles.labelMedium,
    color: Colors.text.secondary,
  },
  pronunciation: {
    ...Typography.styles.caption,
    color: Colors.text.tertiary,
    fontStyle: 'italic',
    marginBottom: Spacing[2],
  },
  definition: {
    ...Typography.styles.bodyMedium,
    color: Colors.text.secondary,
    marginBottom: Spacing[3],
  },
  wordFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  category: {
    ...Typography.styles.caption,
    color: Colors.interactive.focus,
    backgroundColor: Colors.surface.elevated,
    paddingHorizontal: Spacing[2],
    paddingVertical: Spacing[1],
    borderRadius: 12,
  },
  author: {
    ...Typography.styles.caption,
    color: Colors.text.tertiary,
  },
  fab: {
    position: 'absolute',
    bottom: Spacing[6],
    right: Spacing[4],
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.primary[600],
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.primary[900],
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
});