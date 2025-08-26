// src/features/Profile/ui/styles/MyPageScreen.styles.ts
import {StyleSheet} from 'react-native';
import {typography, spacing} from '@app/styles';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    padding: spacing.md,
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    ...typography.h4,
    color: '#333333',
    fontSize: 18,
    fontWeight: '600',
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  languageContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  infoList: {
    marginTop: spacing.md,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    overflow: 'hidden',
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    padding: spacing.md,
    borderRadius: 12,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: spacing.md,
  },
  infoContainer: {
    flex: 1,
    marginRight: spacing.sm,
  },
  nickname: {
    ...typography.h3,
    color: '#333333',
    fontWeight: '600',
  },
  bio: {
    ...typography.body2,
    color: '#666666',
    marginTop: spacing.xs,
  },
  // 스켈레톤 스타일
  skeletonElement: {
    backgroundColor: '#e9ecef',
  },
  skeletonText: {
    backgroundColor: '#e9ecef',
    borderRadius: 4,
  },
});
