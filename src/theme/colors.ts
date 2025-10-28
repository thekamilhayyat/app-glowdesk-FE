/**
 * Central Color Definitions for GlowFlowApp
 * 
 * This file is the SINGLE SOURCE OF TRUTH for all colors in the application.
 * Update colors here to automatically propagate changes throughout the entire app.
 * 
 * All colors are in HSL format for better manipulation and consistency.
 */

export type ThemeMode = 'light' | 'dark';

export interface ColorPalette {
  // Brand Colors
  brand: {
    from: string;
    to: string;
    primary: string;
    primaryForeground: string;
    primaryHover: string;
    primaryLight: string;
  };
  
  // Base Colors
  background: string;
  foreground: string;
  
  // Surface Colors
  card: string;
  cardForeground: string;
  popover: string;
  popoverForeground: string;
  
  // UI Element Colors
  secondary: string;
  secondaryForeground: string;
  secondaryHover: string;
  
  muted: string;
  mutedForeground: string;
  
  accent: string;
  accentForeground: string;
  
  // Status Colors
  success: string;
  successForeground: string;
  warning: string;
  warningForeground: string;
  destructive: string;
  destructiveForeground: string;
  
  // Interactive Elements
  border: string;
  input: string;
  ring: string;
  
  // Sidebar
  sidebar: {
    background: string;
    foreground: string;
    primary: string;
    primaryForeground: string;
    accent: string;
    accentForeground: string;
    border: string;
    ring: string;
  };
}

export interface AppointmentStatusColors {
  pending: { bg: string; border: string; text: string };
  confirmed: { bg: string; border: string; text: string };
  'checked-in': { bg: string; border: string; text: string };
  'in-progress': { bg: string; border: string; text: string };
  completed: { bg: string; border: string; text: string };
  canceled: { bg: string; border: string; text: string };
  'no-show': { bg: string; border: string; text: string };
}

/**
 * Light Theme Color Palette
 */
export const lightColors: ColorPalette = {
  brand: {
    from: '39 100% 50%',           // Orange #FFA500
    to: '195 100% 50%',            // Blue #00BFFF
    primary: '39 100% 50%',
    primaryForeground: '0 0% 100%',
    primaryHover: '39 100% 45%',
    primaryLight: '39 100% 85%',
  },
  
  background: '0 0% 100%',         // White
  foreground: '225 9% 9%',         // Dark text
  
  card: '0 0% 100%',
  cardForeground: '225 9% 9%',
  popover: '0 0% 100%',
  popoverForeground: '225 9% 9%',
  
  secondary: '210 40% 96%',
  secondaryForeground: '222 84% 22%',
  secondaryHover: '210 40% 92%',
  
  muted: '210 40% 96%',
  mutedForeground: '215 16% 47%',
  accent: '210 40% 96%',
  accentForeground: '222 84% 22%',
  
  success: '142 76% 36%',
  successForeground: '210 40% 98%',
  warning: '38 92% 50%',
  warningForeground: '0 0% 9%',
  destructive: '0 84% 60%',
  destructiveForeground: '210 40% 98%',
  
  border: '214 32% 91%',
  input: '214 32% 91%',
  ring: '222 84% 22%',
  
  sidebar: {
    background: '0 0% 98%',
    foreground: '240 5.3% 26.1%',
    primary: '240 5.9% 10%',
    primaryForeground: '0 0% 98%',
    accent: '240 4.8% 95.9%',
    accentForeground: '240 5.9% 10%',
    border: '220 13% 91%',
    ring: '217.2 91.2% 59.8%',
  },
};

/**
 * Dark Theme Color Palette
 */
export const darkColors: ColorPalette = {
  brand: {
    from: '39 100% 55%',           // Brighter orange for dark bg
    to: '195 100% 60%',            // Brighter blue for dark bg
    primary: '222 84% 65%',
    primaryForeground: '222 47% 6%',
    primaryHover: '222 84% 70%',
    primaryLight: '222 84% 15%',
  },
  
  background: '222 47% 6%',        // Dark navy
  foreground: '210 40% 98%',       // Light text
  
  card: '222 47% 8%',
  cardForeground: '210 40% 98%',
  popover: '222 47% 8%',
  popoverForeground: '210 40% 98%',
  
  secondary: '222 47% 12%',
  secondaryForeground: '210 40% 98%',
  secondaryHover: '222 47% 16%',
  
  muted: '222 47% 12%',
  mutedForeground: '215 20% 65%',
  accent: '222 47% 12%',
  accentForeground: '210 40% 98%',
  
  success: '142 76% 45%',          // Brighter for dark bg
  successForeground: '210 40% 98%',
  warning: '38 92% 60%',           // Brighter for dark bg
  warningForeground: '0 0% 9%',
  destructive: '0 63% 60%',        // Adjusted for dark bg
  destructiveForeground: '210 40% 98%',
  
  border: '222 47% 15%',
  input: '222 47% 15%',
  ring: '222 84% 65%',
  
  sidebar: {
    background: '240 5.9% 10%',
    foreground: '240 4.8% 95.9%',
    primary: '224.3 76.3% 48%',
    primaryForeground: '0 0% 100%',
    accent: '240 3.7% 15.9%',
    accentForeground: '240 4.8% 95.9%',
    border: '240 3.7% 15.9%',
    ring: '217.2 91.2% 59.8%',
  },
};

/**
 * Appointment Status Colors for Light Theme
 */
export const lightAppointmentColors: AppointmentStatusColors = {
  pending: {
    bg: '38 92% 95%',
    border: '38 92% 50%',
    text: '38 92% 25%',
  },
  confirmed: {
    bg: '217 91% 95%',
    border: '217 91% 60%',
    text: '217 91% 25%',
  },
  'checked-in': {
    bg: '271 81% 95%',
    border: '271 81% 56%',
    text: '271 81% 25%',
  },
  'in-progress': {
    bg: '340 82% 95%',
    border: '340 82% 62%',
    text: '340 82% 25%',
  },
  completed: {
    bg: '210 40% 96%',
    border: '220 13% 60%',
    text: '220 13% 30%',
  },
  canceled: {
    bg: '0 84% 95%',
    border: '0 84% 60%',
    text: '0 84% 30%',
  },
  'no-show': {
    bg: '45 93% 95%',
    border: '45 93% 47%',
    text: '45 93% 25%',
  },
};

/**
 * Appointment Status Colors for Dark Theme
 */
export const darkAppointmentColors: AppointmentStatusColors = {
  pending: {
    bg: '38 92% 15%',
    border: '38 92% 60%',
    text: '38 92% 85%',
  },
  confirmed: {
    bg: '217 91% 15%',
    border: '217 91% 65%',
    text: '217 91% 85%',
  },
  'checked-in': {
    bg: '271 81% 15%',
    border: '271 81% 65%',
    text: '271 81% 85%',
  },
  'in-progress': {
    bg: '340 82% 15%',
    border: '340 82% 70%',
    text: '340 82% 85%',
  },
  completed: {
    bg: '222 47% 12%',
    border: '215 20% 50%',
    text: '215 20% 75%',
  },
  canceled: {
    bg: '0 63% 15%',
    border: '0 63% 60%',
    text: '0 63% 80%',
  },
  'no-show': {
    bg: '45 93% 15%',
    border: '45 93% 60%',
    text: '45 93% 85%',
  },
};

/**
 * Get color palette based on theme mode
 */
export function getColorPalette(mode: ThemeMode): ColorPalette {
  return mode === 'dark' ? darkColors : lightColors;
}

/**
 * Get appointment status colors based on theme mode
 */
export function getAppointmentStatusColors(mode: ThemeMode): AppointmentStatusColors {
  return mode === 'dark' ? darkAppointmentColors : lightAppointmentColors;
}

/**
 * Helper to convert HSL string to hsl() CSS function
 */
export function toHSL(hslString: string): string {
  return `hsl(${hslString})`;
}

/**
 * Helper to get RGB values from HSL for Ant Design
 */
export function hslToHex(hslString: string): string {
  const [h, s, l] = hslString.split(' ').map(v => parseFloat(v));
  
  const hue = h;
  const saturation = s / 100;
  const lightness = l / 100;
  
  const c = (1 - Math.abs(2 * lightness - 1)) * saturation;
  const x = c * (1 - Math.abs((hue / 60) % 2 - 1));
  const m = lightness - c / 2;
  
  let r = 0, g = 0, b = 0;
  
  if (hue >= 0 && hue < 60) {
    r = c; g = x; b = 0;
  } else if (hue >= 60 && hue < 120) {
    r = x; g = c; b = 0;
  } else if (hue >= 120 && hue < 180) {
    r = 0; g = c; b = x;
  } else if (hue >= 180 && hue < 240) {
    r = 0; g = x; b = c;
  } else if (hue >= 240 && hue < 300) {
    r = x; g = 0; b = c;
  } else {
    r = c; g = 0; b = x;
  }
  
  const toHex = (n: number) => {
    const hex = Math.round((n + m) * 255).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };
  
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

