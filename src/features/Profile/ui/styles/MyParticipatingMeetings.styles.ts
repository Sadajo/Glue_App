// src/features/Profile/ui/styles/MyParticipatingMeetings.styles.ts
import { StyleSheet, Dimensions } from 'react-native';
import { semanticColors, typography, spacing } from '@app/styles';

const { width } = Dimensions.get('window');
const cardWidth = (width - spacing.md * 3) / 2; // 좌우 패딩과 카드 간격을 고려한 너비

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: semanticColors.background,
  },
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
  list: {
    padding: spacing.md,
  },
  row: {
    justifyContent: 'space-between',
  },
  meetingCard: {
    width: cardWidth,
    backgroundColor: semanticColors.surface,
    borderRadius: spacing.sm,
    marginBottom: spacing.md,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  meetingImage: {
    width: '100%',
    height: 120,
    backgroundColor: '#F5F5F5',
  },
  meetingInfo: {
    padding: spacing.sm,
  },
  meetingTitle: {
    ...typography.subtitle2,
    color: semanticColors.text,
    marginBottom: spacing.xs,
    lineHeight: 20,
  },
  participantCount: {
    ...typography.caption,
    color: semanticColors.textSecondary,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  emptyText: {
    ...typography.body1,
    color: semanticColors.textSecondary,
    textAlign: 'center',
  },
});