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
  sectionTitle: {
    ...typography.h4,
    color: '#333333',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: spacing.md,
  },
  settingsList: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F3F4',
  },
  lastSettingItem: {
    borderBottomWidth: 0,
  },
  settingLabel: {
    ...typography.body1,
    color: '#333333',
    fontSize: 16,
    fontWeight: '500',
    flex: 1,
  },
  toggleContainer: {
    marginLeft: spacing.sm,
  },
  // 로딩 상태
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  loadingText: {
    ...typography.body1,
    color: '#666666',
    marginTop: spacing.md,
  },
  updatingContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  // 에러 상태
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: spacing.lg,
  },
  errorText: {
    ...typography.body1,
    color: '#FF4444',
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  retryButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: 8,
  },
  retryButtonText: {
    ...typography.body1,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  // 스켈레톤 스타일
  skeletonItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F3F4',
  },
  skeletonText: {
    backgroundColor: '#E9ECEF',
    borderRadius: 4,
    height: 16,
  },
  skeletonTextWide: {
    backgroundColor: '#E9ECEF',
    borderRadius: 4,
    height: 16,
    width: '60%',
  },
  skeletonToggle: {
    backgroundColor: '#E9ECEF',
    borderRadius: 12,
    width: 44,
    height: 24,
  },
});
