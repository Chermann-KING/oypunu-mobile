# 🎨 O'Ypunu Mobile Design System

_React Native + Expo | Version 1.0.0_

## 📋 Table des Matières

- [🎯 Philosophie du Design System](#-philosophie-du-design-system)
- [🎨 Tokens de Design](#-tokens-de-design)
- [📱 Composants de Base](#-composants-de-base)
- [🔧 Patterns d'Interaction](#-patterns-dinteraction)
- [📁 Structure & Guidelines](#-structure--guidelines)
- [🚀 Implémentation](#-implémentation)

---

## 🎯 Philosophie du Design System

### Principes Fondamentaux

1. **Cohérence Multi-Plateforme** : Expérience unifiée entre web et mobile
2. **Mobile-First** : Optimisé pour les interactions tactiles
3. **Accessibilité Native** : Support complet des technologies d'assistance
4. **Performance** : Composants optimisés pour React Native
5. **Évolutivité** : Architecture extensible et maintenable

### Adaptation Mobile de l'Identité O'Ypunu

- Conservation de l'ADN visuel dark theme
- Augmentation des zones tactiles (minimum 44px)
- Simplification des interactions complexes
- Priorisation du contenu sur petits écrans

---

## 🎨 Tokens de Design

### 🌈 Palette de Couleurs

```typescript
// src/design-system/tokens/colors.ts
export const Colors = {
  // Couleurs Principales (identiques web)
  primary: {
    50: "#f3f4f6", // gray-50
    100: "#e5e7eb", // gray-100
    200: "#d1d5db", // gray-200
    300: "#9ca3af", // gray-300
    400: "#6b7280", // gray-400
    500: "#374151", // gray-500
    600: "#1f2937", // gray-600
    700: "#111827", // gray-700
    800: "#030712", // gray-800 (background principal)
    900: "#000000", // Noir pur
  },

  // Gradients Signature O'Ypunu
  gradient: {
    primary: ["#9333ea", "#3b82f6"], // purple-600 to blue-500
    secondary: ["#7c3aed", "#2563eb"], // purple-700 to blue-600
    accent: ["#ec4899", "#f59e0b"], // pink-500 to amber-500
  },

  // Couleurs Sémantiques
  semantic: {
    success: "#10b981", // green-500
    warning: "#f59e0b", // amber-500
    error: "#ef4444", // red-500
    info: "#3b82f6", // blue-500
  },

  // États Interactifs
  interactive: {
    default: "#d1d5db", // gray-300
    hover: "#9ca3af", // gray-400
    pressed: "#6b7280", // gray-500
    disabled: "#374151", // gray-600
    focus: "#8b5cf6", // violet-500
  },

  // Texte & Contenus
  text: {
    primary: "#ffffff", // Texte principal
    secondary: "#d1d5db", // Texte secondaire
    tertiary: "#9ca3af", // Texte tertiaire
    disabled: "#6b7280", // Texte désactivé
    onPrimary: "#ffffff", // Texte sur fond coloré
  },

  // Surfaces & Backgrounds
  surface: {
    background: "#030712", // Background principal
    card: "#111827", // Cards et conteneurs
    elevated: "#1f2937", // Éléments surélevés
    overlay: "rgba(0, 0, 0, 0.8)", // Overlays modaux
  },
} as const;
```

### 📏 Espacement & Dimensionnement

```typescript
// src/design-system/tokens/spacing.ts
export const Spacing = {
  // Espacement de base (8px)
  0: 0,
  1: 4, // 0.25rem
  2: 8, // 0.5rem
  3: 12, // 0.75rem
  4: 16, // 1rem
  5: 20, // 1.25rem
  6: 24, // 1.5rem
  8: 32, // 2rem
  10: 40, // 2.5rem
  12: 48, // 3rem
  16: 64, // 4rem
  20: 80, // 5rem
  24: 96, // 6rem
} as const;

export const Layout = {
  // Contraintes de contenu
  container: {
    padding: 16,
    maxWidth: 428, // iPhone 14 Pro Max width
  },

  // Zones tactiles minimales
  touchTarget: {
    minimum: 44,
    comfortable: 56,
    large: 64,
  },

  // Hauteurs communes
  heights: {
    header: 64,
    tabBar: 80,
    input: 48,
    button: 48,
    card: 120,
  },

  // Rayons de bordure
  borderRadius: {
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
    full: 999,
  },
} as const;
```

### ✍️ Typographie Mobile

```typescript
// src/design-system/tokens/typography.ts
export const Typography = {
  // Font Family (Inter comme sur web)
  fontFamily: {
    regular: "Inter_400Regular",
    medium: "Inter_500Medium",
    semiBold: "Inter_600SemiBold",
    bold: "Inter_700Bold",
  },

  // Tailles optimisées mobile
  fontSize: {
    xs: 12, // Captions, badges
    sm: 14, // Body small, labels
    base: 16, // Body par défaut
    lg: 18, // Body large
    xl: 20, // Headings small
    "2xl": 24, // Headings medium
    "3xl": 28, // Headings large
    "4xl": 32, // Display small
    "5xl": 36, // Display medium
    "6xl": 40, // Display large
  },

  // Line Heights proportionnels
  lineHeight: {
    tight: 1.2,
    normal: 1.4,
    relaxed: 1.6,
  },

  // Styles prédéfinis
  styles: {
    displayLarge: {
      fontSize: 40,
      lineHeight: 48,
      fontFamily: "Inter_700Bold",
      letterSpacing: -0.5,
    },
    displayMedium: {
      fontSize: 36,
      lineHeight: 44,
      fontFamily: "Inter_700Bold",
      letterSpacing: -0.25,
    },
    headingLarge: {
      fontSize: 28,
      lineHeight: 36,
      fontFamily: "Inter_600SemiBold",
    },
    headingMedium: {
      fontSize: 24,
      lineHeight: 32,
      fontFamily: "Inter_600SemiBold",
    },
    headingSmall: {
      fontSize: 20,
      lineHeight: 28,
      fontFamily: "Inter_600SemiBold",
    },
    bodyLarge: {
      fontSize: 18,
      lineHeight: 28,
      fontFamily: "Inter_400Regular",
    },
    bodyMedium: {
      fontSize: 16,
      lineHeight: 24,
      fontFamily: "Inter_400Regular",
    },
    bodySmall: {
      fontSize: 14,
      lineHeight: 20,
      fontFamily: "Inter_400Regular",
    },
    labelLarge: {
      fontSize: 16,
      lineHeight: 24,
      fontFamily: "Inter_500Medium",
    },
    labelMedium: {
      fontSize: 14,
      lineHeight: 20,
      fontFamily: "Inter_500Medium",
    },
    labelSmall: {
      fontSize: 12,
      lineHeight: 16,
      fontFamily: "Inter_500Medium",
    },
    caption: {
      fontSize: 12,
      lineHeight: 16,
      fontFamily: "Inter_400Regular",
    },
  },
} as const;
```

---

## 📱 Composants de Base

### 🔘 Button Component

```typescript
// src/design-system/components/Button/Button.tsx
import React from "react";
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
} from "react-native";
import { Colors, Typography, Layout } from "../tokens";

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
  const containerStyle = [
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
  ];

  return (
    <TouchableOpacity
      style={containerStyle}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {icon && <View style={styles.icon}>{icon}</View>}
      <Text style={textStyle}>{loading ? "Chargement..." : title}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: {
    borderRadius: Layout.borderRadius.lg,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    minHeight: Layout.touchTarget.comfortable,
  },

  // Variants
  primary: {
    backgroundColor: Colors.gradient.primary[0], // Utiliser LinearGradient en pratique
  },
  secondary: {
    backgroundColor: Colors.surface.elevated,
    borderWidth: 1,
    borderColor: Colors.primary[600],
  },
  tertiary: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: Colors.primary[500],
  },
  ghost: {
    backgroundColor: "transparent",
  },

  // Sizes
  small: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    minHeight: 40,
  },
  medium: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    minHeight: 48,
  },
  large: {
    paddingHorizontal: 32,
    paddingVertical: 16,
    minHeight: 56,
  },

  // States
  disabled: {
    opacity: 0.5,
  },
  fullWidth: {
    width: "100%",
  },

  // Text styles
  text: {
    textAlign: "center",
    ...Typography.styles.labelMedium,
  },
  primaryText: {
    color: Colors.text.onPrimary,
  },
  secondaryText: {
    color: Colors.text.primary,
  },
  tertiaryText: {
    color: Colors.gradient.primary[0],
  },
  ghostText: {
    color: Colors.text.secondary,
  },

  smallText: {
    ...Typography.styles.labelSmall,
  },
  mediumText: {
    ...Typography.styles.labelMedium,
  },
  largeText: {
    ...Typography.styles.labelLarge,
  },

  icon: {
    marginRight: 8,
  },
});
```

### 📝 Input Component

```typescript
// src/design-system/components/Input/Input.tsx
import React, { useState } from "react";
import { TextInput, View, Text, StyleSheet } from "react-native";
import { Colors, Typography, Layout } from "../tokens";

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
  keyboardType?: "default" | "email-address" | "numeric" | "phone-pad";
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
  keyboardType = "default",
}) => {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}

      <View
        style={[
          styles.inputContainer,
          isFocused && styles.focused,
          error && styles.error,
          disabled && styles.disabled,
        ]}
      >
        {leftIcon && <View style={styles.leftIcon}>{leftIcon}</View>}

        <TextInput
          style={[styles.input, multiline && styles.multiline]}
          placeholder={placeholder}
          placeholderTextColor={Colors.text.tertiary}
          value={value}
          onChangeText={onChangeText}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          editable={!disabled}
          multiline={multiline}
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
          selectionColor={Colors.gradient.primary[0]}
        />

        {rightIcon && <View style={styles.rightIcon}>{rightIcon}</View>}
      </View>

      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    ...Typography.styles.labelMedium,
    color: Colors.text.secondary,
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.surface.card,
    borderWidth: 1,
    borderColor: Colors.primary[600],
    borderRadius: Layout.borderRadius.lg,
    minHeight: Layout.heights.input,
    paddingHorizontal: 16,
  },
  focused: {
    borderColor: Colors.gradient.primary[0],
    borderWidth: 2,
  },
  error: {
    borderColor: Colors.semantic.error,
  },
  disabled: {
    opacity: 0.5,
  },
  input: {
    flex: 1,
    ...Typography.styles.bodyMedium,
    color: Colors.text.primary,
    paddingVertical: 12,
  },
  multiline: {
    minHeight: 80,
    textAlignVertical: "top",
  },
  leftIcon: {
    marginRight: 12,
  },
  rightIcon: {
    marginLeft: 12,
  },
  errorText: {
    ...Typography.styles.caption,
    color: Colors.semantic.error,
    marginTop: 4,
    marginLeft: 4,
  },
});
```

### 🃏 Card Component

```typescript
// src/design-system/components/Card/Card.tsx
import React from "react";
import { View, StyleSheet, ViewStyle } from "react-native";
import { Colors, Layout } from "../tokens";

interface CardProps {
  children: React.ReactNode;
  variant?: "default" | "elevated" | "outlined";
  padding?: keyof typeof Layout.spacing;
  style?: ViewStyle;
  onPress?: () => void;
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = "default",
  padding = 4,
  style,
  onPress,
}) => {
  const Component = onPress ? TouchableOpacity : View;

  return (
    <Component
      style={[
        styles.base,
        styles[variant],
        { padding: Layout.spacing[padding] },
        style,
      ]}
      onPress={onPress}
      activeOpacity={onPress ? 0.8 : 1}
    >
      {children}
    </Component>
  );
};

const styles = StyleSheet.create({
  base: {
    borderRadius: Layout.borderRadius.lg,
    backgroundColor: Colors.surface.card,
  },
  default: {
    backgroundColor: Colors.surface.card,
  },
  elevated: {
    backgroundColor: Colors.surface.elevated,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  outlined: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: Colors.primary[600],
  },
});
```

### 📝 WordCard Component Mobile

```typescript
// src/design-system/components/WordCard/WordCard.tsx
import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { Colors, Typography, Layout } from "../tokens";

interface WordCardProps {
  word: string;
  language: string;
  pronunciation?: string;
  definition: string;
  category?: string;
  author: string;
  timeAgo: string;
  isFavorite: boolean;
  onPress: () => void;
  onFavoritePress: () => void;
}

export const WordCard: React.FC<WordCardProps> = ({
  word,
  language,
  pronunciation,
  definition,
  category,
  author,
  timeAgo,
  isFavorite,
  onPress,
  onFavoritePress,
}) => {
  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <LinearGradient
        colors={[Colors.surface.card, Colors.surface.elevated]}
        style={styles.gradient}
      >
        {/* Header avec mot et favori */}
        <View style={styles.header}>
          <View style={styles.wordInfo}>
            <Text style={styles.word} numberOfLines={1}>
              {word}
            </Text>
            <View style={styles.languageRow}>
              <Text style={styles.language}>{language}</Text>
              {pronunciation && (
                <Text style={styles.pronunciation}>/{pronunciation}/</Text>
              )}
            </View>
          </View>

          <TouchableOpacity
            style={styles.favoriteButton}
            onPress={onFavoritePress}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons
              name={isFavorite ? "bookmark" : "bookmark-outline"}
              size={24}
              color={
                isFavorite ? Colors.semantic.warning : Colors.text.tertiary
              }
            />
          </TouchableOpacity>
        </View>

        {/* Définition */}
        <Text style={styles.definition} numberOfLines={2}>
          {definition}
        </Text>

        {/* Tags et métadonnées */}
        <View style={styles.footer}>
          <View style={styles.tags}>
            {category && (
              <View style={styles.tag}>
                <Text style={styles.tagText}>{category}</Text>
              </View>
            )}
          </View>

          <View style={styles.metadata}>
            <Text style={styles.author}>@{author}</Text>
            <Text style={styles.timeAgo}>{timeAgo}</Text>
          </View>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
    borderRadius: Layout.borderRadius.xl,
    overflow: "hidden",
  },
  gradient: {
    padding: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  wordInfo: {
    flex: 1,
    marginRight: 16,
  },
  word: {
    ...Typography.styles.headingMedium,
    color: Colors.text.primary,
    marginBottom: 4,
  },
  languageRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
  },
  language: {
    ...Typography.styles.labelSmall,
    color: Colors.text.secondary,
    marginRight: 8,
  },
  pronunciation: {
    ...Typography.styles.labelSmall,
    color: Colors.text.tertiary,
    fontStyle: "italic",
  },
  favoriteButton: {
    padding: 8,
    borderRadius: Layout.borderRadius.full,
    backgroundColor: Colors.surface.background + "40",
  },
  definition: {
    ...Typography.styles.bodyMedium,
    color: Colors.text.secondary,
    marginBottom: 16,
    lineHeight: 22,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  tags: {
    flexDirection: "row",
    flex: 1,
  },
  tag: {
    backgroundColor: Colors.primary[700],
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: Layout.borderRadius.full,
    marginRight: 8,
  },
  tagText: {
    ...Typography.styles.labelSmall,
    color: Colors.text.secondary,
  },
  metadata: {
    alignItems: "flex-end",
  },
  author: {
    ...Typography.styles.caption,
    color: Colors.text.tertiary,
    marginBottom: 2,
  },
  timeAgo: {
    ...Typography.styles.caption,
    color: Colors.text.tertiary,
  },
});
```

---

## 🔧 Patterns d'Interaction

### 📱 Navigation Mobile

```typescript
// src/design-system/patterns/Navigation.tsx
import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors, Typography, Layout } from "../tokens";

interface TabBarProps {
  activeTab: string;
  onTabPress: (tab: string) => void;
}

export const TabBar: React.FC<TabBarProps> = ({ activeTab, onTabPress }) => {
  const tabs = [
    { id: "home", icon: "home", label: "Accueil" },
    { id: "dictionary", icon: "book", label: "Dictionnaire" },
    { id: "favorites", icon: "bookmark", label: "Favoris" },
    { id: "messages", icon: "chatbubble", label: "Messages" },
    { id: "profile", icon: "person", label: "Profil" },
  ];

  return (
    <View style={styles.container}>
      {tabs.map((tab) => (
        <TouchableOpacity
          key={tab.id}
          style={styles.tab}
          onPress={() => onTabPress(tab.id)}
          activeOpacity={0.7}
        >
          <Ionicons
            name={activeTab === tab.id ? tab.icon : `${tab.icon}-outline`}
            size={24}
            color={
              activeTab === tab.id
                ? Colors.gradient.primary[0]
                : Colors.text.tertiary
            }
          />
          <Text
            style={[
              styles.tabLabel,
              {
                color:
                  activeTab === tab.id
                    ? Colors.gradient.primary[0]
                    : Colors.text.tertiary,
              },
            ]}
          >
            {tab.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    backgroundColor: Colors.surface.card,
    paddingTop: 8,
    paddingBottom: 20, // Safe area
    borderTopWidth: 1,
    borderTopColor: Colors.primary[700],
  },
  tab: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 8,
  },
  tabLabel: {
    ...Typography.styles.caption,
    marginTop: 4,
  },
});
```

### 🔍 Search Pattern Mobile

```typescript
// src/design-system/patterns/SearchBar.tsx
import React, { useState } from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Animated,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors, Typography, Layout } from "../tokens";

interface SearchBarProps {
  placeholder?: string;
  onSearch: (query: string) => void;
  onFocus?: () => void;
  onBlur?: () => void;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  placeholder = "Rechercher un mot...",
  onSearch,
  onFocus,
  onBlur,
}) => {
  const [query, setQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const focusAnimation = new Animated.Value(0);

  const handleFocus = () => {
    setIsFocused(true);
    Animated.timing(focusAnimation, {
      toValue: 1,
      duration: 200,
      useNativeDriver: false,
    }).start();
    onFocus?.();
  };

  const handleBlur = () => {
    setIsFocused(false);
    Animated.timing(focusAnimation, {
      toValue: 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
    onBlur?.();
  };

  const handleSubmit = () => {
    if (query.trim()) {
      onSearch(query.trim());
    }
  };

  return (
    <Animated.View
      style={[
        styles.container,
        {
          borderColor: focusAnimation.interpolate({
            inputRange: [0, 1],
            outputRange: [Colors.primary[600], Colors.gradient.primary[0]],
          }),
          borderWidth: focusAnimation.interpolate({
            inputRange: [0, 1],
            outputRange: [1, 2],
          }),
        },
      ]}
    >
      <Ionicons
        name="search"
        size={20}
        color={isFocused ? Colors.gradient.primary[0] : Colors.text.tertiary}
        style={styles.searchIcon}
      />

      <TextInput
        style={styles.input}
        placeholder={placeholder}
        placeholderTextColor={Colors.text.tertiary}
        value={query}
        onChangeText={setQuery}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onSubmitEditing={handleSubmit}
        returnKeyType="search"
        selectionColor={Colors.gradient.primary[0]}
      />

      {query.length > 0 && (
        <TouchableOpacity
          onPress={() => setQuery("")}
          style={styles.clearButton}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons
            name="close-circle"
            size={20}
            color={Colors.text.tertiary}
          />
        </TouchableOpacity>
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.surface.card,
    borderRadius: Layout.borderRadius.xl,
    paddingHorizontal: 16,
    minHeight: 48,
    marginHorizontal: 16,
    marginVertical: 8,
  },
  searchIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    ...Typography.styles.bodyMedium,
    color: Colors.text.primary,
    paddingVertical: 12,
  },
  clearButton: {
    marginLeft: 8,
  },
});
```

### 🎨 Loading States & Animations

```typescript
// src/design-system/patterns/LoadingStates.tsx
import React, { useEffect } from "react";
import { View, Animated, Easing, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Colors, Layout } from "../tokens";

export const SkeletonLoader: React.FC<{ width?: number; height?: number }> = ({
  width = "100%",
  height = 20,
}) => {
  const animatedValue = new Animated.Value(0);

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(animatedValue, {
          toValue: 0,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, []);

  const opacity = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  return (
    <Animated.View
      style={[
        styles.skeleton,
        {
          width,
          height,
          opacity,
        },
      ]}
    />
  );
};

export const WordCardSkeleton: React.FC = () => (
  <View style={styles.wordCardSkeleton}>
    <View style={styles.skeletonHeader}>
      <SkeletonLoader width={120} height={24} />
      <SkeletonLoader width={24} height={24} />
    </View>
    <SkeletonLoader width="80%" height={16} />
    <SkeletonLoader width="60%" height={16} />
    <View style={styles.skeletonFooter}>
      <SkeletonLoader width={60} height={20} />
      <SkeletonLoader width={80} height={12} />
    </View>
  </View>
);

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: Colors.primary[700],
    borderRadius: Layout.borderRadius.sm,
  },
  wordCardSkeleton: {
    backgroundColor: Colors.surface.card,
    borderRadius: Layout.borderRadius.xl,
    padding: 20,
    marginBottom: 16,
  },
  skeletonHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  skeletonFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 16,
  },
});
```

---

## 📁 Structure & Guidelines

### 🗂️ Architecture de Fichiers

```
src/
├── design-system/
│   ├── tokens/
│   │   ├── colors.ts
│   │   ├── typography.ts
│   │   ├── spacing.ts
│   │   └── index.ts
│   ├── components/
│   │   ├── Button/
│   │   │   ├── Button.tsx
│   │   │   ├── Button.stories.tsx
│   │   │   ├── Button.test.tsx
│   │   │   └── index.ts
│   │   ├── Input/
│   │   ├── Card/
│   │   ├── WordCard/
│   │   └── index.ts
│   ├── patterns/
│   │   ├── Navigation.tsx
│   │   ├── SearchBar.tsx
│   │   ├── LoadingStates.tsx
│   │   └── index.ts
│   ├── utils/
│   │   ├── accessibility.ts
│   │   ├── responsive.ts
│   │   └── animations.ts
│   └── index.ts
├── components/        # Composants spécifiques à l'app
├── screens/          # Écrans de l'application
├── navigation/       # Configuration de navigation
└── services/         # Services et API
```

### 📱 Responsive Utilities

```typescript
// src/design-system/utils/responsive.ts
import { Dimensions, PixelRatio } from "react-native";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

export const Responsive = {
  // Breakpoints mobiles
  breakpoints: {
    small: 375, // iPhone SE
    medium: 414, // iPhone Plus
    large: 428, // iPhone Pro Max
  },

  // Fonctions utilitaires
  wp: (percentage: number) => (SCREEN_WIDTH * percentage) / 100,
  hp: (percentage: number) => (SCREEN_HEIGHT * percentage) / 100,

  // Font scaling basé sur la taille d'écran
  scale: (size: number) => {
    const baseWidth = 375; // iPhone SE comme référence
    const ratio = SCREEN_WIDTH / baseWidth;
    return Math.round(PixelRatio.roundToNearestPixel(size * ratio));
  },

  // Détection du type d'appareil
  isSmallDevice: () => SCREEN_WIDTH < 375,
  isMediumDevice: () => SCREEN_WIDTH >= 375 && SCREEN_WIDTH < 414,
  isLargeDevice: () => SCREEN_WIDTH >= 414,

  // Safe areas pour différents appareils
  getSafeAreaPadding: () => {
    if (SCREEN_HEIGHT >= 812) {
      // iPhone X et plus récents
      return { top: 44, bottom: 34 };
    }
    return { top: 20, bottom: 0 };
  },
};
```

### ♿ Accessibilité

```typescript
// src/design-system/utils/accessibility.ts
export const Accessibility = {
  // Tailles minimales recommandées
  touchTarget: {
    minimum: 44,
    recommended: 48,
  },

  // Contrastes de couleurs
  contrast: {
    minimum: 4.5, // WCAG AA
    enhanced: 7, // WCAG AAA
  },

  // Helpers pour les propriétés d'accessibilité
  button: (label: string, hint?: string) => ({
    accessible: true,
    accessibilityRole: "button" as const,
    accessibilityLabel: label,
    accessibilityHint: hint,
  }),

  text: (label: string) => ({
    accessible: true,
    accessibilityRole: "text" as const,
    accessibilityLabel: label,
  }),

  input: (label: string, value?: string) => ({
    accessible: true,
    accessibilityRole: "text" as const,
    accessibilityLabel: label,
    accessibilityValue: value ? { text: value } : undefined,
  }),

  // Helpers pour les gestes
  swipe: (direction: string, action: string) => ({
    accessibilityActions: [
      {
        name: "activate",
        label: `Glisser vers ${direction} pour ${action}`,
      },
    ],
  }),
};
```

---

## 🚀 Implémentation

### 📦 Configuration Package.json

```json
{
  "dependencies": {
    "expo": "~50.0.0",
    "expo-linear-gradient": "~12.7.0",
    "expo-font": "~11.10.0",
    "@expo/vector-icons": "^14.0.0",
    "react-native-reanimated": "~3.7.0",
    "react-native-gesture-handler": "~2.14.0",
    "react-native-safe-area-context": "4.8.2"
  },
  "devDependencies": {
    "@storybook/react-native": "^6.5.0",
    "@testing-library/react-native": "^12.0.0",
    "jest": "^29.0.0"
  }
}
```

### 🎨 Provider du Design System

```typescript
// src/design-system/DesignSystemProvider.tsx
import React, { createContext, useContext } from "react";
import { Colors, Typography, Layout } from "./tokens";

interface DesignSystemContextType {
  colors: typeof Colors;
  typography: typeof Typography;
  layout: typeof Layout;
  theme: "dark" | "light";
}

const DesignSystemContext = createContext<DesignSystemContextType | undefined>(
  undefined
);

export const DesignSystemProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const value: DesignSystemContextType = {
    colors: Colors,
    typography: Typography,
    layout: Layout,
    theme: "dark", // O'Ypunu utilise exclusivement le thème sombre
  };

  return (
    <DesignSystemContext.Provider value={value}>
      {children}
    </DesignSystemContext.Provider>
  );
};

export const useDesignSystem = () => {
  const context = useContext(DesignSystemContext);
  if (!context) {
    throw new Error(
      "useDesignSystem must be used within a DesignSystemProvider"
    );
  }
  return context;
};
```

### 📏 Hook Responsive

```typescript
// src/design-system/hooks/useResponsive.ts
import { useState, useEffect } from "react";
import { Dimensions } from "react-native";
import { Responsive } from "../utils/responsive";

export const useResponsive = () => {
  const [dimensions, setDimensions] = useState(() => Dimensions.get("window"));

  useEffect(() => {
    const subscription = Dimensions.addEventListener("change", ({ window }) => {
      setDimensions(window);
    });

    return () => subscription?.remove();
  }, []);

  return {
    width: dimensions.width,
    height: dimensions.height,
    wp: Responsive.wp,
    hp: Responsive.hp,
    scale: Responsive.scale,
    isSmall: Responsive.isSmallDevice(),
    isMedium: Responsive.isMediumDevice(),
    isLarge: Responsive.isLargeDevice(),
    safeArea: Responsive.getSafeAreaPadding(),
  };
};
```

### 🧪 Tests des Composants

```typescript
// src/design-system/components/Button/Button.test.tsx
import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import { Button } from "./Button";

describe("Button Component", () => {
  it("renders correctly", () => {
    const { getByText } = render(
      <Button title="Test Button" onPress={() => {}} />
    );
    expect(getByText("Test Button")).toBeTruthy();
  });

  it("calls onPress when pressed", () => {
    const onPressMock = jest.fn();
    const { getByText } = render(
      <Button title="Test Button" onPress={onPressMock} />
    );

    fireEvent.press(getByText("Test Button"));
    expect(onPressMock).toHaveBeenCalledTimes(1);
  });

  it("is disabled when disabled prop is true", () => {
    const onPressMock = jest.fn();
    const { getByText } = render(
      <Button title="Test Button" onPress={onPressMock} disabled />
    );

    fireEvent.press(getByText("Test Button"));
    expect(onPressMock).not.toHaveBeenCalled();
  });
});
```

### 📚 Storybook Configuration

```typescript
// src/design-system/components/Button/Button.stories.tsx
import type { Meta, StoryObj } from "@storybook/react-native";
import { Button } from "./Button";

const meta: Meta<typeof Button> = {
  title: "Design System/Button",
  component: Button,
  argTypes: {
    variant: {
      control: { type: "select" },
      options: ["primary", "secondary", "tertiary", "ghost"],
    },
    size: {
      control: { type: "select" },
      options: ["small", "medium", "large"],
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: {
    title: "Bouton Principal",
    variant: "primary",
    size: "medium",
  },
};

export const AllVariants: Story = {
  render: () => (
    <View style={{ gap: 16, padding: 16 }}>
      <Button title="Primary" variant="primary" onPress={() => {}} />
      <Button title="Secondary" variant="secondary" onPress={() => {}} />
      <Button title="Tertiary" variant="tertiary" onPress={() => {}} />
      <Button title="Ghost" variant="ghost" onPress={() => {}} />
    </View>
  ),
};
```

### 📋 Guidelines d'Utilisation

```typescript
// Guidelines.md intégré au design system

/**
 * RÈGLES STRICTES D'UTILISATION DU DESIGN SYSTEM O'YPUNU MOBILE
 *
 * 1. TOKENS OBLIGATOIRES
 *    - JAMAIS de couleurs hardcodées (#fff, 'red', etc.)
 *    - TOUJOURS utiliser Colors.* depuis les tokens
 *    - JAMAIS de tailles arbitraires, utiliser Spacing.*
 *
 * 2. COMPOSANTS APPROUVÉS
 *    - OBLIGATOIRE d'utiliser les composants du design system
 *    - Interdiction de créer des boutons custom sans validation
 *    - Tous les nouveaux composants doivent être validés par l'équipe design
 *
 * 3. ACCESSIBILITÉ
 *    - Zones tactiles minimum 44px (Layout.touchTarget.minimum)
 *    - Contraste respectant WCAG AA (4.5:1)
 *    - Labels accessibilité obligatoires sur tous les éléments interactifs
 *
 * 4. RESPONSIVE
 *    - Tests obligatoires sur iPhone SE (375px) et iPhone Pro Max (428px)
 *    - Utilisation du hook useResponsive() pour les adaptations
 *    - Pas de breakpoints custom sans validation
 *
 * 5. PERFORMANCE
 *    - Animations 60fps avec react-native-reanimated
 *    - Pas d'animations sur UI Thread (useNativeDriver: true)
 *    - Lazy loading obligatoire pour les listes > 20 items
 *
 * 6. TESTS
 *    - Coverage minimum 80% sur tous les composants du design system
 *    - Tests d'accessibilité automatisés
 *    - Tests Storybook pour tous les variants
 */

// Exemple d'utilisation CORRECTE
const ExampleScreen = () => {
  const { colors, spacing } = useDesignSystem();

  return (
    <View
      style={{
        backgroundColor: colors.surface.background, // ✅ Token approuvé
        padding: spacing[4], // ✅ Espacement standardisé
      }}
    >
      <Button
        title="Action principale"
        variant="primary" // ✅ Variant standardisé
        onPress={handlePress}
        {...Accessibility.button("Valider le formulaire")} // ✅ Accessibilité
      />
    </View>
  );
};

// Exemple INTERDIT ❌
const BadExample = () => (
  <View
    style={{
      backgroundColor: "#030712", // ❌ Couleur hardcodée
      padding: 15, // ❌ Espacement arbitraire
    }}
  >
    <TouchableOpacity
      style={{
        // ❌ Bouton custom non-standardisé
        backgroundColor: "purple", // ❌ Couleur non-standardisée
        padding: 10, // ❌ Zone tactile trop petite
      }}
    >
      <Text>Bouton</Text> {/* ❌ Pas d'accessibilité */}
    </TouchableOpacity>
  </View>
);
```

---

## 🎯 Conclusion

Ce design system pour **oypunu-mobile** garantit :

### ✅ **Cohérence Absolue**

- Tokens partagés avec la version web
- Composants standardisés et réutilisables
- Guidelines strictes avec exemples

### ✅ **Excellence Mobile**

- Interactions tactiles optimisées
- Performance native React Native
- Accessibilité WCAG AA complète

### ✅ **Maintenabilité**

- Architecture modulaire et extensible
- Tests automatisés complets
- Documentation intégrée

### ✅ **Évolutivité**

- Système de tokens centralisé
- Composants versionés
- Migration facilitée

Ce design system assure que **tous les développeurs** respecteront l'identité O'Ypunu tout en bénéficiant d'une excellente expérience de développement et d'une application mobile performante et accessible.

