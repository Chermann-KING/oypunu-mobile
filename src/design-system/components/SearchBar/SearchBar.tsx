import React, { useState } from 'react';
import { View, TextInput, StyleSheet, ActivityIndicator } from 'react-native';
import { Search } from 'lucide-react-native';
import { Colors, Spacing, Layout, Typography } from '../../tokens';

interface SearchBarProps {
  placeholder?: string;
  onSearch: (query: string) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  loading?: boolean;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  placeholder = "Rechercher un mot...",
  onSearch,
  onFocus,
  onBlur,
  loading = false,
}) => {
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  const handleChangeText = (text: string) => {
    setQuery(text);
    onSearch(text);
  };

  const handleFocus = () => {
    setIsFocused(true);
    onFocus?.();
  };

  const handleBlur = () => {
    setIsFocused(false);
    onBlur?.();
  };

  const containerStyle = [
    styles.container,
    isFocused && styles.focused,
  ];

  return (
    <View style={containerStyle}>
      {loading ? (
        <ActivityIndicator size="small" color={Colors.text.tertiary} style={styles.icon} />
      ) : (
        <Search size={20} color={Colors.text.tertiary} style={styles.icon} />
      )}
      <TextInput
        style={styles.input}
        value={query}
        onChangeText={handleChangeText}
        placeholder={placeholder}
        placeholderTextColor={Colors.text.tertiary}
        onFocus={handleFocus}
        onBlur={handleBlur}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface.card,
    borderRadius: Layout.borderRadius.full,
    paddingHorizontal: Spacing[4],
    paddingVertical: Spacing[3],
    marginHorizontal: Spacing[4],
    marginBottom: Spacing[4],
    borderWidth: 1,
    borderColor: Colors.interactive.default,
  },
  focused: {
    borderColor: Colors.interactive.focus,
  },
  icon: {
    marginRight: Spacing[3],
  },
  input: {
    flex: 1,
    ...Typography.styles.bodyMedium,
    paddingVertical: 0,
  },
});