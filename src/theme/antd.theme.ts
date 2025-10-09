/**
 * Ant Design Theme Configuration
 * 
 * Integrates Ant Design components with GlowDesk theme system.
 * Automatically syncs with light/dark mode.
 */

import { ThemeConfig } from 'antd';
import { theme as antdTheme } from 'antd';
import { getColorPalette, hslToHex, ThemeMode } from './colors';

const { defaultAlgorithm, darkAlgorithm } = antdTheme;

/**
 * Generate Ant Design theme configuration based on current theme mode
 */
export function getAntdTheme(mode: ThemeMode): ThemeConfig {
  const colors = getColorPalette(mode);
  const isDark = mode === 'dark';

  return {
    algorithm: isDark ? darkAlgorithm : defaultAlgorithm,
    token: {
      // Brand Colors
      colorPrimary: hslToHex(colors.brand.primary),
      colorSuccess: hslToHex(colors.success),
      colorWarning: hslToHex(colors.warning),
      colorError: hslToHex(colors.destructive),
      colorInfo: hslToHex(colors.brand.to),
      
      // Background Colors
      colorBgBase: hslToHex(colors.background),
      colorBgContainer: hslToHex(colors.card),
      colorBgElevated: hslToHex(colors.popover),
      colorBgLayout: hslToHex(colors.background),
      colorBgSpotlight: hslToHex(colors.muted),
      
      // Text Colors
      colorText: hslToHex(colors.foreground),
      colorTextSecondary: hslToHex(colors.mutedForeground),
      colorTextTertiary: hslToHex(colors.mutedForeground),
      colorTextQuaternary: hslToHex(colors.mutedForeground),
      
      // Border Colors
      colorBorder: hslToHex(colors.border),
      colorBorderSecondary: hslToHex(colors.border),
      
      // Typography
      fontSize: 14,
      fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
      fontWeightStrong: 600,
      
      // Border Radius
      borderRadius: 12,
      borderRadiusLG: 16,
      borderRadiusSM: 8,
      borderRadiusXS: 6,
      
      // Spacing
      marginXS: 8,
      marginSM: 12,
      margin: 16,
      marginMD: 20,
      marginLG: 24,
      marginXL: 32,
      
      // Control Heights
      controlHeight: 36,
      controlHeightLG: 44,
      controlHeightSM: 28,
      
      // Shadows
      boxShadow: isDark
        ? '0 1px 2px 0 rgba(0, 0, 0, 0.5), 0 1px 6px -1px rgba(0, 0, 0, 0.4)'
        : '0 1px 2px 0 rgba(0, 0, 0, 0.03), 0 1px 6px -1px rgba(0, 0, 0, 0.02)',
      boxShadowSecondary: isDark
        ? '0 6px 16px 0 rgba(0, 0, 0, 0.32), 0 3px 6px -4px rgba(0, 0, 0, 0.48)'
        : '0 6px 16px 0 rgba(0, 0, 0, 0.08), 0 3px 6px -4px rgba(0, 0, 0, 0.12)',
      
      // Motion
      motionUnit: 0.1,
      motionBase: 0,
      motionEaseInOut: 'cubic-bezier(0.645, 0.045, 0.355, 1)',
      motionEaseOut: 'cubic-bezier(0.215, 0.61, 0.355, 1)',
      
      // Line Heights
      lineHeight: 1.5715,
      lineHeightHeading1: 1.2,
      lineHeightHeading2: 1.3,
      lineHeightHeading3: 1.4,
      
      // Z-Index
      zIndexBase: 0,
      zIndexPopupBase: 1000,
    },
    components: {
      // Button
      Button: {
        primaryShadow: 'none',
        algorithm: true,
        controlHeight: 36,
        fontWeight: 500,
      },
      
      // Input
      Input: {
        controlHeight: 36,
        activeBorderColor: hslToHex(colors.ring),
        hoverBorderColor: hslToHex(colors.ring),
      },
      
      // Select
      Select: {
        controlHeight: 36,
        optionSelectedBg: hslToHex(colors.accent),
      },
      
      // DatePicker
      DatePicker: {
        controlHeight: 36,
        cellHoverBg: hslToHex(colors.accent),
        cellActiveWithRangeBg: hslToHex(colors.brand.primaryLight),
      },
      
      // Modal
      Modal: {
        contentBg: hslToHex(colors.card),
        headerBg: hslToHex(colors.card),
        borderRadiusLG: 16,
      },
      
      // Drawer
      Drawer: {
        colorBgElevated: hslToHex(colors.card),
      },
      
      // Table
      Table: {
        headerBg: hslToHex(colors.muted),
        rowHoverBg: hslToHex(colors.accent),
        borderColor: hslToHex(colors.border),
      },
      
      // Card
      Card: {
        colorBgContainer: hslToHex(colors.card),
        borderRadiusLG: 12,
      },
      
      // Tag
      Tag: {
        borderRadiusSM: 6,
      },
      
      // Message
      Message: {
        contentBg: hslToHex(colors.popover),
      },
      
      // Notification
      Notification: {
        colorBgElevated: hslToHex(colors.popover),
      },
      
      // Tooltip
      Tooltip: {
        colorBgSpotlight: hslToHex(isDark ? '222 47% 12%' : '225 9% 9%'),
      },
      
      // Menu
      Menu: {
        itemBg: hslToHex(colors.background),
        itemSelectedBg: hslToHex(colors.accent),
        itemActiveBg: hslToHex(colors.accent),
      },
      
      // Dropdown
      Dropdown: {
        controlItemBgActive: hslToHex(colors.accent),
        controlItemBgActiveHover: hslToHex(colors.accentForeground),
      },
    },
  };
}

/**
 * Get CSS variable value from computed styles
 */
export function getCSSVariable(variable: string): string {
  if (typeof window === 'undefined') return '';
  
  const value = getComputedStyle(document.documentElement)
    .getPropertyValue(variable)
    .trim();
  
  return value;
}

/**
 * Apply theme to CSS custom properties
 */
export function applyThemeToCSS(mode: ThemeMode): void {
  const colors = getColorPalette(mode);
  const root = document.documentElement;

  // Apply all color variables
  Object.entries(colors).forEach(([key, value]) => {
    if (typeof value === 'object' && value !== null) {
      // Handle nested objects (like brand, sidebar)
      Object.entries(value).forEach(([nestedKey, nestedValue]) => {
        const cssVar = `--${key}-${nestedKey.replace(/([A-Z])/g, '-$1').toLowerCase()}`;
        root.style.setProperty(cssVar, nestedValue as string);
      });
    } else {
      const cssVar = `--${key.replace(/([A-Z])/g, '-$1').toLowerCase()}`;
      root.style.setProperty(cssVar, value as string);
    }
  });
}

