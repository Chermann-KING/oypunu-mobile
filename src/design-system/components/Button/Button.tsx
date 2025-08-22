import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, View } from 'react-native';
import { Colors, Spacing, Layout, Typography } from '../../tokens';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: "primary" | "secondary" | "tertiary" | "ghost";
  size?: "small" | "medium" | "large"; 
  disabled?: boolean;
  fullWidth?: boolean;
  icon?: React.ReactNode;
  loading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = "primary",
  size = "medium",
  disabled = false,
  fullWidth = false,
  icon,
  loading = false,
}) => {
  const buttonStyle = [
    styles.base,
    styles[variant],
    styles[size],
    fullWidth && styles.fullWidth,
    disabled && styles.disabled,
  ];

  const textStyle = [
    styles.text,
    styles[`${variant}Text`],
    styles[`${size}Text`],
    disabled && styles.disabledText,
  ];

  return (
    <TouchableOpacity
      style={buttonStyle}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator color={variant === "primary" ? Colors.text.onPrimary : Colors.text.primary} />
      ) : (
        <View style={styles.content}>
          {icon && <View style={styles.icon}>{icon}</View>}
          <Text style={textStyle}>{title}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: {
    borderRadius: Layout.borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    minHeight: Layout.touchTarget.minimum,
  },
  primary: {
    backgroundColor: Colors.primary[600],
  },
  secondary: {
    backgroundColor: Colors.surface.elevated,
    borderWidth: 1,
    borderColor: Colors.primary[400],
  },
  tertiary: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: Colors.interactive.default,
  },
  ghost: {
    backgroundColor: 'transparent',
  },
  small: {
    paddingHorizontal: Spacing[3],
    paddingVertical: Spacing[2],
    minHeight: 36,
  },
  medium: {
    paddingHorizontal: Spacing[4],
    paddingVertical: Spacing[3],
    minHeight: Layout.heights.button,
  },
  large: {
    paddingHorizontal: Spacing[6],
    paddingVertical: Spacing[4],
    minHeight: Layout.touchTarget.large,
  },
  fullWidth: {
    width: '100%',
  },
  disabled: {
    backgroundColor: Colors.interactive.disabled,
    borderColor: Colors.interactive.disabled,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    marginRight: Spacing[2],
  },
  text: {
    fontWeight: '500',
    textAlign: 'center',
  },
  primaryText: {
    color: Colors.text.onPrimary,
    fontSize: Typography.fontSize.base,
  },
  secondaryText: {
    color: Colors.text.primary,
    fontSize: Typography.fontSize.base,
  },
  tertiaryText: {
    color: Colors.text.primary,
    fontSize: Typography.fontSize.base,
  },
  ghostText: {
    color: Colors.text.secondary,
    fontSize: Typography.fontSize.base,
  },
  smallText: {
    fontSize: Typography.fontSize.sm,
  },
  mediumText: {
    fontSize: Typography.fontSize.base,
  },
  largeText: {
    fontSize: Typography.fontSize.lg,
  },
  disabledText: {
    color: Colors.text.disabled,
  },
});