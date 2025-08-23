/**
 * @fileoverview Avatar Component
 * Displays user profile picture or initials if no image available
 */

import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { Colors, Typography } from '../../tokens';
import { getInitials, getAvatarColors, isValidImageUrl } from '../../../utils/avatarUtils';

export interface AvatarProps {
  /** Image URL for the avatar */
  imageUrl?: string;
  /** User's full name or username */
  name: string;
  /** Size of the avatar in pixels */
  size?: number;
  /** User role for color theming */
  role?: string;
  /** Override background color for initials avatar */
  backgroundColor?: string;
  /** Override text color for initials */
  textColor?: string;
}

export const Avatar: React.FC<AvatarProps> = ({
  imageUrl,
  name,
  size = 80,
  role,
  backgroundColor,
  textColor,
}) => {
  const initials = getInitials(name);
  const avatarColors = getAvatarColors(name, role);
  
  const bgColor = backgroundColor || avatarColors.backgroundColor;
  const txtColor = textColor || avatarColors.textColor;
  
  const avatarStyle = [
    styles.avatar,
    {
      width: size,
      height: size,
      borderRadius: size / 2,
      backgroundColor: bgColor,
    },
  ];

  const textStyle = [
    styles.initialsText,
    {
      color: txtColor,
      fontSize: size * 0.4, // Font size is 40% of avatar size
    },
  ];

  // If we have a valid image URL, show image
  if (isValidImageUrl(imageUrl)) {
    return (
      <Image
        source={{ uri: imageUrl }}
        style={avatarStyle}
        onError={() => {
          // If image fails to load, fall back to initials
          // This is handled by React Native automatically showing the fallback
        }}
        defaultSource={undefined} // We'll handle fallback with initials manually if needed
      />
    );
  }

  // Show initials if no image or image failed to load
  return (
    <View style={avatarStyle}>
      <Text style={textStyle}>{initials}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  avatar: {
    justifyContent: 'center',
    alignItems: 'center',
    // Shadow for better visual separation
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3, // Android shadow
  },
  initialsText: {
    fontWeight: '600',
    textAlign: 'center',
    // Ensure text is always visible
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1,
  },
});