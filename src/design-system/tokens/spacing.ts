export const Spacing = {
  0: 0, 
  1: 4, 
  2: 8, 
  3: 12, 
  4: 16, 
  5: 20, 
  6: 24, 
  8: 32, 
  10: 40, 
  12: 48, 
  16: 64, 
  20: 80, 
  24: 96,
} as const;

export const Layout = {
  touchTarget: { minimum: 44, comfortable: 56, large: 64 },
  heights: { header: 64, tabBar: 80, input: 48, button: 48 },
  borderRadius: { sm: 4, md: 8, lg: 12, xl: 16, full: 999 },
  container: { padding: 16, maxWidth: 428 },
} as const;