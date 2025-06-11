// src/features/Profile/ui/styles/LikedGroups.styles.ts
import { StyleSheet } from 'react-native';
import { semanticColors, typography, spacing, borderRadius, shadow } from '@app/styles';

export const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: semanticColors.background },
  list: { padding: spacing.md },
  likedCard: {
    backgroundColor: semanticColors.surface, padding: spacing.md,
    borderRadius: spacing.sm, marginBottom: spacing.sm,
  },
  likedTitle: { ...typography.subtitle1, color: semanticColors.text },
  likedMeta: { ...typography.body2, color: semanticColors.textSecondary },
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
  errorText: {
    ...typography.body1,
    color: semanticColors.error,
    textAlign: 'center',
  },
});