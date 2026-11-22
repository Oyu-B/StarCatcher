import { StyleSheet } from 'react-native';

export const COLORS = {
  bgDeep: '#05060F',
  bgMid: '#0B0E2A',
  bgCard: '#111630',
  bgCardAlt: '#161C3A',
  accent: '#4FC3F7',
  accentDim: '#1E3A5F',
  gold: '#FFD700',
  easy: '#22C55E',
  medium: '#4FC3F7',
  hard: '#EF4444',
  textPrimary: '#E8EEFF',
  textSecondary: '#8899CC',
  textMuted: '#445577',
  border: '#1E2D5A',
  danger: '#EF4444',
  success: '#22C55E',
};

export const FONTS = {
  xs: 11,
  sm: 13,
  base: 15,
  md: 17,
  lg: 20,
  xl: 24,
  xxl: 32,
  hero: 48,
};

export const SPACE = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
};

export const shared = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.bgDeep,
  },
  safeArea: {
    flex: 1,
  },
  card: {
    backgroundColor: COLORS.bgCard,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACE.lg,
  },
  sectionTitle: {
    color: COLORS.textSecondary,
    fontSize: FONTS.sm,
    fontWeight: '700',
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: SPACE.sm,
  },
  primaryButton: {
    backgroundColor: COLORS.accent,
    borderRadius: 18,
    paddingVertical: SPACE.md,
    paddingHorizontal: SPACE.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: {
    color: COLORS.bgDeep,
    fontSize: FONTS.lg,
    fontWeight: '800',
    letterSpacing: 0.4,
  },
});
