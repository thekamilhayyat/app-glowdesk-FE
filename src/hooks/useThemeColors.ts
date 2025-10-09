/**
 * Custom hook for accessing theme colors in React components
 * 
 * This hook provides easy access to the current theme colors without
 * needing to manually read CSS variables or import color definitions.
 * 
 * @example
 * ```tsx
 * const { statusColors, isDark } = useThemeColors();
 * const bgColor = statusColors.confirmed.bg;
 * ```
 */

import { useTheme } from '@/components/ui/theme-provider';
import { getAppointmentStatusColors, ThemeMode } from '@/theme';

export function useThemeColors() {
  const { theme } = useTheme();
  
  // Determine actual theme (resolve 'system' to 'light' or 'dark')
  const actualTheme: ThemeMode = theme === 'system'
    ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
    : (theme as ThemeMode);
  
  const isDark = actualTheme === 'dark';
  const statusColors = getAppointmentStatusColors(actualTheme);
  
  return {
    theme: actualTheme,
    isDark,
    isLight: !isDark,
    statusColors,
  };
}

