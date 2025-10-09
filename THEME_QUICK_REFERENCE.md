# 🎨 Theme System - Quick Reference Card

## 🚀 Most Common Tasks

### Change Primary Color
```typescript
// File: src/theme/colors.ts

// Light mode
lightColors.brand.primary = '280 100% 50%'  // Your HSL color

// Dark mode  
darkColors.brand.primary = '280 100% 60%'   // Slightly lighter
```

### Use Theme Colors in Components
```tsx
// Method 1: Tailwind CSS (Recommended)
<div className="bg-primary text-primary-foreground">
  Themed button
</div>

// Method 2: CSS Variables
<div className="bg-[hsl(var(--status-confirmed-bg))]">
  Status badge
</div>

// Method 3: React Hook
import { useThemeColors } from '@/hooks/useThemeColors';
const { isDark, statusColors } = useThemeColors();
```

### Add New Color
```typescript
// 1. Add to interface (colors.ts)
export interface ColorPalette {
  myColor: string;
}

// 2. Add to light theme
export const lightColors = {
  myColor: '200 80% 50%',
};

// 3. Add to dark theme  
export const darkColors = {
  myColor: '200 80% 60%',
};

// 4. Add CSS variable (index.scss)
:root {
  --my-color: 200 80% 50%;
}
.dark {
  --my-color: 200 80% 60%;
}

// 5. Use it
<div className="bg-[hsl(var(--my-color))]">Content</div>
```

## 📁 Key Files

| File | Purpose |
|------|---------|
| `src/theme/colors.ts` | **EDIT THIS** to change colors |
| `src/theme/antd.theme.ts` | Customize Ant Design |
| `src/styles/index.scss` | CSS variables |
| `THEME_GUIDE.md` | Complete documentation |

## 🎨 Color Format

All colors use **HSL**: `hue saturation% lightness%`

Examples:
- Orange: `39 100% 50%`
- Blue: `217 91% 60%`
- Purple: `280 100% 50%`
- Green: `142 76% 36%`

**Find HSL colors:** [hslpicker.com](https://hslpicker.com/)

## 🌓 Available CSS Variables

### Most Used
```css
--primary              /* Your brand color */
--background           /* Page background */
--foreground           /* Text color */
--card                 /* Card background */
--border               /* Border color */
--muted-foreground     /* Secondary text */
```

### Calendar
```css
--calendar-header-bg
--calendar-grid-border
--calendar-time-text
```

### Status Colors
```css
--status-pending-bg
--status-confirmed-bg
--status-checked-in-bg
--status-in-progress-bg
--status-completed-bg
--status-canceled-bg
--status-no-show-bg
```

## ⚡ Common Patterns

### Card with Status
```tsx
<div className="bg-card border border-border rounded-lg p-4">
  <div className="bg-[hsl(var(--status-confirmed-bg))] 
                  border-[hsl(var(--status-confirmed-border))] 
                  text-[hsl(var(--status-confirmed-text))]">
    Confirmed
  </div>
</div>
```

### Themed Button
```tsx
<button className="bg-primary text-primary-foreground 
                   hover:bg-primary-hover rounded-md px-4 py-2">
  Click Me
</button>
```

### Dark Mode Check
```tsx
import { useThemeColors } from '@/hooks/useThemeColors';

function MyComponent() {
  const { isDark } = useThemeColors();
  return <div>{isDark ? '🌙' : '☀️'}</div>;
}
```

## 🔧 Troubleshooting

| Problem | Solution |
|---------|----------|
| Colors not updating | Clear cache, hard refresh (Cmd+Shift+R) |
| Dark mode broken | Check `.dark` class on `<html>` element |
| Ant Design wrong color | Verify `ConfigProvider` in App.tsx |
| Can't see variable | Check spelling in `index.scss` |

## 📚 Learn More

- **Full Guide:** `THEME_GUIDE.md`
- **Implementation Details:** `THEME_IMPLEMENTATION_SUMMARY.md`
- **Source Code:** `src/theme/colors.ts`

## 💡 Remember

✅ Always use theme variables, never hardcoded colors
✅ Test in both light AND dark mode
✅ Update both light and dark theme values
✅ Use HSL format for consistency

---

**Need Help?** Check `THEME_GUIDE.md` for detailed examples! 📖

