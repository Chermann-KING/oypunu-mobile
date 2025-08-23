/**
 * @fileoverview Social Login Button Component
 * Reusable button for social authentication providers
 */

import React from 'react';
import { TouchableOpacity, Text, View, StyleSheet } from 'react-native';
import { Colors, Spacing, Typography } from '../../tokens';

export interface SocialLoginButtonProps {
  provider: 'google' | 'facebook' | 'twitter';
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
}

const providerConfig = {
  google: {
    name: 'Google',
    backgroundColor: '#4285F4',
    textColor: '#FFFFFF',
    icon: '🔵', // In a real app, you'd use proper SVG icons
  },
  facebook: {
    name: 'Facebook',
    backgroundColor: '#1877F2',
    textColor: '#FFFFFF',
    icon: '📘',
  },
  twitter: {
    name: 'X (Twitter)',
    backgroundColor: '#000000',
    textColor: '#FFFFFF',
    icon: '⚫',
  },
};

export const SocialLoginButton: React.FC<SocialLoginButtonProps> = ({
  provider,
  onPress,
  disabled = false,
  loading = false,
}) => {
  const config = providerConfig[provider];
  
  const buttonStyle = [
    styles.button,
    { backgroundColor: config.backgroundColor },
    disabled && styles.disabled,
  ];

  const textStyle = [
    styles.text,
    { color: config.textColor },
    disabled && styles.disabledText,
  ];

  return (
    <TouchableOpacity
      style={buttonStyle}
      onPress={onPress}
      disabled={disabled || loading}
      accessibilityRole="button"
      accessibilityLabel={`Se connecter avec ${config.name}`}
    >
      <View style={styles.content}>
        <Text style={styles.icon}>{config.icon}</Text>
        <Text style={textStyle}>
          {loading ? 'Connexion...' : `Continuer avec ${config.name}`}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: 8,
    paddingHorizontal: Spacing[4],
    paddingVertical: Spacing[3],
    marginBottom: Spacing[3],
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  disabled: {
    opacity: 0.6,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    fontSize: 18,
    marginRight: Spacing[2],
  },
  text: {
    ...Typography.styles.bodyMedium,
    fontWeight: '600',
  },
  disabledText: {
    opacity: 0.7,
  },
});