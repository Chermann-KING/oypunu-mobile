import React from 'react';
import { View, Text, StyleSheet, FlatList, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Users, TrendingUp, Globe, BookOpen } from 'lucide-react-native';
import { Colors, Spacing, Typography } from '../design-system';
import { Card } from '../design-system/components';
import { mockCommunityActivity } from '../data/mockData';
import { CommunityActivity } from '../types';

export const CommunityScreen: React.FC = () => {
  const renderActivityItem = ({ item }: { item: CommunityActivity }) => (
    <Card variant="default" padding={4}>
      <View style={styles.activityHeader}>
        <Text style={styles.userName}>{item.user}</Text>
        <Text style={styles.timestamp}>{item.timestamp}</Text>
      </View>
      <Text style={styles.activityContent}>{item.content}</Text>
    </Card>
  );

  const StatCard = ({ icon, title, value, color }: {
    icon: React.ReactNode;
    title: string;
    value: string;
    color: string;
  }) => (
    <Card variant="elevated" padding={4}>
      <View style={styles.statHeader}>
        <View style={[styles.iconContainer, { backgroundColor: color + '20' }]}>
          {icon}
        </View>
      </View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statTitle}>{title}</Text>
    </Card>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Communauté</Text>
          <Text style={styles.subtitle}>
            Découvrez l'activité de la communauté O'Ypunu
          </Text>
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <StatCard
                icon={<Users size={24} color={Colors.semantic.info} />}
                title="Utilisateurs actifs"
                value="1,234"
                color={Colors.semantic.info}
              />
            </View>
            <View style={styles.statItem}>
              <StatCard
                icon={<BookOpen size={24} color={Colors.semantic.success} />}
                title="Mots ajoutés"
                value="5,678"
                color={Colors.semantic.success}
              />
            </View>
          </View>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <StatCard
                icon={<Globe size={24} color={Colors.semantic.warning} />}
                title="Langues"
                value="42"
                color={Colors.semantic.warning}
              />
            </View>
            <View style={styles.statItem}>
              <StatCard
                icon={<TrendingUp size={24} color={Colors.gradient.accent[0]} />}
                title="Traductions"
                value="9,012"
                color={Colors.gradient.accent[0]}
              />
            </View>
          </View>
        </View>

        <View style={styles.activitySection}>
          <Text style={styles.sectionTitle}>Activité récente</Text>
          <FlatList
            data={mockCommunityActivity}
            renderItem={renderActivityItem}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
            contentContainerStyle={styles.activityList}
          />
        </View>
      </ScrollView>
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
    marginBottom: Spacing[2],
  },
  subtitle: {
    ...Typography.styles.bodyMedium,
    color: Colors.text.secondary,
  },
  statsContainer: {
    paddingHorizontal: Spacing[4],
    marginBottom: Spacing[6],
  },
  statsRow: {
    flexDirection: 'row',
    marginBottom: Spacing[3],
  },
  statItem: {
    flex: 1,
    marginHorizontal: Spacing[1],
  },
  statHeader: {
    marginBottom: Spacing[3],
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statValue: {
    ...Typography.styles.headingMedium,
    marginBottom: Spacing[1],
  },
  statTitle: {
    ...Typography.styles.caption,
    color: Colors.text.secondary,
  },
  activitySection: {
    paddingHorizontal: Spacing[4],
  },
  sectionTitle: {
    ...Typography.styles.headingMedium,
    marginBottom: Spacing[4],
  },
  activityList: {
    paddingBottom: Spacing[20],
  },
  activityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing[2],
  },
  userName: {
    ...Typography.styles.labelMedium,
    color: Colors.text.primary,
    fontWeight: '600',
  },
  timestamp: {
    ...Typography.styles.caption,
    color: Colors.text.tertiary,
  },
  activityContent: {
    ...Typography.styles.bodyMedium,
    color: Colors.text.secondary,
  },
});