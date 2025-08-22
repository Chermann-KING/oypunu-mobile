import React from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Settings, Heart, BookOpen, Award, Edit3 } from 'lucide-react-native';
import { Colors, Spacing, Typography } from '../design-system';
import { Card, Button } from '../design-system/components';
import { mockUser } from '../data/mockData';

export const ProfileScreen: React.FC = () => {
  const StatItem = ({ icon, label, value }: {
    icon: React.ReactNode;
    label: string;
    value: number;
  }) => (
    <View style={styles.statItem}>
      <View style={styles.statIcon}>{icon}</View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Profil</Text>
          <TouchableOpacity>
            <Settings size={24} color={Colors.text.secondary} />
          </TouchableOpacity>
        </View>

        <Card variant="elevated" padding={6}>
          <View style={styles.profileHeader}>
            <Image source={{ uri: mockUser.avatar }} style={styles.avatar} />
            <View style={styles.profileInfo}>
              <Text style={styles.userName}>{mockUser.name}</Text>
              <Text style={styles.userRole}>Contributeur actif</Text>
            </View>
            <TouchableOpacity style={styles.editButton}>
              <Edit3 size={20} color={Colors.text.secondary} />
            </TouchableOpacity>
          </View>

          <View style={styles.statsContainer}>
            <StatItem
              icon={<BookOpen size={20} color={Colors.semantic.success} />}
              label="Mots ajoutés"
              value={mockUser.wordsAdded}
            />
            <StatItem
              icon={<Heart size={20} color={Colors.semantic.error} />}
              label="Favoris"
              value={mockUser.favorites}
            />
            <StatItem
              icon={<Award size={20} color={Colors.semantic.warning} />}
              label="Contributions"
              value={mockUser.contributions}
            />
          </View>
        </Card>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Mes activités</Text>
          
          <Card variant="default" padding={4} onPress={() => console.log('Mes mots')}>
            <View style={styles.menuItem}>
              <BookOpen size={20} color={Colors.text.secondary} />
              <Text style={styles.menuText}>Mes mots</Text>
            </View>
          </Card>

          <Card variant="default" padding={4} onPress={() => console.log('Mes favoris')}>
            <View style={styles.menuItem}>
              <Heart size={20} color={Colors.text.secondary} />
              <Text style={styles.menuText}>Mes favoris</Text>
            </View>
          </Card>

          <Card variant="default" padding={4} onPress={() => console.log('Mes contributions')}>
            <View style={styles.menuItem}>
              <Award size={20} color={Colors.text.secondary} />
              <Text style={styles.menuText}>Mes contributions</Text>
            </View>
          </Card>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Paramètres</Text>
          
          <Card variant="default" padding={4} onPress={() => console.log('Notifications')}>
            <View style={styles.menuItem}>
              <Text style={styles.menuText}>Notifications</Text>
            </View>
          </Card>

          <Card variant="default" padding={4} onPress={() => console.log('Langue')}>
            <View style={styles.menuItem}>
              <Text style={styles.menuText}>Langue de l'interface</Text>
            </View>
          </Card>

          <Card variant="default" padding={4} onPress={() => console.log('À propos')}>
            <View style={styles.menuItem}>
              <Text style={styles.menuText}>À propos d'O'Ypunu</Text>
            </View>
          </Card>
        </View>

        <View style={styles.buttonContainer}>
          <Button
            title="Déconnexion"
            onPress={() => console.log('Logout')}
            variant="tertiary"
            fullWidth
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing[4],
    paddingVertical: Spacing[4],
  },
  title: {
    ...Typography.styles.headingLarge,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing[6],
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: Spacing[4],
  },
  profileInfo: {
    flex: 1,
  },
  userName: {
    ...Typography.styles.headingMedium,
    marginBottom: Spacing[1],
  },
  userRole: {
    ...Typography.styles.labelMedium,
    color: Colors.text.secondary,
  },
  editButton: {
    padding: Spacing[2],
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statIcon: {
    marginBottom: Spacing[2],
  },
  statValue: {
    ...Typography.styles.headingMedium,
    marginBottom: Spacing[1],
  },
  statLabel: {
    ...Typography.styles.caption,
    color: Colors.text.secondary,
    textAlign: 'center',
  },
  section: {
    paddingHorizontal: Spacing[4],
    marginTop: Spacing[6],
  },
  sectionTitle: {
    ...Typography.styles.headingMedium,
    marginBottom: Spacing[4],
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuText: {
    ...Typography.styles.bodyMedium,
    marginLeft: Spacing[3],
  },
  buttonContainer: {
    paddingHorizontal: Spacing[4],
    paddingVertical: Spacing[8],
  },
});