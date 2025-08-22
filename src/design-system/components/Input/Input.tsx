import React, { useState } from 'react';
import { View, TextInput, Text, StyleSheet } from 'react-native';
import { Colors, Spacing, Layout, Typography } from '../../tokens';

interface InputProps {
  label?: string;
  placeholder?: string;
  value: string;
  onChangeText: (text: string) => void;
  error?: string;
  disabled?: boolean;
  multiline?: boolean;
  secureTextEntry?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input: React.FC<InputProps> = ({
  label,
  placeholder,
  value,
  onChangeText,
  error,
  disabled = false,
  multiline = false,
  secureTextEntry = false,
  leftIcon,
  rightIcon,
}) => {
  const [isFocused, setIsFocused] = useState(false);

  const inputContainerStyle = [
    styles.inputContainer,
    isFocused && styles.focused,
    error && styles.error,
    disabled && styles.disabled,
  ];

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={inputContainerStyle}>
        {leftIcon && <View style={styles.leftIcon}>{leftIcon}</View>}
        <TextInput
          style={[styles.input, multiline && styles.multiline]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={Colors.text.tertiary}
          editable={!disabled}
          multiline={multiline}
          secureTextEntry={secureTextEntry}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        />
        {rightIcon && <View style={styles.rightIcon}>{rightIcon}</View>}
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing[4],
  },
  label: {
    ...Typography.styles.labelMedium,
    marginBottom: Spacing[2],
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface.card,
    borderRadius: Layout.borderRadius.md,
    borderWidth: 1,
    borderColor: Colors.interactive.default,
    minHeight: Layout.heights.input,
    paddingHorizontal: Spacing[4],
  },
  focused: {
    borderColor: Colors.interactive.focus,
  },
  error: {
    borderColor: Colors.semantic.error,
  },
  disabled: {
    backgroundColor: Colors.interactive.disabled,
    borderColor: Colors.interactive.disabled,
  },
  input: {
    flex: 1,
    ...Typography.styles.bodyMedium,
    paddingVertical: Spacing[3],
  },
  multiline: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  leftIcon: {
    marginRight: Spacing[3],
  },
  rightIcon: {
    marginLeft: Spacing[3],
  },
  errorText: {
    ...Typography.styles.caption,
    color: Colors.semantic.error,
    marginTop: Spacing[1],
  },
});