/**
 * @fileoverview Avatar Utilities
 * Helper functions for avatar generation and processing
 */

/**
 * Generate initials from a name or username
 * 
 * @param name - Full name or username
 * @returns Two-letter initials or single letter if only one word
 * 
 * @example
 * getInitials("John Doe") // "JD"
 * getInitials("Marshall_LeRoi") // "ML"  
 * getInitials("Alice") // "A"
 * getInitials("jean-pierre martin") // "JM"
 */
export const getInitials = (name: string): string => {
  if (!name || typeof name !== 'string') return '?';
  
  // Clean and normalize the name
  const cleanName = name
    .replace(/[_-]/g, ' ') // Replace underscores and hyphens with spaces
    .replace(/[^a-zA-Z\s]/g, '') // Remove non-alphabetic characters except spaces
    .trim();

  if (!cleanName) return '?';
  
  const words = cleanName
    .split(/\s+/)
    .filter(word => word.length > 0);

  if (words.length === 0) return '?';
  if (words.length === 1) return words[0].charAt(0).toUpperCase();
  
  // Take first letter of first and last word
  return (words[0].charAt(0) + words[words.length - 1].charAt(0)).toUpperCase();
};

/**
 * Generate a consistent background color based on a string
 * Same input always produces same color
 * 
 * @param input - String to hash for color generation
 * @returns HSL color string
 */
export const generateConsistentColor = (input: string): string => {
  if (!input || typeof input !== 'string') {
    return 'hsl(200, 70%, 50%)'; // Default blue
  }
  
  // Simple hash function
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    hash = input.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  // Generate HSL color with good contrast and saturation
  const hue = Math.abs(hash) % 360;
  
  // Ensure good contrast by avoiding very light or very dark colors
  // Use higher saturation for vibrant colors
  return `hsl(${hue}, 75%, 55%)`;
};

/**
 * Get avatar colors based on name/role
 * 
 * @param name - User name for color generation
 * @param role - Optional user role for specific color schemes
 * @returns Object with background and text colors
 */
export const getAvatarColors = (name: string, role?: string) => {
  // Role-specific color schemes (optional)
  const roleColors: Record<string, string> = {
    admin: 'hsl(25, 75%, 55%)',      // Orange
    superadmin: 'hsl(0, 75%, 55%)',  // Red
    contributor: 'hsl(150, 75%, 45%)', // Green
    user: 'hsl(210, 75%, 55%)',      // Blue
  };
  
  const backgroundColor = role && roleColors[role] 
    ? roleColors[role] 
    : generateConsistentColor(name);
    
  // Always use white text for good contrast on colored backgrounds
  const textColor = '#FFFFFF';
  
  return { backgroundColor, textColor };
};

/**
 * Check if a URL is likely a valid image URL
 * 
 * @param url - URL to validate
 * @returns true if URL looks like an image
 */
export const isValidImageUrl = (url?: string): boolean => {
  if (!url || typeof url !== 'string') return false;
  
  // Basic URL validation
  try {
    new URL(url);
  } catch {
    return false;
  }
  
  // Check for common image extensions
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'];
  const lowerUrl = url.toLowerCase();
  
  return imageExtensions.some(ext => lowerUrl.includes(ext)) ||
         lowerUrl.includes('gravatar') ||
         lowerUrl.includes('avatar') ||
         lowerUrl.includes('profile');
};

// Test the initials function with common cases
if (__DEV__) {
  console.log('[Avatar Utils] Testing initials generation:');
  console.log('Marshall_LeRoi ->', getInitials('Marshall_LeRoi')); // Should be "ML"
  console.log('John Doe ->', getInitials('John Doe')); // Should be "JD"  
  console.log('Alice ->', getInitials('Alice')); // Should be "A"
  console.log('jean-pierre martin ->', getInitials('jean-pierre martin')); // Should be "JM"
}