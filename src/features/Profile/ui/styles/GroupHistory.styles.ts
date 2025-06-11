// src/features/Profile/ui/styles/GroupHistory.styles.ts
import { StyleSheet } from 'react-native';
import { semanticColors, typography, spacing, borderRadius, shadow } from '@app/styles';

export const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: semanticColors.background },
  list: { padding: spacing.md },
  filterContainer: { flexDirection: 'row', justifyContent: 'space-between', margin: spacing.md },
  filterButton: { padding: spacing.sm, borderRadius: spacing.xs },
  filterActive: { backgroundColor: semanticColors.primary },
  filterText: { ...typography.body1, color: semanticColors.text },
  historyCard: {
    backgroundColor: semanticColors.surface, padding: spacing.md,
    borderRadius: spacing.sm, marginBottom: spacing.sm,
  },
  historyTitle: { ...typography.subtitle1, color: semanticColors.text },
  historyMeta: { ...typography.body2, color: semanticColors.textSecondary, marginTop: spacing.xs },
  historyHost: { ...typography.caption, color: semanticColors.secondary, marginTop: spacing.xs },
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
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: semanticColors.surface,
    marginHorizontal: spacing.md,
    marginTop: spacing.md,
    borderRadius: spacing.xs,
    padding: spacing.xs,
  },
  tab: {
    flex: 1,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: spacing.xs,
    alignItems: 'center',
  },
  activeTab: {
    backgroundColor: semanticColors.primary,
  },
  tabText: {
    ...typography.body2,
    color: semanticColors.textSecondary,
  },
  activeTabText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
});