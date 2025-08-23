import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Settings, Heart, BookOpen, Award, Edit3 } from 'lucide-react-native';
import { Colors, Spacing, Typography } from '../../design-system';
import { Card, Button, Avatar } from '../../design-system/components';
import { useAuth } from '../../core/hooks/useAuth';
import { useFavoritesStatsAPI } from '../../core/hooks/useFavorites';
import { useDictionaryContributor } from '../../core/hooks/useDictionary';
import { useUserStats } from '../../core/hooks/useUserStats';
import GuestProfileScreen from './GuestProfileScreen';

/**
 * ProfileScreen
 * 
 * Ecran de profil pour utilisateur authentifié.
 * Affiche l’avatar, les infos de rôle, les statistiques personnelles,
 * les accès aux sections (mots, favoris, contributions) et les réglages.
 * Si l’utilisateur n’est pas authentifié, délègue à GuestProfileScreen.
 */
export const ProfileScreen: React.FC = () => {
  const router = useRouter();
  const { user, isAuthenticated, logout, isLoading } = useAuth();

  // Stats hooks
  const { stats: favoritesStats, isLoadingStats, loadStats } = useFavoritesStatsAPI();
  const { getContributionStats } = useDictionaryContributor();
  const {
    userStats,
    contributionStats,
    isLoadingUserStats,
    isLoadingContributionStats,
    loadUserStats,
    loadContributionStats,
  } = useUserStats();

  useEffect(() => {
    if (isAuthenticated && user && user.id) {
      // Load user stats
      loadUserStats().catch((error) => console.error('Failed to load user stats:', error));
      // Load favorites stats
      loadStats().catch((error) => console.error('Failed to load favorites stats:', error));
      // Load contribution stats if contributor+
      if (user.role !== 'user') {
        loadContributionStats().catch((error) => console.error('Failed to load contribution stats:', error));
        getContributionStats().catch((error) => console.error('Failed to load dictionary contribution stats:', error));
      }
    }
  }, [isAuthenticated, user?.id]);

  const getRoleDisplayName = (role: string): string => {
    const names: Record<string, string> = {
      user: 'Utilisateur',
      contributor: 'Contributeur',
      admin: 'Administrateur',
      superadmin: 'Super Administrateur',
    };
    return names[role] || role;
  };

  const getRoleColor = (role: string): string => {
    const colors: Record<string, string> = {
      user: Colors.semantic.info,
      contributor: Colors.semantic.success,
      admin: Colors.semantic.warning,
      superadmin: Colors.semantic.error,
    };
    return colors[role] || Colors.text.secondary;
  };

  const StatItem = ({
    icon,
    label,
    value,
    loading = false,
  }: {
    icon: React.ReactNode;
    label: string;
    value: number;
    loading?: boolean;
  }) => (
    <View style={styles.statItem}>
      <View style={styles.statIcon}>{icon}</View>
      {loading ? (
        <ActivityIndicator size="small" color={Colors.text.primary} />
      ) : (
        <Text style={styles.statValue}>{value}</Text>
      )}
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  if (!isAuthenticated || !user) return <GuestProfileScreen />;

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
            <View style={styles.avatarContainer}>
              <Avatar imageUrl={user.avatar} name={user.username || user.name} role={user.role} size={80} />
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.userName}>{user.username || user.name}</Text>
              <Text style={[styles.userRole, { color: getRoleColor(user.role) }]}>
                {getRoleDisplayName(user.role)}
              </Text>
            </View>
            <TouchableOpacity style={styles.editButton}>
              <Edit3 size={20} color={Colors.text.secondary} />
            </TouchableOpacity>
          </View>

          <View style={styles.statsContainer}>
            <StatItem icon={<BookOpen size={20} color={Colors.semantic.success} />} label="Mots ajoutés" value={userStats?.totalWordsAdded ?? 0} loading={isLoadingUserStats} />
            <StatItem icon={<Heart size={20} color={Colors.semantic.error} />} label="Favoris" value={userStats?.favoriteWordsCount ?? favoritesStats?.totalFavorites ?? 0} loading={isLoadingUserStats || isLoadingStats} />
            <StatItem icon={<Award size={20} color={Colors.semantic.warning} />} label="Contributions" value={contributionStats?.wordsAdded ?? userStats?.totalCommunityPosts ?? 0} loading={isLoadingContributionStats || isLoadingUserStats} />
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
          <Button title={isLoading ? 'Déconnexion...' : 'Déconnexion'} onPress={handleLogout} variant="tertiary" fullWidth disabled={isLoading} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.surface.background },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: Spacing[4], paddingVertical: Spacing[4] },
  title: { ...Typography.styles.headingLarge },
  profileHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: Spacing[6] },
  avatarContainer: { marginRight: Spacing[4] },
  profileInfo: { flex: 1 },
  userName: { ...Typography.styles.headingMedium, marginBottom: Spacing[1] },
  userRole: { ...Typography.styles.labelMedium, color: Colors.text.secondary },
  editButton: { padding: Spacing[2] },
  statsContainer: { flexDirection: 'row', justifyContent: 'space-around' },
  statItem: { alignItems: 'center' },
  statIcon: { marginBottom: Spacing[2] },
  statValue: { ...Typography.styles.headingMedium, marginBottom: Spacing[1] },
  statLabel: { ...Typography.styles.caption, color: Colors.text.secondary, textAlign: 'center' },
  section: { paddingHorizontal: Spacing[4], marginTop: Spacing[6] },
  sectionTitle: { ...Typography.styles.headingMedium, marginBottom: Spacing[4] },
  menuItem: { flexDirection: 'row', alignItems: 'center' },
  menuText: { ...Typography.styles.bodyMedium, marginLeft: Spacing[3] },
  buttonContainer: { paddingHorizontal: Spacing[4], paddingVertical: Spacing[8] },
});

export default ProfileScreen;
