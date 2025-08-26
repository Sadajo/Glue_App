// src/features/Profile/ui/styles/LikedGroups.styles.ts
import {StyleSheet} from 'react-native';
import {
  semanticColors,
  typography,
  spacing,
  borderRadius,
  shadow,
} from '@app/styles';

export const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: semanticColors.background},
  list: {padding: spacing.md},
  likedCard: {
    backgroundColor: semanticColors.surface,
    padding: spacing.md,
    borderRadius: spacing.sm,
    marginBottom: spacing.sm,
  },
  likedTitle: {...typography.subtitle1, color: semanticColors.text},
  likedMeta: {...typography.body2, color: semanticColors.textSecondary},
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  loadingText: {
    ...typography.body1,
    color: semanticColors.textSecondary,
    marginTop: spacing.md,
    textAlign: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  errorIcon: {
    fontSize: 48,
    marginBottom: spacing.md,
  },
  errorTitle: {
    ...typography.h3,
    color: semanticColors.text,
    textAlign: 'center',
    marginBottom: spacing.sm,
    fontWeight: '600',
  },
  errorText: {
    ...typography.body1,
    color: semanticColors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
});
