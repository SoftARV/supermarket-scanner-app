import { useColorScheme } from 'react-native';

// ─── Mono + Ice palette ───────────────────────────────────────────
export const lightColors = {
  bg: '#f5f7fa',
  surface: '#ffffff',
  surface2: '#eef2f7',
  ink: '#0a0a0a',
  muted: '#71717a',
  hairline: 'rgba(0,0,0,0.08)',
  accent: '#3b82f6',
  accentInk: '#ffffff',
  accentSoft: '#dbeafe',
  pop: '#fb7185',
  // legacy aliases kept for components not yet migrated
  primary: '#3b82f6',
  danger: '#fb7185',
  background: '#f5f7fa',
  textPrimary: '#0a0a0a',
  textSecondary: '#71717a',
  border: 'rgba(0,0,0,0.08)',
  total: '#3b82f6',
  overlay: 'rgba(0,0,0,0.5)',
};

export const darkColors = {
  bg: '#0a0a0a',
  surface: '#161618',
  surface2: '#1d1d20',
  ink: '#fafafa',
  muted: '#a1a1aa',
  hairline: 'rgba(255,255,255,0.08)',
  accent: '#7dd3fc',
  accentInk: '#0a0a0a',
  accentSoft: 'rgba(125,211,252,0.15)',
  pop: '#fda4af',
  // legacy aliases
  primary: '#7dd3fc',
  danger: '#fda4af',
  background: '#0a0a0a',
  textPrimary: '#fafafa',
  textSecondary: '#a1a1aa',
  border: 'rgba(255,255,255,0.08)',
  total: '#7dd3fc',
  overlay: 'rgba(0,0,0,0.7)',
};

export type ColorTokens = typeof lightColors;

// ─── Typography ───────────────────────────────────────────────────
// Inter Tight for all UI · Fraunces only for totals and prices
export const fonts = {
  sans: '"Inter Tight", -apple-system, system-ui, sans-serif',
  serif: 'Fraunces_500Medium',
};

export const fontSizes = {
  caption: 11,
  body: 14,
  bodyLg: 16,
  title: 19,
  large: 24,
  price: 32,
  hero: 56,
};

// ─── Spacing ─────────────────────────────────────────────────────
export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

// ─── Shape ───────────────────────────────────────────────────────
export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 22,
  full: 999,
  sheet: 28,
};

// ─── Touch targets ───────────────────────────────────────────────
export const ITEM_HEIGHT = 68;

export const touchTarget = {
  min: 48,
  fab: 52,
  shutter: 76,
};

// ─── useTheme hook ───────────────────────────────────────────────
export function useTheme(): ColorTokens {
  const scheme = useColorScheme();
  return scheme === 'dark' ? darkColors : lightColors;
}

// Keep named export for components still importing `colors` directly
export const colors = lightColors;
