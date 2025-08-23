/**
 * @fileoverview Register Screen Component
 * Follows SOLID principles - Single Responsibility for register UI
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAuth } from '../../core/hooks/useAuth';
import { Colors, Spacing, Typography } from '../../design-system';
import { Input, Button, SocialLoginButton } from '../../design-system/components';

export const RegisterScreen: React.FC = () => {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [username, setUsername] = useState('');
  const { register, socialLogin, isLoading, error } = useAuth();

  const handleRegister = async () => {
    // Validation
    if (!email || !password || !username) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Erreur', 'Les mots de passe ne correspondent pas');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Erreur', 'Le mot de passe doit contenir au moins 6 caractères');
      return;
    }

    try {
      await register({
        email,
        username,
        password,
        confirmPassword,
        acceptTerms: true,
      });
      
      // Navigate back to the previous screen (usually the profile tab)
      if (router.canGoBack()) {
        router.back();
      } else {
        router.push('/(tabs)');
      }
    } catch (error) {
      // Error is already handled by the hook and stored in state
      console.error('[RegisterScreen] Register error:', error);
    }
  };

  const handleSocialLogin = async (provider: 'google' | 'facebook' | 'twitter') => {
    try {
      await socialLogin(provider);
      
      // Navigate back to the previous screen (usually the profile tab)
      if (router.canGoBack()) {
        router.back();
      } else {
        router.push('/(tabs)');
      }
    } catch (error) {
      // Error is already handled by the hook and stored in state
      console.error(`[RegisterScreen] ${provider} login error:`, error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <Text style={styles.title}>Inscription</Text>
        <Text style={styles.subtitle}>Créez votre compte O'Ypunu</Text>

        <View style={styles.form}>
          {/* Social Login Options */}
          <View style={styles.socialSection}>
            <SocialLoginButton
              provider="google"
              onPress={() => handleSocialLogin('google')}
              disabled={isLoading}
              loading={isLoading}
            />
            <SocialLoginButton
              provider="facebook"
              onPress={() => handleSocialLogin('facebook')}
              disabled={isLoading}
              loading={isLoading}
            />
            <SocialLoginButton
              provider="twitter"
              onPress={() => handleSocialLogin('twitter')}
              disabled={isLoading}
              loading={isLoading}
            />
          </View>

          {/* Divider */}
          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>ou</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Email/Password Registration */}
          <Input
            placeholder="Nom d'utilisateur"
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
            autoComplete="username"
          />

          <Input
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
          />
          
          <Input
            placeholder="Mot de passe"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoComplete="new-password"
          />

          <Input
            placeholder="Confirmer le mot de passe"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
            autoComplete="new-password"
          />

          {error && (
            <Text style={styles.errorText}>{error}</Text>
          )}

          <Button
            title={isLoading ? "Inscription..." : "S'inscrire"}
            onPress={handleRegister}
            disabled={isLoading}
            variant="primary"
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
  scrollView: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: Spacing[6],
    justifyContent: 'center',
    paddingVertical: Spacing[8],
  },
  title: {
    ...Typography.styles.headingLarge,
    textAlign: 'center',
    marginBottom: Spacing[2],
  },
  subtitle: {
    ...Typography.styles.bodyLarge,
    color: Colors.text.secondary,
    textAlign: 'center',
    marginBottom: Spacing[8],
  },
  form: {
    gap: Spacing[4],
  },
  socialSection: {
    gap: Spacing[3],
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: Spacing[4],
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.interactive.default,
  },
  dividerText: {
    ...Typography.styles.bodyMedium,
    color: Colors.text.secondary,
    marginHorizontal: Spacing[4],
  },
  errorText: {
    ...Typography.styles.bodySmall,
    color: Colors.semantic.error,
    textAlign: 'center',
    marginBottom: Spacing[2],
  },
});