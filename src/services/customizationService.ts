import { accentPalettes, getAccentPalette, getMascotSkin, mascotSkins } from '../data/customization';

const shade = (hex: string, amount: number) => {
  const raw = hex.replace('#', '');
  const num = parseInt(raw.length === 3 ? raw.split('').map((c) => c + c).join('') : raw, 16);
  let r = (num >> 16) + amount;
  let g = ((num >> 8) & 0xff) + amount;
  let b = (num & 0xff) + amount;
  r = Math.max(0, Math.min(255, r));
  g = Math.max(0, Math.min(255, g));
  b = Math.max(0, Math.min(255, b));
  return '#' + (b | (g << 8) | (r << 16)).toString(16).padStart(6, '0');
};

export type CosmeticSettings = {
  accentPaletteId: string;
  mascotSkinId: string;
  uiSurface: 'glass' | 'solid' | 'cozy' | 'compact';
  mascotAnimation: boolean;
  seasonalEffects: boolean;
};

export function applyCosmeticSettings(settings: CosmeticSettings) {
  if (typeof document === 'undefined') return;
  const palette = getAccentPalette(settings.accentPaletteId);
  const skin = getMascotSkin(settings.mascotSkinId);
  const root = document.documentElement;

  root.style.setProperty('--color-primary-50', shade(palette.primary, 118));
  root.style.setProperty('--color-primary-100', shade(palette.primary, 98));
  root.style.setProperty('--color-primary-200', shade(palette.primary, 76));
  root.style.setProperty('--color-primary-300', shade(palette.primary, 48));
  root.style.setProperty('--color-primary-400', palette.primaryLight);
  root.style.setProperty('--color-primary-500', palette.primary);
  root.style.setProperty('--color-primary-600', shade(palette.primary, -18));
  root.style.setProperty('--color-primary-700', shade(palette.primary, -34));
  root.style.setProperty('--color-primary-800', shade(palette.primary, -52));
  root.style.setProperty('--color-primary-900', shade(palette.primary, -68));
  root.style.setProperty('--color-accent-400', palette.accent);
  root.style.setProperty('--color-accent-500', palette.accent);
  root.style.setProperty('--color-accent-600', shade(palette.accent, -22));
  root.style.setProperty('--ech-mascot-body', skin.bodyColor);
  root.style.setProperty('--ech-mascot-outfit', skin.outfitColor);

  const isDark = root.classList.contains('dark') || root.dataset.theme === 'dark';
  if (isDark) {
    root.style.setProperty('--ech-bg', palette.background);
    root.style.setProperty('--ech-surface', palette.surface);
  } else {
    root.style.removeProperty('--ech-bg');
    root.style.removeProperty('--ech-surface');
  }

  root.dataset.echSurface = settings.uiSurface;
  root.dataset.echSeasonal = String(settings.seasonalEffects);
}

export const customizationService = {
  accentPalettes,
  mascotSkins,
  applyCosmeticSettings,
};
