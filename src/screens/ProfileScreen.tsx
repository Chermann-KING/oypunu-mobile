import React from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Settings, Heart, BookOpen, Award, Edit3, LogIn } from 'lucide-react-native';
import { Colors, Spacing, Typography } from '../design-system';
import { Card, Button, Avatar } from '../design-system/components';
import { useAuth } from '../core/hooks/useAuth';
import { mockUser } from '../data/mockData';

export const ProfileScreen: React.FC = () => {
  const router = useRouter();
  const { user, isAuthenticated, logout, isLoading } = useAuth();

  // Function to translate user roles to French
  const getRoleDisplayName = (role: string): string => {
    const roleTranslations: Record<string, string> = {
      user: 'Utilisateur',
      contributor: 'Contributeur',
      admin: 'Administrateur',
      superadmin: 'Super Administrateur',
    };
    
    return roleTranslations[role] || role;
  };

  // Function to get role color
  const getRoleColor = (role: string): string => {
    const roleColors: Record<string, string> = {
      user: Colors.semantic.info,
      contributor: Colors.semantic.success,
      admin: Colors.semantic.warning,
      superadmin: Colors.semantic.error,
    };
    
    return roleColors[role] || Colors.text.secondary;
  };
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

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Show login prompt if not authenticated
  if (!isAuthenticated) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContainer}>
          <LogIn size={64} color={Colors.text.secondary} />
          <Text style={styles.loginTitle}>Connectez-vous à O'Ypunu</Text>
          <Text style={styles.loginSubtitle}>
            Accédez à votre profil, vos favoris et contribuez au dictionnaire
          </Text>
          
          <View style={styles.loginButtons}>
            <Button
              title="Se connecter"
              onPress={() => router.push('/(auth)/login')}
              variant="primary"
              fullWidth
            />
            <Button
              title="S'inscrire"
              onPress={() => router.push('/(auth)/register')}
              variant="secondary"
              fullWidth
            />
          </View>
        </View>
      </SafeAreaView>
    );
  }

  // Use real user data if authenticated, fallback to mock for demo
  const currentUser = user || mockUser;

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
              <Avatar
                imageUrl={currentUser.avatar}
                name={currentUser.username || currentUser.name || mockUser.name}
                role={user?.role}
                size={80}
              />
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.userName}>{currentUser.username || currentUser.name || mockUser.name}</Text>
              <Text 
                style={[
                  styles.userRole, 
                  { color: isAuthenticated && user?.role ? getRoleColor(user.role) : Colors.text.secondary }
                ]}
              >
                {isAuthenticated && user?.role 
                  ? getRoleDisplayName(user.role) 
                  : 'Contributeur actif'
                }
              </Text>
            </View>
            <TouchableOpacity style={styles.editButton}>
              <Edit3 size={20} color={Colors.text.secondary} />
            </TouchableOpacity>
          </View>

          <View style={styles.statsContainer}>
            <StatItem
              icon={<BookOpen size={20} color={Colors.semantic.success} />}
              label="Mots ajoutés"
              value={currentUser.wordsAdded || mockUser.wordsAdded}
            />
            <StatItem
              icon={<Heart size={20} color={Colors.semantic.error} />}
              label="Favoris"
              value={currentUser.favorites || mockUser.favorites}
            />
            <StatItem
              icon={<Award size={20} color={Colors.semantic.warning} />}
              label="Contributions"
              value={currentUser.contributions || mockUser.contributions}
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
            title={isLoading ? "Déconnexion..." : "Déconnexion"}
            onPress={handleLogout}
            variant="tertiary"
            fullWidth
            disabled={isLoading}
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
  avatarContainer: {
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
  loginButtons: {
    width: '100%',
    gap: Spacing[4],
  },
});