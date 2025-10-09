# 🎨 GlowDesk Theme System Guide

## Overview

GlowDesk now features a comprehensive, centralized theme management system that makes it easy to customize colors, support dark mode, and maintain consistency across the entire application.

## 📁 File Structure

```
src/
├── theme/
│   ├── colors.ts           # Central color definitions (SINGLE SOURCE OF TRUTH)
│   ├── antd.theme.ts       # Ant Design theme configuration
│   └── index.ts            # Main theme exports
├── hooks/
│   └── useThemeColors.ts   # React hook for theme colors
└── styles/
    └── index.scss          # CSS variables (synced with theme/colors.ts)
```

## 🚀 Quick Start

### Change Base Colors

To update your primary brand color across the entire app:

1. Open `src/theme/colors.ts`
2. Update the color values in `lightColors` and `darkColors`:

```typescript
// In lightColors
brand: {
  primary: '280 100% 50%',  // Change this HSL value
  // ...
}

// In darkColors  
brand: {
  primary: '280 100% 60%',  // Adjust for dark mode
  // ...
}
```

3. Save the file - **ALL components automatically update!** ✨

### Add New Theme Colors

1. Add to the `ColorPalette` interface in `src/theme/colors.ts`:

```typescript
export interface ColorPalette {
  // ... existing colors
  custom: string;  // Add your new color
}
```

2. Add values for both light and dark themes:

```typescript
export const lightColors: ColorPalette = {
  // ... existing colors
  custom: '200 80% 50%',  // Your light theme color
};

export const darkColors: ColorPalette = {
  // ... existing colors
  custom: '200 80% 60%',  // Your dark theme color
};
```

3. Add CSS variable in `src/styles/index.scss`:

```scss
:root {
  --custom: 200 80% 50%;
}

.dark {
  --custom: 200 80% 60%;
}
```

4. Use in components:

```tsx
<div className="bg-[hsl(var(--custom))] text-custom">
  Content
</div>
```

## 📚 Usage Examples

### Using Theme Colors in Components

#### Method 1: CSS Variables (Recommended)

```tsx
// Tailwind classes with CSS variables
<div className="bg-primary text-primary-foreground">
  Primary color background
</div>

// Custom HSL values
<div className="bg-[hsl(var(--status-confirmed-bg))]">
  Status color background
</div>
```

#### Method 2: Using the Hook

```tsx
import { useThemeColors } from '@/hooks/useThemeColors';

function MyComponent() {
  const { isDark, statusColors } = useThemeColors();
  
  return (
    <div style={{
      backgroundColor: `hsl(${statusColors.confirmed.bg})`,
      color: `hsl(${statusColors.confirmed.text})`
    }}>
      {isDark ? 'Dark mode' : 'Light mode'}
    </div>
  );
}
```

#### Method 3: Direct Import

```tsx
import { getColorPalette, toHSL } from '@/theme';

const colors = getColorPalette('light');
const primaryColor = toHSL(colors.brand.primary);
```

### Calendar Status Colors

All appointment status colors automatically adapt to the theme:

```tsx
// These classes automatically change in dark mode
<div className="bg-[hsl(var(--status-pending-bg))]">Pending</div>
<div className="bg-[hsl(var(--status-confirmed-bg))]">Confirmed</div>
<div className="bg-[hsl(var(--status-checked-in-bg))]">Checked In</div>
<div className="bg-[hsl(var(--status-in-progress-bg))]">In Progress</div>
<div className="bg-[hsl(var(--status-completed-bg))]">Completed</div>
<div className="bg-[hsl(var(--status-canceled-bg))]">Canceled</div>
<div className="bg-[hsl(var(--status-no-show-bg))]">No Show</div>
```

## 🎭 Ant Design Integration

Ant Design components automatically sync with your theme:

```tsx
import { Button, DatePicker, Table } from 'antd';

// All Ant Design components automatically use your theme colors
<Button type="primary">Matches your primary color</Button>
<DatePicker />  {/* Automatically themed */}
<Table />       {/* Automatically themed */}
```

To customize Ant Design further, edit `src/theme/antd.theme.ts`:

```typescript
export function getAntdTheme(mode: ThemeMode): ThemeConfig {
  return {
    token: {
      colorPrimary: hslToHex(colors.brand.primary),  // Customize this
      borderRadius: 12,  // Change component border radius
      // ... more customizations
    }
  };
}
```

## 🌓 Dark Mode

### Toggle Dark Mode

Users can toggle between light, dark, and system themes using the theme toggle in your UI.

### Testing Dark Mode

1. Click the theme toggle (usually in the top-right)
2. Or toggle system preferences (macOS: `System Settings > Appearance`)
3. Calendar and all components adapt automatically

### Calendar Dark Mode Features

- ✅ Proper text contrast in all lighting conditions
- ✅ Status colors optimized for dark backgrounds
- ✅ Grid lines and borders visible but subtle
- ✅ Hover states clearly visible
- ✅ Time labels easy to read

## 🔧 Advanced Customization

### Create a Custom Theme Preset

```typescript
// src/theme/presets.ts
export const oceanTheme: ColorPalette = {
  brand: {
    primary: '195 100% 45%',     // Ocean blue
    primaryForeground: '0 0% 100%',
    primaryHover: '195 100% 40%',
    primaryLight: '195 100% 85%',
    from: '195 100% 45%',
    to: '160 84% 39%',           // Teal
  },
  // ... rest of the palette
};

export const sunsetTheme: ColorPalette = {
  brand: {
    primary: '14 100% 57%',      // Orange
    primaryForeground: '0 0% 100%',
    primaryHover: '14 100% 52%',
    primaryLight: '14 100% 85%',
    from: '14 100% 57%',
    to: '340 82% 52%',           // Pink
  },
  // ... rest of the palette
};
```

### Dynamic Theme Switching

```tsx
import { applyThemeToCSS } from '@/theme';

function ThemeSwitcher() {
  const handleThemeSwitch = (theme: 'light' | 'dark') => {
    applyThemeToCSS(theme);
  };
  
  return (
    <select onChange={(e) => handleThemeSwitch(e.target.value as any)}>
      <option value="light">Light</option>
      <option value="dark">Dark</option>
    </select>
  );
}
```

## 📖 Color Format (HSL)

All colors use HSL format: `hue saturation% lightness%`

**Why HSL?**
- Easy to adjust brightness (lightness)
- Easy to adjust saturation
- Better for generating color variations
- Consistent with Tailwind's design system

**Examples:**
- `39 100% 50%` = Orange (#FFA500)
- `217 91% 60%` = Blue
- `142 76% 36%` = Green
- `0 84% 60%` = Red

**Converting to HSL:**
- Use online tools like [HSL Color Picker](https://hslpicker.com/)
- Or use browser DevTools color picker

## 🎨 Available CSS Variables

### Base Colors
```css
--background          /* Page background */
--foreground          /* Text color */
--card                /* Card background */
--card-foreground     /* Card text */
--popover             /* Popover background */
--popover-foreground  /* Popover text */
```

### Brand Colors
```css
--primary             /* Primary brand color */
--primary-foreground  /* Text on primary */
--primary-hover       /* Primary hover state */
--primary-light       /* Light version of primary */
--brand-from          /* Gradient start */
--brand-to            /* Gradient end */
```

### Status Colors
```css
--success             /* Success/complete */
--warning             /* Warning/pending */
--destructive         /* Error/danger */
```

### Calendar-Specific
```css
--calendar-header-bg    /* Calendar header background */
--calendar-header-text  /* Calendar header text */
--calendar-grid-border  /* Grid line color */
--calendar-time-bg      /* Time column background */
--calendar-time-text    /* Time labels */
--calendar-slot-hover   /* Hover state for time slots */
```

### Appointment Status Colors
Each status has three variants:
```css
--status-{status}-bg      /* Background color */
--status-{status}-border  /* Border color */
--status-{status}-text    /* Text color */
```

Where `{status}` is one of:
- `pending`
- `confirmed`
- `checked-in`
- `in-progress`
- `completed`
- `canceled`
- `no-show`

## 🐛 Troubleshooting

### Colors Not Updating

1. **Clear browser cache**: Hard refresh (Cmd/Ctrl + Shift + R)
2. **Check CSS variable syntax**: Use `hsl(var(--variable))` not `var(--variable)`
3. **Restart dev server**: Stop and run `npm run dev` again

### Dark Mode Not Working

1. Check theme provider is wrapping your app in `main.tsx`
2. Verify `darkMode: ["class"]` in `tailwind.config.ts`
3. Check CSS variables are defined in both `:root` and `.dark` in `index.scss`

### Ant Design Colors Don't Match

1. Verify `ConfigProvider` wraps your app in `App.tsx`
2. Check `getAntdTheme()` is being called with correct theme
3. Ensure Ant Design CSS is imported: `import 'antd/dist/reset.css'`

## 📝 Best Practices

1. ✅ **Always use theme variables** instead of hardcoded colors
2. ✅ **Test in both light and dark modes** before committing
3. ✅ **Use semantic names** for custom colors (e.g., `--brand-primary` not `--orange`)
4. ✅ **Update both light AND dark themes** when adding colors
5. ✅ **Use HSL format** for consistency
6. ❌ **Never use hardcoded hex colors** like `#FFA500` in components
7. ❌ **Don't bypass the theme system** with inline styles using fixed colors

## 🎯 Common Tasks

### Change Primary Color
Edit `src/theme/colors.ts` → `lightColors.brand.primary`

### Add New Status Type
1. Add to `AppointmentStatusColors` interface
2. Add light colors to `lightAppointmentColors`
3. Add dark colors to `darkAppointmentColors`
4. Add CSS variables to `index.scss`

### Change Dark Mode Colors
Edit `src/theme/colors.ts` → `darkColors`

### Customize Ant Design
Edit `src/theme/antd.theme.ts` → `getAntdTheme()`

## 🆘 Support

If you have questions or need help customizing the theme:

1. Check this guide first
2. Review example code in `src/components/calendar/`
3. Check the TypeScript definitions in `src/theme/colors.ts`
4. Ensure your changes follow the HSL color format

---

**Pro Tip:** Bookmark this file for quick reference! 📌

