export const Typography = {
  fontFamily: {
    regular: "System",
    medium: "System", 
    semiBold: "System",
    bold: "System",
  },
  fontSize: {
    xs: 12, 
    sm: 14, 
    base: 16, 
    lg: 18, 
    xl: 20,
    "2xl": 24, 
    "3xl": 28, 
    "4xl": 32, 
    "5xl": 36, 
    "6xl": 40,
  },
  styles: {
    headingLarge: { 
      fontSize: 28, 
      lineHeight: 36, 
      fontWeight: "600" as const,
      color: "#ffffff"
    },
    headingMedium: { 
      fontSize: 24, 
      lineHeight: 32, 
      fontWeight: "600" as const,
      color: "#ffffff"
    },
    bodyLarge: { 
      fontSize: 18, 
      lineHeight: 28, 
      fontWeight: "400" as const,
      color: "#ffffff"
    },
    bodyMedium: { 
      fontSize: 16, 
      lineHeight: 24, 
      fontWeight: "400" as const,
      color: "#ffffff"
    },
    bodySmall: { 
      fontSize: 14, 
      lineHeight: 20, 
      fontWeight: "400" as const,
      color: "#ffffff"
    },
    labelMedium: { 
      fontSize: 14, 
      lineHeight: 20, 
      fontWeight: "500" as const,
      color: "#d1d5db"
    },
    caption: { 
      fontSize: 12, 
      lineHeight: 16, 
      fontWeight: "400" as const,
      color: "#9ca3af"
    },
  },
} as const;