import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MessageCircle } from 'lucide-react-native';
import { Colors, Spacing, Typography } from '../design-system';
import { SearchBar, Card } from '../design-system/components';
import { mockMessages } from '../data/mockData';
import { Message } from '../types';

export const MessagesScreen: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredMessages, setFilteredMessages] = useState<Message[]>(mockMessages);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.trim() === '') {
      setFilteredMessages(mockMessages);
    } else {
      const filtered = mockMessages.filter(message =>
        message.contactName.toLowerCase().includes(query.toLowerCase()) ||
        message.lastMessage.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredMessages(filtered);
    }
  };

  const renderMessageCard = ({ item }: { item: Message }) => (
    <Card variant="default" padding={4} onPress={() => console.log('Open chat:', item.id)}>
      <View style={styles.messageHeader}>
        <Image source={{ uri: item.avatar }} style={styles.avatar} />
        <View style={styles.messageInfo}>
          <View style={styles.nameRow}>
            <Text style={styles.contactName}>{item.contactName}</Text>
            <Text style={styles.timestamp}>{item.timestamp}</Text>
          </View>
          <Text style={styles.lastMessage} numberOfLines={1}>
            {item.lastMessage}
          </Text>
        </View>
        {item.unreadCount > 0 && (
          <View style={styles.unreadBadge}>
            <Text style={styles.unreadText}>{item.unreadCount}</Text>
          </View>
        )}
      </View>
    </Card>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <MessageCircle size={64} color={Colors.text.tertiary} />
      <Text style={styles.emptyTitle}>Aucun message</Text>
      <Text style={styles.emptyDescription}>
        Vos conversations apparaîtront ici
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Messages</Text>
      </View>
      
      <SearchBar
        placeholder="Rechercher une conversation..."
        onSearch={handleSearch}
      />

      <FlatList
        data={filteredMessages}
        renderItem={renderMessageCard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[
          styles.listContainer,
          filteredMessages.length === 0 && styles.emptyContainer
        ]}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={renderEmptyState}
      />
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
  emptyContainer: {
    flex: 1,
  },
  messageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: Spacing[3],
  },
  messageInfo: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing[1],
  },
  contactName: {
    ...Typography.styles.labelMedium,
    color: Colors.text.primary,
    fontWeight: '600',
  },
  timestamp: {
    ...Typography.styles.caption,
    color: Colors.text.tertiary,
  },
  lastMessage: {
    ...Typography.styles.bodyMedium,
    color: Colors.text.secondary,
  },
  unreadBadge: {
    backgroundColor: Colors.semantic.info,
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: Spacing[2],
  },
  unreadText: {
    ...Typography.styles.caption,
    color: Colors.text.onPrimary,
    fontWeight: '600',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing[8],
  },
  emptyTitle: {
    ...Typography.styles.headingMedium,
    marginTop: Spacing[4],
    marginBottom: Spacing[2],
  },
  emptyDescription: {
    ...Typography.styles.bodyMedium,
    color: Colors.text.secondary,
    textAlign: 'center',
  },
});