/**
 * EchLearn - Code-First Figma Design System Tokens
 * Top 0.1% EdTech Visual Identity & Component Specification
 */

export const FIGMA_DESIGN_SYSTEM = {
  name: 'EchLearn Design System v2.0',
  version: '2.0.0',
  theme: {
    primary: {
      50: '#ecfdf5',
      100: '#d1fae5',
      200: '#a7f3d0',
      300: '#6ee7b7',
      400: '#34d399',
      500: '#10b981', // Core Emerald Green
      600: '#059669',
      700: '#047857',
      800: '#065f46',
      900: '#064e3b',
    },
    duolingoGreen: {
      main: '#58cc02',
      hover: '#46a302',
      border: '#357c02',
    },
    duolingoGold: {
      main: '#ffc800',
      hover: '#e5b200',
      border: '#cc8e00',
    },
    neutralLight: {
      background: '#f8fafc',
      surface: '#ffffff',
      surfaceSubtle: '#f1f5f9',
      border: '#e2e8f0',
      textPrimary: '#0f172a',
      textSecondary: '#475569',
      textMuted: '#94a3b8',
    },
    neutralDark: {
      background: '#020617',
      surface: '#0f172a',
      surfaceSubtle: '#1e293b',
      border: '#1e293b',
      textPrimary: '#f8fafc',
      textSecondary: '#cbd5e1',
      textMuted: '#64748b',
    },
  },
  typography: {
    fontFamily: "'Plus Jakarta Sans', 'Inter', system-ui, sans-serif",
    headings: {
      h1: 'text-3xl sm:text-4xl font-extrabold tracking-tight',
      h2: 'text-2xl sm:text-3xl font-extrabold tracking-tight',
      h3: 'text-xl font-bold tracking-normal',
      h4: 'text-lg font-bold tracking-normal',
    },
    body: {
      regular: 'text-sm font-normal leading-relaxed',
      medium: 'text-sm font-medium leading-relaxed',
      bold: 'text-sm font-bold leading-relaxed',
    },
  },
  shadows: {
    cardLight: '0 4px 20px -2px rgba(0, 0, 0, 0.05), 0 2px 6px -1px rgba(0, 0, 0, 0.02)',
    cardHover: '0 12px 30px -4px rgba(16, 185, 129, 0.12), 0 4px 12px -2px rgba(0, 0, 0, 0.04)',
    button3D: '0 4px 0 #357c02',
  },
  radii: {
    button: 'rounded-2xl',
    card: 'rounded-3xl',
    badge: 'rounded-full',
  },
} as const;

export type FigmaDesignSystem = typeof FIGMA_DESIGN_SYSTEM;
